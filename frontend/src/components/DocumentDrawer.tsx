import { useState } from 'react'
import type { DocumentTemplate } from '../data/documentTemplates'
import type { Employee } from '../types'
import DocumentPaper from './DocumentPaper'
import IconBadge from './IconBadge'
import SignatureModal from './SignatureModal'

// Mock 데이터 기준일(2026-09-15)과 맞춰, 서류에 표시되는 "오늘 날짜"도 일관되게 고정한다.
const TODAY_LABEL = '2026년 9월 15일'

export default function DocumentDrawer({
  template,
  employee,
  onClose,
  onSend,
}: {
  template: DocumentTemplate
  employee: Employee | null
  onClose: () => void
  onSend: (values: Record<string, string>, signature: string | null) => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [signature, setSignature] = useState<string | null>(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [sending, setSending] = useState(false)

  function handleSend() {
    setSending(true)
    // 실제 전송/저장은 하지 않는 시연용 UX이므로 짧은 지연 후 완료 처리만 한다.
    setTimeout(() => {
      onSend(values, signature)
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50" onClick={onClose}>
      <div
        className="font-hwp flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
            <IconBadge emoji="📄" color="pink" size="sm" />
            AI 간편서류
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="닫기">
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-100 px-6 py-6">
          <DocumentPaper
            template={template}
            employee={employee}
            values={values}
            editable
            onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
          >
            {/* 신청 문구 + 서명란 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-700">위와 같이 신청합니다.</p>
              <p className="mt-2 text-sm text-slate-700">{TODAY_LABEL}</p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-slate-700">신청인 {employee?.name ?? ''}</span>
                {signature && <img src={signature} alt="서명" className="h-10 object-contain" />}
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="text-xs text-slate-400 underline decoration-dotted underline-offset-2 transition hover:text-brand-600"
                >
                  (서명 또는 인)
                </button>
              </div>
            </div>
          </DocumentPaper>
        </div>

        <footer className="shrink-0 border-t border-slate-100 p-4">
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? '전달하는 중...' : '고객에게 서류 보내기'}
          </button>
        </footer>
      </div>

      {showSignatureModal && (
        <div onClick={(e) => e.stopPropagation()}>
          <SignatureModal
            name={employee?.name ?? '신청인'}
            onClose={() => setShowSignatureModal(false)}
            onConfirm={(dataUrl) => {
              setSignature(dataUrl)
              setShowSignatureModal(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
