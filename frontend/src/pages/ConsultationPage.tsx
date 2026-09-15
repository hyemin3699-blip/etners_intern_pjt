import { useEffect, useState } from 'react'
import { fetchEmployee, fetchInquiries } from '../api/client'
import CompletedDocumentModal from '../components/CompletedDocumentModal'
import ContextPanel from '../components/ContextPanel'
import DocumentDrawer from '../components/DocumentDrawer'
import DocumentStatusCard from '../components/DocumentStatusCard'
import EvidencePanel from '../components/EvidencePanel'
import InquiryList from '../components/InquiryList'
import RecommendationPanel from '../components/RecommendationPanel'
import { useCompany } from '../context/CompanyContext'
import { DOCUMENT_TEMPLATES } from '../data/documentTemplates'
import type { ConversationMessage, DocumentStatus, Employee, Inquiry } from '../types'

type ChatMessage = ConversationMessage

export default function ConsultationPage() {
  const { setCompany } = useCompany()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sentDocuments, setSentDocuments] = useState<DocumentStatus[]>([])
  const [showDocDrawer, setShowDocDrawer] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<DocumentStatus | null>(null)

  useEffect(() => {
    fetchInquiries().then((list) => {
      setInquiries(list)
      if (list.length > 0) handleSelect(list[0])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelect(inquiry: Inquiry) {
    setSelected(inquiry)
    setMessages(inquiry.conversation ?? [{ from: 'customer', text: inquiry.question }])
    setDraft('')
    setEmployee(null)
    setCompany(inquiry.company)
    setSentDocuments(inquiry.documentStatus ? [inquiry.documentStatus] : [])
    setShowDocDrawer(false)
    setViewingDoc(null)
    fetchEmployee(inquiry.employeeId).then(setEmployee)
  }

  function sendReply() {
    if (!draft.trim()) return
    setMessages((prev) => [...prev, { from: 'agent', text: draft.trim() }])
    setDraft('')
  }

  function handleSendDocument(values: Record<string, string>, signature: string | null) {
    if (!template) return
    setSentDocuments((prev) => [...prev, { name: template.title, state: 'requested', values, signature }])
    setShowDocDrawer(false)
  }

  const template = selected?.documentType ? DOCUMENT_TEMPLATES[selected.documentType] : null

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 p-5 lg:grid-cols-[260px_1fr_1.1fr]">
      <InquiryList
        inquiries={inquiries}
        selectedId={selected?.id ?? null}
        onSelect={handleSelect}
      />

      {!selected ? (
        <section className="flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 text-sm text-slate-400 lg:col-span-2">
          왼쪽 목록에서 처리할 상담을 선택하세요.
        </section>
      ) : (
        <>
          {/* 상담 내용 */}
          <section className="flex min-h-0 flex-col rounded-3xl border border-slate-100 bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">{selected.name}</h2>
                <p className="text-xs text-slate-400">
                  {selected.company}
                  {employee && ` · 누적 문의 ${employee.consultationCount}건`}
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                {selected.category} · {selected.topic}
              </span>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === 'agent'
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <p className="mb-1 text-[11px] opacity-70">
                      {m.from === 'agent' ? '담당자' : `${selected.name} (${selected.company})`}
                    </p>
                    {m.text}
                  </div>
                </div>
              ))}

              {sentDocuments.map((doc, i) => (
                <DocumentStatusCard key={i} status={doc} onClick={() => setViewingDoc(doc)} />
              ))}
            </div>

            <div className="border-t border-slate-100 p-4">
              {template && (
                <button
                  onClick={() => setShowDocDrawer(true)}
                  className="mb-2 rounded-full border border-dashed border-brand-300 px-3.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  ＋ 간편서류
                </button>
              )}
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  placeholder="고객에게 보낼 답변을 입력하세요"
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  onClick={sendReply}
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  전송
                </button>
              </div>
            </div>
          </section>

          {/* AI 업무지원 — 상담을 바꾸면 이전 결과가 남지 않도록 key로 새로 마운트한다 */}
          <div className="flex min-h-0 flex-col gap-5 overflow-y-auto" key={selected.id}>
            <ContextPanel employeeId={selected.employeeId} question={selected.question} />
            <RecommendationPanel employeeId={selected.employeeId} question={selected.question} />
            <EvidencePanel company={selected.company} question={selected.question} />
          </div>
        </>
      )}

      {showDocDrawer && template && (
        <DocumentDrawer
          template={template}
          employee={employee}
          onClose={() => setShowDocDrawer(false)}
          onSend={handleSendDocument}
        />
      )}

      {viewingDoc && template && (
        <CompletedDocumentModal
          template={template}
          employee={employee}
          values={viewingDoc.values ?? {}}
          signature={viewingDoc.signature}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  )
}
