import type {
  ContextResponse,
  Employee,
  FaqAnalysisResponse,
  FaqDraftResponse,
  Inquiry,
  RecommendationResponse,
} from '../types'

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'API 요청에 실패했습니다.')
  }
  return res.json()
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('API 요청에 실패했습니다.')
  return res.json()
}

export function fetchInquiries() {
  return getJson<Inquiry[]>('/api/inquiries')
}

export function fetchEmployee(employeeId: number) {
  return getJson<Employee>(`/api/employees/${employeeId}`)
}

export function fetchContext(employeeId: number, question: string) {
  return postJson<ContextResponse>('/api/context', { employeeId, question })
}

export function fetchRecommendation(employeeId: number, question: string) {
  return postJson<RecommendationResponse>('/api/work-recommendation', { employeeId, question })
}

export function fetchFaqAnalysis(period: string) {
  return postJson<FaqAnalysisResponse>('/api/faq', { period })
}

export function fetchFaqDraft(category: string, title: string, period: string) {
  return postJson<FaqDraftResponse>('/api/faq/draft', { category, title, period })
}

export function registerFaq(category: string, topic: string, question: string, answer: string) {
  return postJson<{ id: number }>('/api/faq/register', { category, topic, question, answer })
}
