import { useEffect, useMemo, useState } from 'react'
import { fetchEvidenceDocument } from '../api/client'
import type { EvidenceDocumentDetail } from '../types'

function HighlightedContent({ content, evidence }: { content: string; evidence?: string }) {
  if (!evidence || !content.includes(evidence)) {
    return <p className="whitespace-pre-line text-[15px] leading-[1.9] text-slate-800">{content}</p>
  }
  const idx = content.indexOf(evidence)
  const before = content.slice(0, idx)
  const after = content.slice(idx + evidence.length)
  return (
    <p className="whitespace-pre-line text-[15px] leading-[1.9] text-slate-800">
      {before}
      <mark className="animate-highlightsweep rounded-sm bg-transparent bg-gradient-to-r from-amber-300 to-amber-300 bg-left bg-no-repeat px-0.5 py-px text-slate-900">
        {evidence}
      </mark>
      {after}
    </p>
  )
}

export default function EvidenceViewerModal({
  documentId,
  focusPage,
  focusSection,
  focusEvidence,
  onClose,
}: {
  documentId: number
  focusPage?: number
  focusSection?: string
  focusEvidence?: string
  onClose: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [doc, setDoc] = useState<EvidenceDocumentDetail | null>(null)
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    fetchEvidenceDocument(documentId)
      .then((res) => {
        if (cancelled) return
        setDoc(res)
        const initial =
          res.sections.findIndex((s) => (focusSection ? s.section === focusSection : s.page === focusPage)) ?? -1
        setPageIndex(initial >= 0 ? initial : 0)
        setStatus('done')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  const sections = doc?.sections ?? []
  const current = sections[pageIndex]
  const isFocused = !!current && (focusSection ? current.section === focusSection : current.page === focusPage)
  const title = useMemo(() => doc?.name.replace(/\.pdf$/i, '') ?? '', [doc])
  const ownerLabel = doc ? (doc.scope === 'common' ? '매미챗 공통 자료' : doc.company ?? '') : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* PDF 뷰어 툴바 */}
        <header className="flex shrink-0 items-center justify-between gap-3 bg-slate-800 px-4 py-2.5 text-slate-200">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-base">📄</span>
            <span className="truncate text-sm font-medium">{doc?.name ?? '문서 보기'}</span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {sections.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <button
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={pageIndex === 0}
                  className="rounded px-1.5 py-1 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="이전 페이지"
                >
                  ◀
                </button>
                <span className="tabular-nums">
                  p.{current?.page ?? '-'} · {pageIndex + 1}/{sections.length}
                </span>
                <button
                  onClick={() => setPageIndex((i) => Math.min(sections.length - 1, i + 1))}
                  disabled={pageIndex === sections.length - 1}
                  className="rounded px-1.5 py-1 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="다음 페이지"
                >
                  ▶
                </button>
              </div>
            )}
            <button onClick={onClose} className="rounded px-1.5 py-1 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="닫기">
              ✕
            </button>
          </div>
        </header>

        {/* 문서 캔버스 */}
        <div className="flex-1 overflow-y-auto bg-slate-200 px-6 py-8 sm:px-10">
          {status === 'loading' && <p className="py-16 text-center text-sm text-slate-500">문서를 불러오는 중...</p>}
          {status === 'error' && <p className="py-16 text-center text-sm text-red-500">문서를 불러오지 못했습니다.</p>}

          {status === 'done' && doc && sections.length === 0 && (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center rounded-sm bg-white p-10 text-center shadow-md">
              <span className="text-3xl">📄</span>
              <p className="mt-3 text-sm font-semibold text-slate-600">{doc.name}</p>
              <p className="mt-1 text-xs text-slate-400">이 파일은 텍스트 미리보기를 지원하지 않습니다.</p>
            </div>
          )}

          {status === 'done' && doc && current && (
            <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-white p-10 shadow-md sm:p-14">
              {/* 레터헤드 */}
              <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-slate-400">{doc.category} · 사내 규정</p>
                  <h1 className="mt-1 font-serif text-xl font-bold text-slate-800">{title}</h1>
                </div>
                <p className="mt-1 shrink-0 text-right text-[11px] text-slate-400">{ownerLabel}</p>
              </div>

              {/* 조항 본문 */}
              <div className="flex-1 font-serif">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">{current.section}</h2>
                  {isFocused && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      현재 문의와 관련된 근거
                    </span>
                  )}
                </div>
                <HighlightedContent content={current.content} evidence={isFocused ? focusEvidence : undefined} />
              </div>

              {/* 페이지 푸터 */}
              <p className="mt-10 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">- {current.page} -</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
