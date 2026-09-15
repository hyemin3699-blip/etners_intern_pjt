from flask import Blueprint, jsonify, request

from services import data_store
from services.ai_client import ask_json

bp = Blueprint("context", __name__)

SYSTEM_PROMPT = """당신은 경영지원 서비스 담당자를 돕는 AI 업무지원 어시스턴트입니다.
역할: 현재 문의와 해당 직원의 과거 상담 이력을 비교하여, 담당자가 상담을 준비하는 데 필요한 Context를 제공합니다.

원칙:
- 상담 데이터에 존재하지 않는 정보를 생성하지 않는다.
- 회사 정책을 임의로 판단하지 않는다.
- 현재 문의와 관련성이 높은 과거 문의 위주로 요약한다.
- 과거 상담 이력이 없다면 그 사실을 그대로 알린다.

출력 JSON 형식:
{
  "summary": "과거 문의 경향에 대한 1~2문장 요약",
  "recentConsultations": [{"date": "YYYY-MM-DD", "question": "문의 내용"}],
  "relatedConsultation": "현재 문의와 가장 관련성 높은 과거 문의 1건에 대한 설명 (없으면 빈 문자열)",
  "note": "담당자가 참고해야 할 사항 1~2문장"
}
"""


@bp.route("/api/context", methods=["POST"])
def get_context():
    body = request.get_json(force=True) or {}
    employee_id = body.get("employeeId")
    question = body.get("question", "")

    if employee_id is None or not question:
        return jsonify({"error": "employeeId와 question은 필수입니다."}), 400

    employee = data_store.get_employee(employee_id)
    history = data_store.get_consultations_by_employee(employee_id)[:10]

    if not history:
        return jsonify({
            "summary": "이 직원의 과거 상담 이력이 없습니다.",
            "recentConsultations": [],
            "relatedConsultation": "",
            "note": "과거 이력이 없으므로 신규 문의로 처리하면 됩니다.",
        })

    history_text = "\n".join(
        f"- {c['date']} [{c['category']}/{c['topic']}] Q: {c['question']} / A: {c['answer']}"
        for c in history
    )
    user_content = f"""고객: {employee['name'] if employee else employee_id} ({employee['company'] if employee else '소속사 미상'})

현재 문의:
{question}

과거 상담 이력 (최신순, 최대 10건):
{history_text}
"""

    result = ask_json(SYSTEM_PROMPT, user_content)
    return jsonify(result)
