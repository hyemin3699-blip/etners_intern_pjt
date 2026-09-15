from flask import Blueprint, jsonify, request

from services import data_store
from services.ai_client import ask_json

bp = Blueprint("evidence", __name__)

EVIDENCE_SEARCH_SYSTEM_PROMPT = """당신은 경영지원 서비스 담당자를 돕는 AI 근거자료 검색 어시스턴트입니다.
역할: 직원 문의 내용과 가장 관련성이 높은 근거자료 조항을 찾아, 그 근거가 되는 문장을 제시합니다.

원칙:
- 반드시 제공된 "등록된 근거자료 목록"에 있는 내용만 근거로 사용한다. 목록에 없는 내용, 숫자, 정책을 새로 만들어내지 않는다.
- 문의와 관련성이 낮으면 포함하지 않는다. 관련 근거자료가 전혀 없으면 documents를 빈 배열로 반환한다.
- evidence는 반드시 해당 항목의 "내용"에서 그대로 발췌한 문장이어야 한다. 요약하거나 새로 문장을 만들지 않는다.
- 관련도가 높은 순으로 최대 3건까지만 선택한다.
- index는 목록에 표시된 대괄호 숫자를 그대로 사용한다.

출력 JSON 형식:
{
  "documents": [
    {"index": 0, "evidence": "내용에서 그대로 발췌한 근거 문장", "relevance": 0.97}
  ]
}
"""


@bp.route("/api/companies", methods=["GET"])
def companies():
    return jsonify(data_store.get_companies())


@bp.route("/api/evidence", methods=["GET"])
def list_evidence():
    scope = request.args.get("scope")
    company = request.args.get("company")
    category = request.args.get("category")
    if scope == "company" and not company:
        return jsonify({"error": "scope=company일 때는 company가 필수입니다."}), 400
    return jsonify(data_store.get_evidence_documents(scope, company, category))


@bp.route("/api/evidence/<int:document_id>", methods=["GET"])
def get_evidence_detail(document_id):
    doc = data_store.get_evidence_document(document_id)
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify(doc)


@bp.route("/api/evidence/upload", methods=["POST"])
def upload_evidence():
    body = request.get_json(force=True) or {}
    scope = body.get("scope", "company")
    company = body.get("company")
    category = body.get("category")
    name = (body.get("name") or "").strip()
    description = body.get("description", "")
    file_name = body.get("fileName")

    if scope not in ("common", "company"):
        return jsonify({"error": "scope는 common 또는 company여야 합니다."}), 400
    if scope == "company" and not company:
        return jsonify({"error": "고객사 자료는 company가 필수입니다."}), 400
    if not category or not name:
        return jsonify({"error": "category, name은 필수입니다."}), 400
    if category not in data_store.EVIDENCE_CATEGORIES:
        return jsonify({"error": "지원하지 않는 분류입니다."}), 400

    entry = data_store.add_evidence_document(scope, category, name, company, description, file_name)
    return jsonify(entry), 201


@bp.route("/api/evidence/<int:document_id>", methods=["DELETE"])
def delete_evidence(document_id):
    ok = data_store.delete_evidence_document(document_id)
    if not ok:
        return jsonify({"error": "not found"}), 404
    return jsonify({"deleted": document_id})


@bp.route("/api/evidence/search", methods=["POST"])
def search_evidence():
    body = request.get_json(force=True) or {}
    company = body.get("company")
    question = body.get("question", "")

    if not company or not question:
        return jsonify({"error": "company와 question은 필수입니다."}), 400

    sections = data_store.get_evidence_sections_for_company(company)
    if not sections:
        return jsonify({"documents": []})

    numbered = "\n\n".join(
        f"[{i}] 문서: {s['documentName']} (분류: {s['category']}) / p.{s['page']} / {s['section']}\n내용: {s['content']}"
        for i, s in enumerate(sections)
    )
    user_content = f"직원 문의:\n{question}\n\n등록된 근거자료 목록:\n{numbered}"

    try:
        result = ask_json(EVIDENCE_SEARCH_SYSTEM_PROMPT, user_content)
    except Exception:
        return jsonify({"documents": []})

    raw_matches = result.get("documents", [])
    if not isinstance(raw_matches, list):
        raw_matches = []

    documents = []
    for m in raw_matches:
        idx = m.get("index")
        if not isinstance(idx, int) or idx < 0 or idx >= len(sections):
            continue
        s = sections[idx]
        evidence_text = m.get("evidence") or ""
        # AI가 원문을 벗어난 문장을 근거로 제시하지 않도록, 내용에 실제로 포함된 경우에만 그대로 쓴다.
        if evidence_text not in s["content"]:
            evidence_text = s["content"]
        documents.append({
            "documentId": s["documentId"],
            "documentName": s["documentName"],
            "category": s["category"],
            "page": s["page"],
            "section": s["section"],
            "evidence": evidence_text,
            "relevance": m.get("relevance", 0.8) if isinstance(m.get("relevance"), (int, float)) else 0.8,
        })

    documents.sort(key=lambda d: d["relevance"], reverse=True)
    return jsonify({"documents": documents[:3]})
