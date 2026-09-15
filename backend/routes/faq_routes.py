from collections import Counter, defaultdict

from flask import Blueprint, jsonify, request

from services import data_store
from services.ai_client import ask_json

bp = Blueprint("faq", __name__)

FAQ_LIST_SYSTEM_PROMPT = """당신은 경영지원 서비스의 상담 데이터를 분석하는 AI입니다.
이미 순위가 매겨진 반복 문의 목록(번호 붙임)이 주어집니다. 각 항목에 대해 "FAQ 추천 이유"를 한 문장으로 작성하세요.

원칙:
- 주어진 건수 정보만 근거로 작성한다. 새로운 수치나 정책을 만들어내지 않는다.
- 반복 빈도가 높을수록 더 강한 추천 이유를 작성한다.

출력 JSON 형식 (입력과 동일한 개수, 동일한 순서의 배열이어야 한다):
{
  "reasons": ["1번 항목 추천 이유", "2번 항목 추천 이유", ...]
}
"""

FAQ_DRAFT_SYSTEM_PROMPT = """당신은 경영지원 서비스 담당자를 돕는 AI입니다.
역할: 기존 담당자들이 실제로 제공했던 답변들을 바탕으로 FAQ 초안을 작성합니다.

원칙:
- 기존 담당자 답변의 내용을 벗어나 새로운 회사 정책이나 정보를 임의로 생성하지 않는다.
- 여러 답변에 공통적으로 나타나는 내용을 종합하여 하나의 자연스러운 답변으로 재구성한다.
- 답변은 직원이 이해하기 쉬운 존댓말 문장으로 작성한다.

출력 JSON 형식:
{
  "question": "FAQ 질문 (직원 관점의 자연스러운 질문 문장)",
  "answer": "기존 답변들을 종합한 FAQ 답변"
}
"""


def _period_arg(body):
    return body.get("period", "30days")


def _period_label(period: str) -> str:
    days = data_store.parse_period_days(period)
    return f"{days}일"


@bp.route("/api/faq", methods=["POST"])
def faq_analysis():
    body = request.get_json(force=True) or {}
    period = _period_arg(body)
    rows = data_store.get_consultations_within(period)

    total = len(rows)

    topic_counter = Counter((c["category"], c["topic"]) for c in rows)
    category_counter = Counter(c["category"] for c in rows)
    # 같은 topic의 "첫 문의"는 반복이 아니므로 제외하고, 두 번째 이후 문의만 반복 문의로 집계한다.
    repeated = sum(count - 1 for count in topic_counter.values() if count >= 2)

    top_topics = topic_counter.most_common(6)
    period_label = _period_label(period)

    reasons = []
    if top_topics:
        numbered_lines = "\n".join(
            f"{i + 1}. {topic} ({category}): {count}건" for i, ((category, topic), count) in enumerate(top_topics)
        )
        try:
            ai_result = ask_json(
                FAQ_LIST_SYSTEM_PROMPT,
                f"최근 {period_label} 반복 문의 순위:\n{numbered_lines}",
            )
            candidate_reasons = ai_result.get("reasons", [])
            if isinstance(candidate_reasons, list) and len(candidate_reasons) == len(top_topics):
                reasons = candidate_reasons
        except Exception:
            reasons = []

    faq_candidates = []
    for i, ((category, topic), count) in enumerate(top_topics):
        has_answer = any(c["category"] == category and c["topic"] == topic and c.get("answer") for c in rows)
        reason = reasons[i] if i < len(reasons) else f"최근 {period_label} 동안 {count}건의 유사 문의가 반복적으로 발생했습니다."
        faq_candidates.append({
            "title": topic,
            "category": category,
            "count": count,
            "reason": reason,
            "hasExistingAnswer": has_answer,
        })

    category_distribution = [
        {"category": category, "count": count}
        for category, count in category_counter.most_common()
    ]

    return jsonify({
        "totalConsultations": total,
        "repeatedConsultations": repeated,
        "faqCandidateCount": len(faq_candidates),
        "categoryDistribution": category_distribution,
        "faqCandidates": faq_candidates,
    })


@bp.route("/api/faq/draft", methods=["POST"])
def faq_draft():
    body = request.get_json(force=True) or {}
    category = body.get("category")
    topic = body.get("title") or body.get("topic")
    period = _period_arg(body)

    if not topic:
        return jsonify({"error": "topic(title)은 필수입니다."}), 400

    rows = data_store.get_consultations_within(period)
    matched = [c for c in rows if c["topic"] == topic and (category is None or c["category"] == category)]

    if not matched:
        return jsonify({"error": "해당 주제의 상담 데이터를 찾을 수 없습니다."}), 404

    matched.sort(key=lambda c: c["date"], reverse=True)
    answers = list({c["answer"] for c in matched if c.get("answer")})
    representative_question = Counter(c["question"] for c in matched).most_common(1)[0][0]

    answers_text = "\n".join(f"- {a}" for a in answers)
    user_content = f"""FAQ 후보 주제: {topic} ({category})
대표 문의: {representative_question}

기존 담당자 답변 목록 (중복 제거):
{answers_text}
"""
    ai_result = ask_json(FAQ_DRAFT_SYSTEM_PROMPT, user_content)

    recent_5 = matched[:5]
    return jsonify({
        "question": ai_result.get("question", representative_question),
        "answer": ai_result.get("answer", ""),
        "referenceCount": len(matched),
        "recentCount": len(recent_5),
        "answeredCount": sum(1 for c in matched if c.get("answer")),
        "recentConsultations": [
            {"date": c["date"], "question": c["question"]} for c in recent_5
        ],
    })


@bp.route("/api/faq/register", methods=["POST"])
def faq_register():
    body = request.get_json(force=True) or {}
    category = body.get("category", "")
    topic = body.get("topic", "")
    question = (body.get("question") or "").strip()
    answer = (body.get("answer") or "").strip()

    if not question or not answer:
        return jsonify({"error": "question과 answer는 필수입니다."}), 400

    entry = data_store.append_registered_faq({
        "category": category,
        "topic": topic,
        "question": question,
        "answer": answer,
    })
    return jsonify(entry)
