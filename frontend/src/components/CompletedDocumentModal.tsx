import type { DocumentTemplate } from '../data/documentTemplates'
import type { Employee } from '../types'
import DocumentPaper from './DocumentPaper'
import HandwrittenSignature from './HandwrittenSignature'
import IconBadge from './IconBadge'

const TODAY_LABEL = '2026년 9월 15일'

export default function CompletedDocumentModal({
  template,
  employee,
  values,
  signature,
  onClose,
}: {
  template: DocumentTemplate
  employee: Employee | null
  values: Record<string, string>
  signature?: string | null
  onClose: () => void
}) {
  function handleDownloadPdf() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50" onClick={onClose}>
      <div className="font-hwp flex h-full w-full max-w-xl flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
            <IconBadge emoji="✅" color="green" size="sm" />
            완료된 서류
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="닫기">
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-100 px-6 py-6">
          <div id="printable-document">
            <DocumentPaper template={template} employee={employee} values={values}>
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-700">위와 같이 신청합니다.</p>
                <p className="mt-2 text-sm text-slate-700">{TODAY_LABEL}</p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <span className="text-sm font-medium text-slate-700">신청인 {employee?.name ?? ''}</span>
                  {signature ? (
                    <img src={signature} alt="서명" className="h-10 object-contain" />
                  ) : (
                    <HandwrittenSignature name={employee?.name ?? ''} />
                  )}
                  <span className="text-xs text-slate-400">(서명 또는 인)</span>
                </div>
              </div>
            </DocumentPaper>
          </div>
        </div>

        <footer className="flex shrink-0 gap-2 border-t border-slate-100 p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            닫기
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex-1 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            PDF 다운로드
          </button>
        </footer>
      </div>
    </div>
  )
}
