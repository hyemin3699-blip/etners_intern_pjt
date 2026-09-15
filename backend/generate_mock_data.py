"""
Mock 상담/고객/상담신청 데이터 생성 스크립트.
실행: python generate_mock_data.py
결과: data/employees.json, data/consultations.json, data/inquiries.json
"""
import json
import random
from datetime import date, timedelta

random.seed(42)

TODAY = date(2026, 9, 15)

# 매미챗은 여러 고객사의 임직원이 함께 사용하는 서비스이므로,
# 상담 신청자는 회사(고객사) 소속으로 구분해서 관리한다.
NAMES = [
    "김민수", "이서연", "박지훈", "최유진", "정하늘", "강도윤", "윤서아", "임재현",
    "한소율", "오태양", "서지우", "문가은", "배준호", "장예은", "신동혁", "권나윤",
    "홍성민", "유채원", "노건우", "송미래",
]
COMPANIES = [
    "그린테크놀로지", "블루오션물산", "한빛시스템", "대한전자통신",
    "미래산업개발", "성원바이오", "코스모스푸드", "센트럴로지스틱스",
]

# 카테고리 -> [(topic, 목표 건수, [(질문 예시, 답변 예시), ...])]
TOPIC_PLAN = [
    ("복리후생", "복지포인트 지급 기준", 37, [
        ("복지포인트는 어떤 기준으로 지급되나요?", "복지포인트는 재직 기간과 직급에 따라 매년 1월에 일괄 지급되며, 세부 지급 기준은 사내 복리후생 규정 3조를 참고해 주세요."),
        ("복지포인트 지급 기준이 궁금합니다.", "복지포인트는 연 1회, 근속연수에 따라 차등 지급됩니다. 자세한 등급표는 사내 인트라넷 복리후생 게시판에서 확인하실 수 있습니다."),
        ("올해 복지포인트는 언제, 얼마나 나오나요?", "올해 복지포인트는 1월 지급 기준 변경 없이 기존과 동일하게 근속연수 기준으로 지급되었습니다."),
    ]),
    ("복리후생", "복지포인트 사용처", 16, [
        ("복지포인트는 어디서 사용할 수 있나요?", "복지포인트는 사내 지정 복지몰과 제휴 병원, 도서 구입처에서 사용 가능합니다."),
        ("복지포인트 사용 가능 항목이 궁금해요.", "복지포인트는 의료, 자기계발, 여가 항목에 한해 사용 가능하며 유흥 관련 업종은 제외됩니다."),
    ]),
    ("복리후생", "건강검진 신청 방법", 29, [
        ("건강검진은 어떻게 신청하나요?", "건강검진은 사내 포털의 복리후생 메뉴에서 희망 병원과 일정을 선택해 신청하시면 됩니다."),
        ("건강검진 신청 방법 알려주세요.", "건강검진 신청은 매년 상반기 중 사내 포털에서 가능하며, 신청 후 지정 병원에서 예약을 진행하시면 됩니다."),
        ("종합검진 신청 절차가 궁금합니다.", "종합검진은 근속 3년 이상부터 신청 가능하며, 포털 신청 후 인사팀 승인을 거쳐 예약이 확정됩니다."),
    ]),
    ("복리후생", "경조금 신청 방법", 18, [
        ("경조금은 어떻게 신청하나요?", "경조금은 경조사 발생일로부터 30일 이내에 증빙서류와 함께 인사팀에 신청하시면 지급됩니다."),
        ("결혼 경조금 신청 절차 알려주세요.", "결혼 경조금은 청첩장 또는 혼인관계증명서를 첨부하여 사내 포털에서 신청하시면 됩니다."),
    ]),
    ("복리후생", "육아휴직 복지제도", 21, [
        ("육아휴직 중에도 복지포인트를 받을 수 있나요?", "육아휴직 기간에도 재직 상태가 유지되므로 복지포인트는 동일하게 지급됩니다. 다만 사용 기한은 복직 후 3개월까지 연장됩니다."),
        ("육아휴직 중 복지제도 적용 여부가 궁금합니다.", "육아휴직 중에도 4대 보험 및 복리후생 대부분이 그대로 유지되며, 세부 항목은 인사팀 안내자료를 참고해 주세요."),
        ("육아휴직자도 건강검진 대상인가요?", "육아휴직 중인 직원도 재직자로 분류되어 건강검진 대상에 포함됩니다."),
    ]),
    ("급여", "급여 지급일", 14, [
        ("이번 달 급여는 언제 들어오나요?", "급여는 매월 25일에 지급되며, 25일이 휴일인 경우 직전 영업일에 지급됩니다."),
        ("급여 지급일이 정확히 언제인가요?", "급여 지급일은 매월 25일로 고정되어 있습니다."),
    ]),
    ("급여", "급여명세서 확인", 12, [
        ("급여명세서는 어디서 확인하나요?", "급여명세서는 사내 포털의 급여 메뉴에서 매월 확인 및 다운로드 가능합니다."),
        ("지난달 급여명세서를 다시 보고 싶어요.", "급여명세서는 최근 12개월치가 포털에 보관되어 있어 언제든 다시 조회 가능합니다."),
    ]),
    ("급여", "연장근무 수당", 15, [
        ("연장근무 수당은 어떻게 계산되나요?", "연장근무 수당은 통상임금의 1.5배로 계산되며, 사전 승인된 연장근무에 한해 지급됩니다."),
        ("야근 수당 지급 기준이 궁금합니다.", "야근 수당은 통상임금 기준 1.5배이며, 근태 시스템에 등록된 승인 내역을 기준으로 산정됩니다."),
    ]),
    ("급여", "급여 관련 증빙", 9, [
        ("재직증명서는 어디서 발급하나요?", "재직증명서는 사내 포털의 증명서 발급 메뉴에서 즉시 발급 가능합니다."),
        ("급여 관련 증빙서류가 필요한데 어디서 받나요?", "급여 관련 증빙서류는 포털의 증명서 발급 메뉴 또는 인사팀 문의를 통해 받으실 수 있습니다."),
    ]),
    ("연말정산", "간소화 자료", 19, [
        ("연말정산 간소화 자료는 언제 제출하나요?", "국세청 간소화 자료는 매년 1월 중순부터 제출 가능하며, 마감일은 1월 말입니다."),
        ("간소화 자료 제출 방법이 궁금합니다.", "간소화 자료는 홈택스에서 다운로드 후 사내 연말정산 시스템에 업로드하시면 됩니다."),
    ]),
    ("연말정산", "부양가족 등록", 11, [
        ("부양가족 공제는 어떻게 등록하나요?", "부양가족 공제는 연말정산 시스템에서 가족관계증명서와 함께 등록하시면 됩니다."),
        ("부양가족 추가는 어디서 하나요?", "부양가족 등록/변경은 연말정산 기간 중 사내 시스템에서 가능합니다."),
    ]),
    ("연말정산", "의료비 공제", 13, [
        ("의료비 공제는 어떻게 신청하나요?", "의료비 공제는 국세청 간소화 자료에 자동 반영되며, 누락분은 영수증을 첨부해 별도 신청 가능합니다."),
    ]),
    ("연말정산", "교육비 공제", 8, [
        ("자녀 교육비 공제 신청 방법이 궁금해요.", "교육비 공제는 간소화 자료 반영분 외 누락 시 납입증명서를 첨부하여 신청하시면 됩니다."),
    ]),
    ("연말정산", "기부금 공제", 6, [
        ("기부금 공제는 어떻게 처리되나요?", "기부금 공제는 기부금 영수증을 연말정산 시스템에 업로드하시면 자동 반영됩니다."),
    ]),
    ("기타", "사내 동호회 지원", 7, [
        ("동호회 지원금은 어떻게 신청하나요?", "동호회 지원금은 분기별로 활동 보고서를 제출하면 지급됩니다."),
    ]),
    ("기타", "사무용품 신청", 6, [
        ("사무용품은 어디서 신청하나요?", "사무용품은 사내 포털의 총무 메뉴에서 신청 가능하며 익일 배송됩니다."),
    ]),
    ("기타", "주차 등록", 5, [
        ("회사 주차 등록은 어떻게 하나요?", "주차 등록은 총무팀에 차량번호를 제출하시면 익일부터 적용됩니다."),
    ]),
]

DEPARTMENTS = ["개발팀", "인사팀", "영업팀", "총무팀", "재무팀", "마케팅팀"]

employees = [
    {
        "id": 101 + i,
        "name": NAMES[i],
        "company": COMPANIES[i % len(COMPANIES)],
        "department": DEPARTMENTS[i % len(DEPARTMENTS)],
        "employeeNo": str(20260000 + 101 + i),
        "consultationCount": 0,
    }
    for i in range(len(NAMES))
]
emp_ids = [e["id"] for e in employees]

consultations = []
cid = 1

# 101번 직원(김민수)의 데모용 반복 문의 이력을 스펙 예시와 동일하게 고정 생성
demo_history = [
    (date(2026, 7, 12), "복리후생", "육아휴직 복지제도", "육아휴직 관련 복지제도가 궁금합니다.",
     "육아휴직 중에도 4대 보험 및 복리후생 대부분이 그대로 유지되며, 세부 항목은 인사팀 안내자료를 참고해 주세요."),
    (date(2026, 8, 25), "복리후생", "복지포인트 지급 기준", "복지포인트 지급 시기가 언제인가요?",
     "복지포인트는 매년 1월 일괄 지급되며, 육아휴직 등 휴직자도 재직 상태 유지 시 동일하게 지급됩니다."),
    (date(2026, 9, 10), "복리후생", "복지포인트 사용처", "복지포인트 사용 가능 항목이 궁금합니다.",
     "복지포인트는 의료, 자기계발, 여가 항목에 한해 사용 가능하며 사용 기한은 복직 후 3개월까지 연장됩니다."),
]
for d, cat, topic, q, a in demo_history:
    consultations.append({
        "id": cid, "employeeId": 101, "date": d.isoformat(),
        "category": cat, "topic": topic, "question": q, "answer": a, "status": "completed",
    })
    cid += 1

for category, topic, count, qa_pairs in TOPIC_PLAN:
    for _ in range(count):
        days_ago = random.randint(0, 45)
        d = TODAY - timedelta(days=days_ago)
        q, a = random.choice(qa_pairs)
        emp_id = random.choice(emp_ids)
        consultations.append({
            "id": cid, "employeeId": emp_id, "date": d.isoformat(),
            "category": category, "topic": topic, "question": q, "answer": a, "status": "completed",
        })
        cid += 1

consultations.sort(key=lambda c: c["date"], reverse=True)

for e in employees:
    e["consultationCount"] = sum(1 for c in consultations if c["employeeId"] == e["id"])

# 담당자에게 접수되어 처리를 기다리는 상담 신청 목록 (담당자가 목록에서 선택해서 처리한다)
# "대기" 상태는 아직 상담이 시작되지 않았으므로 고객이 처음 보낸 문의 한 건만 존재하고,
# "진행중"/"완료" 상태는 담당자와 실제로 주고받은 대화 이력(conversation)을 함께 제공한다.
inquiries = [
    {"id": 1, "employeeId": 101, "question": "육아휴직 중인데 복지포인트를 받을 수 있나요?",
     "category": "복리후생", "topic": "복지포인트", "receivedAt": "2026-09-15", "status": "대기",
     "documentType": "parental_leave"},
    {"id": 2, "employeeId": 103, "question": "이번 달 종합검진 예약을 아직 못 했는데 지금도 신청할 수 있나요?",
     "category": "복리후생", "topic": "건강검진 신청 방법", "receivedAt": "2026-09-15", "status": "대기"},
    {"id": 3, "employeeId": 107, "question": "결혼식이 다음 주인데 경조금은 언제까지 신청해야 하나요?",
     "category": "복리후생", "topic": "경조금 신청 방법", "receivedAt": "2026-09-14", "status": "대기",
     "documentType": "family_event"},
    {"id": 4, "employeeId": 105, "question": "연장근무 수당이 이번 달 급여에 반영이 안 된 것 같아요.",
     "category": "급여", "topic": "연장근무 수당", "receivedAt": "2026-09-14", "status": "진행중",
     "documentType": "overtime",
     "conversation": [
         {"from": "customer", "text": "연장근무 수당이 이번 달 급여에 반영이 안 된 것 같아요."},
         {"from": "agent", "text": "안녕하세요, 확인해보겠습니다. 혹시 연장근무하신 날짜를 알려주실 수 있을까요?"},
         {"from": "customer", "text": "9월 2일이랑 9월 5일에 각각 2시간씩 야근했습니다."},
         {"from": "agent", "text": "근태 시스템에서 두 건 모두 승인 이력은 확인되는데, 급여 반영 시점이 다음 달로 넘어간 것 같습니다. 정확한 사유를 급여팀에 다시 확인해보겠습니다."},
         {"from": "customer", "text": "네, 확인 부탁드릴게요. 언제쯤 알 수 있을까요?"},
     ]},
    {"id": 5, "employeeId": 110, "question": "연말정산 간소화 자료 제출은 어디서 하는 건가요?",
     "category": "연말정산", "topic": "간소화 자료", "receivedAt": "2026-09-13", "status": "대기"},
    {"id": 6, "employeeId": 112, "question": "부양가족을 새로 등록하고 싶은데 절차가 궁금합니다.",
     "category": "연말정산", "topic": "부양가족 등록", "receivedAt": "2026-09-12", "status": "완료",
     "conversation": [
         {"from": "customer", "text": "부양가족을 새로 등록하고 싶은데 절차가 궁금합니다."},
         {"from": "agent", "text": "안녕하세요. 부양가족 등록은 연말정산 시스템에서 가족관계증명서를 첨부해서 신청하시면 됩니다. 등록하실 분과의 관계가 어떻게 되시나요?"},
         {"from": "customer", "text": "이번에 태어난 자녀를 등록하려고 합니다."},
         {"from": "agent", "text": "출생신고 후 발급되는 가족관계증명서만 있으면 바로 등록 가능합니다. 시스템 업로드 후 인사팀 확인까지 1~2일 정도 소요됩니다."},
         {"from": "customer", "text": "알겠습니다. 그럼 지금 바로 업로드해볼게요. 감사합니다!"},
         {"from": "agent", "text": "네, 업로드하신 내용은 확인 후 등록 완료되면 별도로 안내드리겠습니다. 감사합니다."},
     ]},
    {"id": 7, "employeeId": 102, "question": "복지포인트로 살 수 있는 항목이 어디까지인지 헷갈려요.",
     "category": "복리후생", "topic": "복지포인트 사용처", "receivedAt": "2026-09-11", "status": "대기",
     "documentType": "welfare_point"},
    {"id": 8, "employeeId": 115, "question": "급여명세서를 회사 메일로 다시 받아볼 수 있을까요?",
     "category": "급여", "topic": "급여명세서 확인", "receivedAt": "2026-09-10", "status": "완료",
     "conversation": [
         {"from": "customer", "text": "급여명세서를 회사 메일로 다시 받아볼 수 있을까요?"},
         {"from": "agent", "text": "안녕하세요. 어느 달 급여명세서가 필요하신가요?"},
         {"from": "customer", "text": "지난달인 8월분이요. 포털에서 안 열려서요."},
         {"from": "agent", "text": "확인해보니 8월분은 포털에 정상 등록되어 있습니다. 우선 등록하신 이메일로 8월 급여명세서 다시 보내드렸습니다."},
         {"from": "customer", "text": "받았습니다! 감사합니다."},
     ]},
    # AI 간편서류로 처리가 완료된 데모 사례 3건
    {"id": 9, "employeeId": 101, "question": "육아휴직 및 복지포인트 관련해서 신청서를 받고 싶습니다.",
     "category": "복리후생", "topic": "육아휴직 복지제도", "receivedAt": "2026-09-08", "status": "완료",
     "documentType": "parental_leave",
     "documentStatus": {
         "name": "육아휴직 신청서", "state": "completed",
         "values": {
             "period": "2026년 10월 5일 ~ 2027년 4월 4일",
             "reason": "자녀 양육을 위해 신청합니다.",
             "contact": "010-1234-5678",
         },
     },
     "conversation": [
         {"from": "customer", "text": "육아휴직 및 복지포인트 관련해서 신청서를 받고 싶습니다."},
         {"from": "agent", "text": "안녕하세요. 간편서류로 육아휴직 신청서를 보내드렸습니다. 작성해서 회신해 주시면 됩니다."},
         {"from": "customer", "text": "작성해서 보내드렸습니다. 감사합니다!"},
         {"from": "agent", "text": "네, 확인했습니다. 처리 완료되었습니다."},
     ]},
    {"id": 10, "employeeId": 102, "question": "부모님 장례가 있어서 경조금을 신청하려고 합니다.",
     "category": "복리후생", "topic": "경조금 신청 방법", "receivedAt": "2026-09-07", "status": "완료",
     "documentType": "family_event",
     "documentStatus": {
         "name": "경조금 신청서", "state": "completed",
         "values": {
             "eventType": "부친상",
             "eventDate": "2026년 9월 5일",
             "target": "부(父)",
             "proof": "장례식장 발행 계산서 제출 예정",
         },
     },
     "conversation": [
         {"from": "customer", "text": "부모님 장례가 있어서 경조금을 신청하려고 합니다."},
         {"from": "agent", "text": "안녕하세요, 상심이 크시겠습니다. 간편서류로 경조금 신청서를 보내드렸습니다. 작성해서 회신해 주세요."},
         {"from": "customer", "text": "작성해서 보내드렸습니다."},
         {"from": "agent", "text": "확인했습니다. 처리 완료되었습니다."},
     ]},
    {"id": 11, "employeeId": 103, "question": "이번 주에 연장근무를 했는데 신청은 어떻게 하나요?",
     "category": "급여", "topic": "연장근무 수당", "receivedAt": "2026-09-06", "status": "완료",
     "documentType": "overtime",
     "documentStatus": {
         "name": "연장근무 신청서", "state": "completed",
         "values": {
             "date": "2026년 9월 1일",
             "startTime": "18:00",
             "endTime": "20:00",
             "reason": "월말 정산 업무 마감을 위한 연장근무",
         },
     },
     "conversation": [
         {"from": "customer", "text": "이번 주에 연장근무를 했는데 신청은 어떻게 하나요?"},
         {"from": "agent", "text": "안녕하세요. 간편서류로 연장근무 신청서를 보내드렸습니다. 날짜와 시간을 작성해서 회신해 주시면 됩니다."},
         {"from": "customer", "text": "작성해서 보내드렸습니다."},
         {"from": "agent", "text": "확인했습니다. 처리 완료되었습니다."},
     ]},
]

with open("data/employees.json", "w", encoding="utf-8") as f:
    json.dump(employees, f, ensure_ascii=False, indent=2)
with open("data/consultations.json", "w", encoding="utf-8") as f:
    json.dump(consultations, f, ensure_ascii=False, indent=2)
with open("data/inquiries.json", "w", encoding="utf-8") as f:
    json.dump(inquiries, f, ensure_ascii=False, indent=2)

# --------------------------------------------------------------------------
# 근거자료(회사별 사내 규정) Mock 데이터
# AI 근거자료 기능이 매칭할 수 있도록 회사별로 실제 문구가 담긴 섹션을 시딩한다.
# 회사마다 지급 금액 등을 조금씩 다르게 주어 "회사별로 구분된 근거자료"라는
# 것이 시연에서 체감되도록 한다.
# --------------------------------------------------------------------------
evidence_documents = []
evid_id = 1


def add_doc(company, category, name, sections):
    global evid_id
    evidence_documents.append({
        "id": evid_id,
        "scope": "company",
        "company": company,
        "category": category,
        "name": name,
        "description": f"{company} {category} 관련 사내 규정 문서",
        "fileName": name,
        "uploadedAt": "2026-08-20",
        "sections": sections,
    })
    evid_id += 1


def add_common_doc(category, name, description, sections):
    global evid_id
    evidence_documents.append({
        "id": evid_id,
        "scope": "common",
        "company": None,
        "category": category,
        "name": name,
        "description": description,
        "fileName": name,
        "uploadedAt": "2026-08-20",
        "sections": sections,
    })
    evid_id += 1


# 회사(업종)별로 급여 지급일, 복리후생 추가 항목, 기타 지침 문서를 다르게 구성해
# 근거자료가 회사마다 실제로 구분되어 보이도록 한다. 단, "본인 결혼 경조금" 조항은
# 데모 시나리오(결혼 축의금 문의) 재현을 위해 모든 회사에 공통으로 유지한다.
COMPANY_PROFILES = {
    "그린테크놀로지": {
        "payday": "25일",
        "welfare_extra": {
            "section": "제26조 자기계발비",
            "content": "임직원 1인당 연 40만원 한도로 도서 구입, 온라인 강의 수강, 직무 관련 자격증 응시료를 지원한다.",
        },
        "welfare_question": "자기계발비는 어떻게 지원되나요?",
        "etc_doc": "재택근무 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 재택근무 신청", "content": "주 2회까지 재택근무를 신청할 수 있으며, 팀장 승인 후 적용된다."},
            {"section": "제3조 사무용품 신청", "content": "사무용품은 사내 포털의 총무 메뉴에서 신청하며, 신청 익일 배송을 원칙으로 한다."},
        ],
        "etc_question": "재택근무는 어떻게 신청하나요?",
    },
    "블루오션물산": {
        "payday": "21일",
        "welfare_extra": {
            "section": "제26조 해외출장 지원",
            "content": "해외 출장 시 왕복 항공료(실비)와 1일 8만원의 해외 출장 수당을 지급한다.",
        },
        "welfare_question": "해외출장 시 경비는 어떻게 지원되나요?",
        "etc_doc": "출장 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 해외출장 신청", "content": "해외출장은 출발 2주 전까지 총무팀에 일정과 목적을 신청하여 사전 승인을 받아야 한다."},
            {"section": "제3조 주차 등록", "content": "회사 주차 등록은 총무팀에 차량번호를 제출하면 익일부터 적용된다."},
        ],
        "etc_question": "해외출장 신청 절차가 궁금합니다.",
    },
    "한빛시스템": {
        "payday": "말일",
        "welfare_extra": {
            "section": "제26조 리프레시 휴가",
            "content": "근속 5년이 경과할 때마다 5일의 리프레시 휴가와 휴가비 100만원을 지급한다.",
        },
        "welfare_question": "리프레시 휴가는 언제, 얼마나 사용할 수 있나요?",
        "etc_doc": "복무 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 사무용품 신청", "content": "사무용품은 사내 포털의 총무 메뉴에서 신청하며, 신청 익일 배송을 원칙으로 한다."},
            {"section": "제3조 주차 등록", "content": "회사 주차 등록은 총무팀에 차량번호를 제출하면 익일부터 적용된다."},
        ],
        "etc_question": "사무용품은 어디서 신청하나요?",
    },
    "대한전자통신": {
        "payday": "10일",
        "welfare_extra": {
            "section": "제26조 현장수당",
            "content": "생산 현장에서 근무하는 임직원에게는 근무일수에 따라 월 최대 15만원의 현장수당을 별도 지급한다.",
        },
        "welfare_question": "현장수당은 어떻게 지급되나요?",
        "etc_doc": "안전 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 안전교육 이수", "content": "전 임직원은 반기 1회 산업안전교육을 이수해야 하며, 미이수 시 생산 현장 출입이 제한된다."},
            {"section": "제3조 사무용품 신청", "content": "사무용품은 사내 포털의 총무 메뉴에서 신청하며, 신청 익일 배송을 원칙으로 한다."},
        ],
        "etc_question": "안전교육은 언제 이수해야 하나요?",
    },
    "미래산업개발": {
        "payday": "25일",
        "welfare_extra": {
            "section": "제26조 현장 위험수당",
            "content": "건설 현장에서 근무하는 임직원에게는 근무일수에 따라 1일 2만원의 위험수당을 지급한다.",
        },
        "welfare_question": "현장 위험수당은 어떻게 계산되나요?",
        "etc_doc": "현장 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 차량 유류비 지원", "content": "현장 이동을 위해 자차를 이용하는 경우 월 20만원 한도로 유류비를 지원한다."},
            {"section": "제3조 주차 등록", "content": "회사 주차 등록은 총무팀에 차량번호를 제출하면 익일부터 적용된다."},
        ],
        "etc_question": "자차로 현장 이동 시 유류비 지원이 되나요?",
    },
    "성원바이오": {
        "payday": "25일",
        "welfare_extra": {
            "section": "제26조 연구직 특별휴가",
            "content": "연구개발 직군은 담당 프로젝트 종료 후 3일의 특별휴가를 부여한다.",
        },
        "welfare_question": "연구직 특별휴가는 어떻게 사용하나요?",
        "etc_doc": "실험실 안전 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 실험실 안전수칙", "content": "실험실 출입자는 보호장비를 착용해야 하며, 위험물질 취급 전 안전교육을 이수해야 한다."},
            {"section": "제3조 사무용품 신청", "content": "사무용품은 사내 포털의 총무 메뉴에서 신청하며, 신청 익일 배송을 원칙으로 한다."},
        ],
        "etc_question": "실험실 출입 시 지켜야 할 안전수칙이 있나요?",
    },
    "코스모스푸드": {
        "payday": "25일",
        "welfare_extra": {
            "section": "제26조 중식비 지원",
            "content": "전 임직원에게 월 15만원의 중식비를 급여와 별도로 현금 지급한다.",
        },
        "welfare_question": "중식비는 얼마나, 어떻게 지원되나요?",
        "etc_doc": "위생관리 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 위생교육 이수", "content": "식품 취급 부서 임직원은 분기 1회 위생교육을 의무적으로 이수해야 한다."},
            {"section": "제3조 주차 등록", "content": "회사 주차 등록은 총무팀에 차량번호를 제출하면 익일부터 적용된다."},
        ],
        "etc_question": "위생교육은 얼마나 자주 받아야 하나요?",
    },
    "센트럴로지스틱스": {
        "payday": "25일",
        "welfare_extra": {
            "section": "제26조 교대근무 수당",
            "content": "야간 또는 교대 근무자에게는 근무 1일당 3만원의 교대근무 수당을 별도 지급한다.",
        },
        "welfare_question": "교대근무 수당은 얼마인가요?",
        "etc_doc": "물류센터 안전 및 총무 지침.pdf",
        "etc_sections": [
            {"section": "제2조 물류센터 안전수칙", "content": "물류센터 출입자는 안전화와 형광 조끼를 착용해야 하며, 지게차 운행 구역에는 도보로 진입할 수 없다."},
            {"section": "제3조 배차 및 주차 등록", "content": "배송 차량 및 개인 차량의 주차 등록은 총무팀에 차량번호를 제출하면 익일부터 적용된다."},
        ],
        "etc_question": "물류센터 출입 시 지켜야 할 안전수칙이 있나요?",
    },
}

# 등록된 FAQ(공통/고객사별) Mock 데이터. company가 None이면 전 고객사 공통 FAQ.
registered_faqs = []
faq_id = 1


def add_faq(company, category, topic, question, answer, days_ago):
    global faq_id
    registered_faqs.append({
        "id": faq_id,
        "company": company,
        "category": category,
        "topic": topic,
        "question": question,
        "answer": answer,
        "createdAt": (TODAY - timedelta(days=days_ago)).isoformat() + "T09:00:00",
    })
    faq_id += 1


for i, company in enumerate(COMPANIES):
    marriage_self = 500000 - (i % 3) * 50000        # 35~50만원
    marriage_child = 300000 - (i % 4) * 30000        # 21~30만원
    bereavement = 700000 - (i % 3) * 50000           # 60~70만원
    welfare_point = 800000 + (i % 5) * 100000        # 80~120만원
    overtime_rate = "1.5배"
    profile = COMPANY_PROFILES[company]
    payday = profile["payday"]

    add_doc(company, "복리후생", "복리후생 규정.pdf", [
        {
            "page": 18,
            "section": "제15조 경조금",
            "content": (
                f"1. 본인의 결혼에 대해서는 경조금 {marriage_self // 10000}만원을 지급한다.\n"
                f"2. 자녀의 결혼에 대해서는 경조금 {marriage_child // 10000}만원을 지급한다.\n"
                f"3. 본인 및 배우자의 직계존속 사망 시에는 조의금 {bereavement // 10000}만원을 지급하고 유급 휴가 5일을 부여한다.\n"
                "4. 경조금은 경조사 발생일로부터 30일 이내에 증빙서류(청첩장, 가족관계증명서 등)와 함께 인사팀에 신청해야 지급한다."
            ),
        },
        {
            "page": 21,
            "section": "제20조 복지포인트",
            "content": (
                f"1. 복지포인트는 매년 1월, 근속연수에 따라 1인당 연 {welfare_point // 10000}만원 한도로 일괄 지급한다.\n"
                "2. 복지포인트는 의료, 자기계발, 여가 항목에 한해 사용할 수 있으며 유흥 관련 업종은 사용을 제한한다.\n"
                "3. 육아휴직 등 휴직자도 재직 상태가 유지되는 경우 동일하게 지급하며, 사용 기한은 복직 후 3개월까지 연장한다."
            ),
        },
        {
            "page": 25,
            "section": "제24조 건강검진",
            "content": (
                "1. 건강검진은 사내 포털의 복리후생 메뉴에서 희망 병원과 일정을 선택해 신청한다.\n"
                "2. 근속 3년 이상인 임직원은 종합검진 대상에 포함되며, 신청 후 인사팀 승인을 거쳐 예약이 확정된다."
            ),
        },
        {
            "page": 28,
            **profile["welfare_extra"],
        },
    ])

    add_doc(company, "급여", "급여 운영규정.pdf", [
        {
            "page": 4,
            "section": "제5조 급여 지급일",
            "content": f"급여는 매월 {payday}에 지급하며, 해당일이 휴일인 경우 직전 영업일에 지급한다.",
        },
        {
            "page": 7,
            "section": "제8조 연장근무 수당",
            "content": (
                f"연장근무 수당은 통상임금의 {overtime_rate}로 계산하며, 사전 승인된 연장근무에 한해 지급한다. "
                "근태 시스템에 등록된 승인 내역을 기준으로 산정한다."
            ),
        },
    ])

    add_doc(company, "연말정산", "연말정산 안내.pdf", [
        {
            "page": 2,
            "section": "제1조 간소화 자료 제출",
            "content": "국세청 간소화 자료는 매년 1월 중순부터 제출 가능하며, 홈택스에서 다운로드 후 사내 연말정산 시스템에 업로드하면 자동 반영된다.",
        },
        {
            "page": 5,
            "section": "제3조 부양가족 등록",
            "content": "부양가족 공제는 연말정산 시스템에서 가족관계증명서를 첨부하여 등록하며, 연말정산 기간 중에만 등록/변경할 수 있다.",
        },
    ])

    add_doc(company, "기타", profile["etc_doc"], [
        {"page": 3, **profile["etc_sections"][0]},
        {"page": 4, **profile["etc_sections"][1]},
    ])

    add_faq(
        company, "복리후생", "경조금",
        "본인 결혼 시 경조금은 얼마인가요?",
        f"본인의 결혼에 대해서는 경조금 {marriage_self // 10000}만원을 지급합니다. 경조사 발생일로부터 30일 이내에 청첩장 등 증빙서류와 함께 인사팀에 신청해 주세요.",
        days_ago=5 + i,
    )
    add_faq(
        company, "복리후생", profile["welfare_extra"]["section"].split(" ", 1)[1],
        profile["welfare_question"],
        profile["welfare_extra"]["content"],
        days_ago=8 + i,
    )
    add_faq(
        company, "기타", profile["etc_sections"][0]["section"].split(" ", 1)[1],
        profile["etc_question"],
        profile["etc_sections"][0]["content"],
        days_ago=12 + i,
    )

# 전 고객사 공통 FAQ — 회사 내부 규정이 아니라 세법/근로기준법 등 법령에 근거해
# 모든 고객사에 동일하게 적용되는 항목만 공통으로 둔다. 복리후생처럼 회사마다
# 다르게 운영되는 사내 규정은 공통 FAQ에 포함하지 않는다.
add_faq(
    None, "연말정산", "간소화 자료 제출",
    "연말정산 간소화 자료는 언제, 어떻게 제출하나요?",
    "국세청 홈택스 연말정산 간소화 서비스는 매년 1월 중순부터 열리며, 자료를 내려받아 회사에 제출하면 됩니다. 이는 세법에 따른 절차로 회사와 무관하게 동일하게 적용됩니다.",
    days_ago=3,
)
add_faq(
    None, "연말정산", "부양가족 공제 요건",
    "부양가족 공제 대상 요건이 어떻게 되나요?",
    "소득세법상 부양가족은 연간 소득금액 100만원 이하(근로소득만 있는 경우 총급여 500만원 이하)인 직계존비속 등이 해당하며, 이 기준은 국세청 규정으로 전 직원에게 동일하게 적용됩니다.",
    days_ago=6,
)
add_faq(
    None, "연말정산", "의료비 세액공제",
    "의료비 세액공제 기준이 궁금합니다.",
    "총급여의 3%를 초과하는 의료비 지출액에 대해 세액공제가 적용되며, 이는 소득세법에 따른 기준으로 회사와 무관하게 동일합니다.",
    days_ago=9,
)
add_faq(
    None, "연말정산", "기부금 세액공제",
    "기부금도 세액공제를 받을 수 있나요?",
    "법정·지정기부금 영수증을 제출하면 기부금액에 따라 세액공제를 받을 수 있으며, 공제율과 한도는 소득세법에 따라 전 직원에게 동일하게 적용됩니다.",
    days_ago=11,
)
add_faq(
    None, "급여", "4대보험료 계산",
    "4대보험료는 어떻게 계산되나요?",
    "국민연금, 건강보험, 고용보험, 산재보험의 보험료율은 매년 정부가 고시하며, 회사와 무관하게 전 직원에게 동일한 요율이 적용됩니다.",
    days_ago=14,
)
add_faq(
    None, "급여", "연차휴가 발생 기준",
    "연차휴가는 며칠 발생하나요?",
    "근로기준법에 따라 1년간 80% 이상 출근한 직원에게는 15일의 연차휴가가 발생하며, 입사 1년 미만인 경우 매월 개근 시 1일씩 발생합니다. 이는 회사 규모와 무관하게 법적으로 동일합니다.",
    days_ago=17,
)

# 특정 고객사와 무관하게 담당자가 공통으로 알아야 하는 업무 지식.
add_common_doc(
    "기타",
    "상담 응대 매뉴얼.pdf",
    "전 고객사 공통 상담 응대 절차 및 에스컬레이션 기준",
    [
        {
            "page": 1,
            "section": "제1조 기본 응대 원칙",
            "content": "1. 문의 접수 후 24시간 이내에 최초 답변을 제공하는 것을 원칙으로 한다.\n2. 회사 규정을 확인하기 전에는 지급 여부나 금액을 확정적으로 안내하지 않는다.",
        },
        {
            "page": 2,
            "section": "제2조 에스컬레이션 기준",
            "content": "근거자료로 판단이 어려운 문의, 법적 분쟁 소지가 있는 문의는 담당 팀장에게 에스컬레이션한 후 답변한다.",
        },
    ],
)
add_common_doc(
    "기타",
    "개인정보 처리 지침.pdf",
    "경조사 증빙서류 등 상담 과정에서 수집하는 개인정보 취급 원칙",
    [
        {
            "page": 1,
            "section": "제1조 증빙서류 취급",
            "content": "청첩장, 가족관계증명서 등 상담 과정에서 제출받은 증빙서류는 처리 완료 후 즉시 파기하며, 목적 외 용도로 보관하지 않는다.",
        },
        {
            "page": 2,
            "section": "제2조 상담 내용 공유 제한",
            "content": "상담 내용 및 첨부 서류는 처리 담당자 외 제3자에게 공유할 수 없으며, 고객사 간 정보는 상호 열람할 수 없다.",
        },
    ],
)

with open("data/evidence_documents.json", "w", encoding="utf-8") as f:
    json.dump(evidence_documents, f, ensure_ascii=False, indent=2)

registered_faqs.sort(key=lambda r: r["createdAt"], reverse=True)
with open("data/registered_faqs.json", "w", encoding="utf-8") as f:
    json.dump(registered_faqs, f, ensure_ascii=False, indent=2)

print(
    f"employees: {len(employees)}, consultations: {len(consultations)}, "
    f"inquiries: {len(inquiries)}, evidence_documents: {len(evidence_documents)}, "
    f"registered_faqs: {len(registered_faqs)}"
)
