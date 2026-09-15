import { useState } from 'react'
import { searchEvidence } from '../api/client'
import type { EvidenceMatch } from '../types'
import AiLoading from './AiLoading'
import EvidenceViewerModal from './EvidenceViewerModal'
import IconBadge from './IconBadge'

export default function EvidencePanel({ company, question }: { company: string; question: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [documents, setDocuments] = useState<EvidenceMatch[]>([])
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState<EvidenceMatch | null>(null)

  async function handleSearch() {
    setStatus('loading')
    setError('')
    try {
      const result = await searchEvidence(company, question)
      setDocuments(result.documents)
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : '근거자료 검색에 실패했습니다.')
      setStatus('error')
    }
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
          <IconBadge emoji="📚" color="purple" />
          AI 근거자료
        </h2>
        <button
          onClick={handleSearch}
          disabled={status === 'loading' || !company}
          className="rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50"
        >
          {status === 'done' ? '다시 찾기' : '근거자료 찾기'}
        </button>
      </div>

      {status === 'idle' && (
        <p className="mt-4 text-sm text-slate-400">
          버튼을 눌러 {company} 근거자료에서 이 문의와 관련된 조항을 찾아보세요.
        </p>
      )}
      {status === 'loading' && <AiLoading label="등록된 근거자료에서 관련 조항을 찾고 있습니다..." />}
      {status === 'error' && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {status === 'done' && documents.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
          관련된 근거자료를 찾지 못했습니다.
          <br />
          근거자료 메뉴에서 관련 규정을 등록해 보세요.
        </div>
      )}

      {status === 'done' && documents.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500">관련 자료 {documents.length}건 발견</p>
          {documents.map((d, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>📄</span>
                <span className="font-semibold text-slate-600">{d.documentName}</span>
                <span>·</span>
                <span>p.{d.page}</span>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-slate-500">{d.section}</p>
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 leading-relaxed text-slate-700 ring-1 ring-amber-100">
                <mark className="animate-highlightsweep rounded bg-transparent bg-gradient-to-r from-amber-300 to-amber-300 bg-left bg-no-repeat px-0.5 font-medium text-slate-900">
                  {d.evidence}
                </mark>
              </p>
              <button
                onClick={() => setViewing(d)}
                className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                문서 전체 보기 →
              </button>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <EvidenceViewerModal
          documentId={viewing.documentId}
          focusPage={viewing.page}
          focusSection={viewing.section}
          focusEvidence={viewing.evidence}
          onClose={() => setViewing(null)}
        />
      )}
    </section>
  )
}
