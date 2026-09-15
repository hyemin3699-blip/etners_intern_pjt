import type {
  ContextResponse,
  Employee,
  EvidenceDocument,
  EvidenceDocumentDetail,
  EvidenceSearchResponse,
  FaqAnalysisResponse,
  FaqDraftResponse,
  Inquiry,
  RecommendationResponse,
  RegisteredFaq,
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

export function fetchFaqAnalysis(period: string, company?: string) {
  return postJson<FaqAnalysisResponse>('/api/faq', { period, company })
}

export function fetchFaqDraft(category: string, title: string, period: string, company?: string) {
  return postJson<FaqDraftResponse>('/api/faq/draft', { category, title, period, company })
}

export function registerFaq(
  category: string,
  topic: string,
  question: string,
  answer: string,
  scope: 'common' | 'company',
  company?: string,
) {
  return postJson<RegisteredFaq>('/api/faq/register', { category, topic, question, answer, scope, company })
}

export function fetchRegisteredFaqs(options: { scope?: 'common' | 'company'; company?: string }) {
  const params = new URLSearchParams()
  if (options.scope) params.set('scope', options.scope)
  if (options.company) params.set('company', options.company)
  return getJson<RegisteredFaq[]>(`/api/faq/registered?${params.toString()}`)
}

export async function deleteRegisteredFaq(id: number) {
  const res = await fetch(`/api/faq/registered/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('삭제에 실패했습니다.')
  return res.json()
}

export function fetchCompanies() {
  return getJson<string[]>('/api/companies')
}

export function fetchEvidenceDocuments(options: { scope?: 'common' | 'company'; company?: string; category?: string }) {
  const params = new URLSearchParams()
  if (options.scope) params.set('scope', options.scope)
  if (options.company) params.set('company', options.company)
  if (options.category) params.set('category', options.category)
  return getJson<EvidenceDocument[]>(`/api/evidence?${params.toString()}`)
}

export function fetchEvidenceDocument(id: number) {
  return getJson<EvidenceDocumentDetail>(`/api/evidence/${id}`)
}

export function uploadEvidenceDocument(payload: {
  scope: 'common' | 'company'
  company?: string
  category: string
  name: string
  description?: string
  fileName?: string
}) {
  return postJson<EvidenceDocument>('/api/evidence/upload', payload)
}

export async function deleteEvidenceDocument(id: number) {
  const res = await fetch(`/api/evidence/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('삭제에 실패했습니다.')
  return res.json()
}

export function searchEvidence(company: string, question: string) {
  return postJson<EvidenceSearchResponse>('/api/evidence/search', { company, question })
}
