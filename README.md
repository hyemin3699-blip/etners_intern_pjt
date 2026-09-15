# AI 업무처리 Assistant (PoC)

경영지원 서비스 담당자를 위한 AI 업무지원 PoC. React + Flask + Gemini API(무료, OpenAI SDK 호환)로 구성.
매미챗을 통해 여러 고객사 임직원이 접수한 상담을 담당자가 목록에서 선택해 처리하는 흐름을 시연한다.

## 폴더 구조

```
실습_02/
├─ backend/         Flask API 서버
│  ├─ app.py
│  ├─ routes/       /api/context, /api/work-recommendation, /api/faq, /api/faq/draft, /api/faq/register
│  ├─ services/      Gemini API 호출, Mock 데이터 조회
│  ├─ data/          Mock JSON (employees, consultations, inquiries, registered_faqs)
│  └─ generate_mock_data.py   Mock 데이터 재생성 스크립트
└─ frontend/        React + TypeScript + Tailwind (Vite)
   └─ src/
      ├─ pages/      상담 처리 화면, AI FAQ Insight 화면
      ├─ components/ 상담 신청자 목록, AI Context, 업무처리 추천, FAQ 초안 모달 등
      └─ api/        백엔드 API 클라이언트
```

## 실행 방법

### 1. 백엔드

```bash
cd backend
pip install -r requirements.txt
```

`backend/.env` 파일에 본인의 Gemini API 키를 입력합니다 (무료, 신용카드 등록 불필요).

```
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-3.5-flash-lite
```

```bash
python app.py
```

기본적으로 `http://127.0.0.1:5003` 에서 실행됩니다.

### 2. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` 접속. `/api/*` 요청은 Vite 개발 서버가 자동으로 백엔드(5003)로 전달합니다 (vite.config.ts의 proxy 설정).

## 화면

- `/` 상담 처리 화면 — 상담 신청자 목록에서 선택 → 고객 문의 + AI 문의 Context + AI 업무처리 추천
- `/faq-insight` AI FAQ Insight — 상담 데이터 통계, 문의 유형 분포, FAQ 후보, FAQ 초안 생성/수정/등록

## Mock 데이터 재생성

```bash
cd backend
python generate_mock_data.py
```

## 참고

- 실제 매미챗/ERP/HRIS 연동 없이 Mock JSON 데이터만 사용하는 PoC입니다.
- AI는 문의 분류·답변 초안을 대신하지 않으며, 담당자의 업무 판단을 보조하는 역할만 수행합니다.
- FAQ 초안은 기존 상담 답변 데이터를 기반으로 생성되며, 담당자가 질문/답변을 직접 수정한 뒤 "등록하기"로 확정한다 (`data/registered_faqs.json`에 저장됨).
- 브랜드 컬러는 etners 오렌지(`#ff6b35` 계열)를 사용한다.
