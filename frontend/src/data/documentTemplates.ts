import type { DocumentType } from '../types'

export type AutoFieldKey = 'name' | 'company' | 'department' | 'employeeNo'

// 표 안의 한 칸(라벨 또는 입력칸)을 나타낸다.
export type FormCell =
  | { kind: 'label'; text: string }
  | { kind: 'auto'; field: AutoFieldKey; span?: number }
  | { kind: 'manual'; key: string; placeholder?: string; span?: number }

// 표 전체 폭을 가로지르는 구분용 섹션 헤더(음영 처리된 한 줄).
export type FormRow = { section: string } | FormCell[]

export interface DocumentTemplate {
  type: DocumentType
  formNumber: string
  title: string
  rows: FormRow[]
  noteLines?: string[]
}

// 실제 사내 서식처럼 보이도록 표(rows) 구조로 정의한다.
// auto 칸은 상담 직원 데이터에서, manual 칸은 상담 내용만으로 알 수 없는
// 정보이므로 담당자/고객이 직접 입력해야 하는 빈칸으로 둔다.
export const DOCUMENT_TEMPLATES: Record<DocumentType, DocumentTemplate> = {
  parental_leave: {
    type: 'parental_leave',
    formNumber: '별지 제5호 서식',
    title: '출산전후휴가 및 육아휴직 신청서',
    rows: [
      { section: '신청인' },
      [
        { kind: 'label', text: '성명' },
        { kind: 'auto', field: 'name' },
        { kind: 'label', text: '사번' },
        { kind: 'auto', field: 'employeeNo' },
      ],
      [
        { kind: 'label', text: '소속(부서)' },
        { kind: 'auto', field: 'department' },
        { kind: 'label', text: '회사' },
        { kind: 'auto', field: 'company' },
      ],
      { section: '육아휴직 내용' },
      [{ kind: 'label', text: '휴직 희망 기간' }, { kind: 'manual', key: 'period', placeholder: '예: 2026년 10월 1일 ~ 2027년 3월 31일', span: 3 }],
      [{ kind: 'label', text: '신청 사유' }, { kind: 'manual', key: 'reason', span: 3 }],
      [{ kind: 'label', text: '연락처' }, { kind: 'manual', key: 'contact', span: 3 }],
    ],
    noteLines: ['※ 육아휴직은 대상 자녀 1인당 최대 1년까지 신청할 수 있습니다.'],
  },
  family_event: {
    type: 'family_event',
    formNumber: '별지 제7호 서식',
    title: '경조사 지원 신청서',
    rows: [
      { section: '신청인' },
      [
        { kind: 'label', text: '성명' },
        { kind: 'auto', field: 'name' },
        { kind: 'label', text: '사번' },
        { kind: 'auto', field: 'employeeNo' },
      ],
      [
        { kind: 'label', text: '소속(부서)' },
        { kind: 'auto', field: 'department' },
        { kind: 'label', text: '회사' },
        { kind: 'auto', field: 'company' },
      ],
      { section: '경조사 내용' },
      [{ kind: 'label', text: '경조 구분' }, { kind: 'manual', key: 'eventType', placeholder: '예: 본인 결혼, 부모상 등', span: 3 }],
      [{ kind: 'label', text: '경조 발생일' }, { kind: 'manual', key: 'eventDate', span: 3 }],
      [{ kind: 'label', text: '경조 대상자' }, { kind: 'manual', key: 'target', span: 3 }],
      [{ kind: 'label', text: '증빙 서류' }, { kind: 'manual', key: 'proof', placeholder: '예: 청첩장, 가족관계증명서 등', span: 3 }],
    ],
    noteLines: ['※ 경조사 발생일로부터 30일 이내에 증빙서류와 함께 제출해야 합니다.'],
  },
  family_allowance: {
    type: 'family_allowance',
    formNumber: '별지 제9호 서식',
    title: '가족수당 지급 신청서',
    rows: [
      { section: '신청인' },
      [
        { kind: 'label', text: '성명' },
        { kind: 'auto', field: 'name' },
        { kind: 'label', text: '사번' },
        { kind: 'auto', field: 'employeeNo' },
      ],
      [
        { kind: 'label', text: '소속(부서)' },
        { kind: 'auto', field: 'department' },
        { kind: 'label', text: '회사' },
        { kind: 'auto', field: 'company' },
      ],
      { section: '가족수당 내용' },
      [
        { kind: 'label', text: '가족 구성원' },
        { kind: 'manual', key: 'member' },
        { kind: 'label', text: '관계' },
        { kind: 'manual', key: 'relation' },
      ],
      [{ kind: 'label', text: '생년월일' }, { kind: 'manual', key: 'birth', span: 3 }],
      [{ kind: 'label', text: '신청 사유' }, { kind: 'manual', key: 'reason', span: 3 }],
    ],
  },
  overtime: {
    type: 'overtime',
    formNumber: '별지 제3호 서식',
    title: '연장근무(시간외근무) 신청서',
    rows: [
      { section: '신청인' },
      [
        { kind: 'label', text: '성명' },
        { kind: 'auto', field: 'name' },
        { kind: 'label', text: '사번' },
        { kind: 'auto', field: 'employeeNo' },
      ],
      [
        { kind: 'label', text: '소속(부서)' },
        { kind: 'auto', field: 'department' },
        { kind: 'label', text: '회사' },
        { kind: 'auto', field: 'company' },
      ],
      { section: '연장근무 내용' },
      [{ kind: 'label', text: '근무 날짜' }, { kind: 'manual', key: 'date', span: 3 }],
      [
        { kind: 'label', text: '시작 시간' },
        { kind: 'manual', key: 'startTime' },
        { kind: 'label', text: '종료 시간' },
        { kind: 'manual', key: 'endTime' },
      ],
      [{ kind: 'label', text: '연장근무 사유' }, { kind: 'manual', key: 'reason', span: 3 }],
    ],
    noteLines: ['※ 사전 승인된 연장근무에 한해 수당이 지급됩니다.'],
  },
  welfare_point: {
    type: 'welfare_point',
    formNumber: '별지 제12호 서식',
    title: '복지포인트 신청/변경 신청서',
    rows: [
      { section: '신청인' },
      [
        { kind: 'label', text: '성명' },
        { kind: 'auto', field: 'name' },
        { kind: 'label', text: '사번' },
        { kind: 'auto', field: 'employeeNo' },
      ],
      [
        { kind: 'label', text: '소속(부서)' },
        { kind: 'auto', field: 'department' },
        { kind: 'label', text: '회사' },
        { kind: 'auto', field: 'company' },
      ],
      { section: '신청 내용' },
      [{ kind: 'label', text: '신청/변경 항목' }, { kind: 'manual', key: 'item', span: 3 }],
      [{ kind: 'label', text: '신청 내용' }, { kind: 'manual', key: 'content', span: 3 }],
      [{ kind: 'label', text: '세부사항' }, { kind: 'manual', key: 'detail', span: 3 }],
    ],
  },
}
