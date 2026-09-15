import type { DocumentStatus } from '../types'

export default function DocumentStatusCard({ status, onClick }: { status: DocumentStatus; onClick?: () => void }) {
  const clickable = status.state === 'completed' && !!onClick

  const content = (
    <>
      <p className="text-sm font-bold text-slate-800">📄 {status.name}</p>
      {status.state === 'requested' ? (
        <>
          <p className="mt-1.5 text-xs text-slate-500">간편서류 작성 요청을 고객에게 전달했습니다.</p>
          <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
            상태: 작성 요청
          </span>
        </>
      ) : (
        <>
          <div className="mt-2 space-y-1 text-xs font-semibold text-emerald-600">
            <p>✓ 고객 작성 완료</p>
            <p>✓ 회신 완료</p>
          </div>
          {clickable && <p className="mt-2 text-[11px] font-semibold text-brand-600">완료된 서류 보기 →</p>}
        </>
      )}
    </>
  )

  if (clickable) {
    return (
      <button
        onClick={onClick}
        className="mx-auto block w-full max-w-xs rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] transition hover:border-brand-200 hover:shadow-md"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xs rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)]">
      {content}
    </div>
  )
}
