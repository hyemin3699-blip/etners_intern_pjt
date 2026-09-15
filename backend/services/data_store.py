import json
import os
from datetime import date, timedelta
from pathlib import Path

import psycopg2
import psycopg2.extras

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


def _db_connect():
    return psycopg2.connect(os.environ["DATABASE_URL"], cursor_factory=psycopg2.extras.RealDictCursor)


def get_registered_faqs():
    conn = _db_connect()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM registered_faqs ORDER BY id DESC")
            return cur.fetchall()
    finally:
        conn.close()


def append_registered_faq(entry: dict) -> dict:
    conn = _db_connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO registered_faqs (category, topic, question, answer)
                VALUES (%(category)s, %(topic)s, %(question)s, %(answer)s)
                RETURNING *
                """,
                entry,
            )
            saved = cur.fetchone()
        conn.commit()
        return saved
    finally:
        conn.close()


def parse_period_days(period: str) -> int:
    digits = "".join(ch for ch in period if ch.isdigit())
    return int(digits) if digits else 30


def get_consultations_within(period: str):
    days = parse_period_days(period)
    cutoff = date.today() - timedelta(days=days)
    # Mock 데이터의 기준일(2026-09-15)에 맞춰 최신 데이터가 항상 포함되도록 데이터 내 최댓날짜를 기준으로 삼는다.
    all_rows = get_consultations()
    if not all_rows:
        return []
    latest = max(date.fromisoformat(c["date"]) for c in all_rows)
    cutoff = latest - timedelta(days=days)
    return [c for c in all_rows if date.fromisoformat(c["date"]) >= cutoff]
