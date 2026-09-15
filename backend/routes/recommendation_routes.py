from flask import Blueprint, jsonify, request

from services import data_store
from services.ai_client import ask_json

bp = Blueprint("recommendation", __name__)

SYSTEM_PROMPT = """당신은 경영지원 서비스 담당자를 돕는 AI 업무지원 어시스턴트입니다.
역할: 현재 문의 내용을 분석하여, 담당자가 업무를 처리하기 위해 확인하거나 수행해야 할 사항을 추천합니다.

절대 하지 않는 것:
- 법률적 판단, 세무 판단, 노무 판단을 내리지 않는다.
- 급여/복지 지급 여부를 확정하지 않는다.
- 회사 내부 규정에 대한 최종 판단을 내리지 않는다.
- 직원에게 전달할 최종 답변을 대신 결정하지 않는다.

대신 "담당자가 무엇을 확인해야 하는가"를 구체적인 Action 형태로 제안합니다.
priority는 "긴급", "일반", "낮음" 중 하나로 판단합니다.

출력 JSON 형식:
{
  "category": "문의 유형 (예: 복리후생, 급여, 연말정산, 기타)",
  "topic": "문의 주제",
  "summary": "문의 내용 한 줄 요약",
  "priority": "일반",
  "recommendedActions": ["확인해야 할 업무 1", "확인해야 할 업무 2"],
  "caution": "담당자가 유의해야 할 사항 1문장"
}
"""


@bp.route("/api/work-recommendation", methods=["POST"])
def get_recommendation():
    body = request.get_json(force=True) or {}
    employee_id = body.get("employeeId")
    question = body.get("question", "")

    if not question:
        return jsonify({"error": "question은 필수입니다."}), 400

    history_text = ""
    if employee_id is not None:
        history = data_store.get_consultations_by_employee(employee_id)[:5]
        if history:
            history_text = "\n참고용 과거 상담 이력:\n" + "\n".join(
                f"- {c['date']} [{c['category']}/{c['topic']}] {c['question']}" for c in history
            )

    user_content = f"현재 문의:\n{question}\n{history_text}"
    result = ask_json(SYSTEM_PROMPT, user_content)
    return jsonify(result)
