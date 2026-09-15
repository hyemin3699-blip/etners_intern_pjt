import json
from datetime import date, datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_json(filename):
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def get_employees():
    return load_json("employees.json")


def get_consultations():
    return load_json("consultations.json")


def get_inquiries():
    return load_json("inquiries.json")


def get_inquiries_with_employee():
    employees_by_id = {e["id"]: e for e in get_employees()}
    result = []
    for inquiry in get_inquiries():
        employee = employees_by_id.get(inquiry["employeeId"], {})
        result.append({
            **inquiry,
            "name": employee.get("name", "알 수 없음"),
            "company": employee.get("company", ""),
        })
    return result


def get_employee(employee_id):
    for e in get_employees():
        if e["id"] == employee_id:
            return e
    return None


def get_consultations_by_employee(employee_id, exclude_ids=None):
    exclude_ids = exclude_ids or set()
    rows = [c for c in get_consultations() if c["employeeId"] == employee_id and c["id"] not in exclude_ids]
    return sorted(rows, key=lambda c: c["date"], reverse=True)


# FAQ 등록 목록도 근거자료와 동일하게 Mock JSON 구조로 관리한다 (DATABASE_URL 없이 동작).
def _registered_faqs_file_path():
    return DATA_DIR / "registered_faqs.json"


def get_registered_faqs_raw():
    path = _registered_faqs_file_path()
    if not path.exists():
        return []
    return load_json("registered_faqs.json")


def _save_registered_faqs(rows):
    with open(_registered_faqs_file_path(), "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)


def get_registered_faqs(scope=None, company=None):
    rows = get_registered_faqs_raw()
    if scope == "common":
        rows = [r for r in rows if not r.get("company")]
    elif scope == "company":
        rows = [r for r in rows if r.get("company") == company]
    return sorted(rows, key=lambda r: r["createdAt"], reverse=True)


def append_registered_faq(entry: dict) -> dict:
    rows = get_registered_faqs_raw()
    new_id = max((r["id"] for r in rows), default=0) + 1
    saved = {
        "id": new_id,
        "company": entry.get("company"),
        "category": entry.get("category", ""),
        "topic": entry.get("topic", ""),
        "question": entry["question"],
        "answer": entry["answer"],
        "createdAt": datetime.now().isoformat(),
    }
    rows.append(saved)
    _save_registered_faqs(rows)
    return saved


def delete_registered_faq(faq_id):
    rows = get_registered_faqs_raw()
    remaining = [r for r in rows if r["id"] != faq_id]
    if len(remaining) == len(rows):
        return False
    _save_registered_faqs(remaining)
    return True


def parse_period_days(period: str) -> int:
    digits = "".join(ch for ch in period if ch.isdigit())
    return int(digits) if digits else 30


def get_consultations_within(period: str, company=None):
    days = parse_period_days(period)
    # Mock 데이터의 기준일(2026-09-15)에 맞춰 최신 데이터가 항상 포함되도록 데이터 내 최댓날짜를 기준으로 삼는다.
    all_rows = get_consultations()
    if not all_rows:
        return []
    latest = max(date.fromisoformat(c["date"]) for c in all_rows)
    cutoff = latest - timedelta(days=days)
    rows = [c for c in all_rows if date.fromisoformat(c["date"]) >= cutoff]
    if company:
        employees_by_id = {e["id"]: e for e in get_employees()}
        rows = [c for c in rows if employees_by_id.get(c["employeeId"], {}).get("company") == company]
    return rows


# 근거자료는 실제 DB 없이 Mock JSON 구조를 그대로 유지한다 (registered_faqs와 달리
# Postgres를 쓰지 않는 이유: 요청서가 "실제 DB는 구축하지 않는다"를 명시하고 있고,
# 로컬 실행 시 DATABASE_URL 없이도 시연/테스트가 가능해야 하기 때문).
EVIDENCE_CATEGORIES = ["급여", "복리후생", "연말정산", "기타"]


def get_companies():
    return sorted({e["company"] for e in get_employees()})


def _evidence_file_path():
    return DATA_DIR / "evidence_documents.json"


def get_evidence_documents_raw():
    path = _evidence_file_path()
    if not path.exists():
        return []
    return load_json("evidence_documents.json")


def _save_evidence_documents(docs):
    with open(_evidence_file_path(), "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)


def _strip_sections(doc):
    return {
        "id": doc["id"],
        "scope": doc.get("scope", "company"),
        "company": doc.get("company"),
        "category": doc["category"],
        "name": doc["name"],
        "description": doc.get("description", ""),
        "fileName": doc.get("fileName", doc["name"]),
        "uploadedAt": doc["uploadedAt"],
        "sectionCount": len(doc.get("sections", [])),
    }


def get_evidence_documents(scope=None, company=None, category=None):
    docs = get_evidence_documents_raw()
    if scope:
        docs = [d for d in docs if d.get("scope", "company") == scope]
    if company:
        docs = [d for d in docs if d.get("company") == company]
    if category:
        docs = [d for d in docs if d["category"] == category]
    docs = sorted(docs, key=lambda d: d["uploadedAt"], reverse=True)
    return [_strip_sections(d) for d in docs]


def get_evidence_document(document_id):
    for d in get_evidence_documents_raw():
        if d["id"] == document_id:
            return d
    return None


def add_evidence_document(scope, category, name, company=None, description="", file_name=None):
    docs = get_evidence_documents_raw()
    new_id = max((d["id"] for d in docs), default=0) + 1
    entry = {
        "id": new_id,
        "scope": scope,
        "company": company if scope == "company" else None,
        "category": category,
        "name": name,
        "description": description or "",
        "fileName": file_name or name,
        "uploadedAt": date.today().isoformat(),
        "sections": [],
    }
    docs.append(entry)
    _save_evidence_documents(docs)
    return _strip_sections(entry)


def delete_evidence_document(document_id):
    docs = get_evidence_documents_raw()
    remaining = [d for d in docs if d["id"] != document_id]
    if len(remaining) == len(docs):
        return False
    _save_evidence_documents(remaining)
    return True


def get_evidence_sections_for_company(company):
    # 회사 전용 근거자료뿐 아니라, 회사와 무관한 공통 자료(응대 매뉴얼 등)도
    # AI 근거자료 검색 대상에 함께 포함시킨다.
    sections = []
    for d in get_evidence_documents_raw():
        is_common = d.get("scope", "company") == "common"
        if not is_common and d.get("company") != company:
            continue
        for s in d.get("sections", []):
            sections.append({
                "documentId": d["id"],
                "documentName": d["name"],
                "category": d["category"],
                "page": s["page"],
                "section": s["section"],
                "content": s["content"],
            })
    return sections
