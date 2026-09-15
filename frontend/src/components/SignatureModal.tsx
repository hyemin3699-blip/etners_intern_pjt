import { useRef } from 'react'
import SignaturePad, { type SignaturePadHandle } from './SignaturePad'

export default function SignatureModal({
  name,
  onClose,
  onConfirm,
}: {
  name: string
  onClose: () => void
  onConfirm: (dataUrl: string) => void
}) {
  const padRef = useRef<SignaturePadHandle>(null)

  function handleConfirm() {
    const dataUrl = padRef.current?.getDataUrl()
    if (!dataUrl) return
    onConfirm(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-slate-800">서명하기</h3>
        <p className="mt-1 text-xs text-slate-400">{name}님의 서명을 입력해주세요.</p>

        <div className="mt-4">
          <SignaturePad ref={padRef} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            서명 완료
          </button>
        </div>
      </div>
    </div>
  )
}
