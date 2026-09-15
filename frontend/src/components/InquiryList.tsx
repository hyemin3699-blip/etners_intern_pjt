import type { Inquiry } from '../types'

const STATUS_STYLE: Record<string, string> = {
  대기: 'bg-amber-100 text-amber-700',
  진행중: 'bg-brand-100 text-brand-700',
  완료: 'bg-slate-100 text-slate-500',
}

export default function InquiryList({
  inquiries,
  selectedId,
  onSelect,
}: {
  inquiries: Inquiry[]
  selectedId: number | null
  onSelect: (inquiry: Inquiry) => void
}) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-800">상담 신청자 목록</h2>
        <p className="text-xs text-slate-400">처리할 상담을 선택하세요</p>
      </header>
      <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
        {inquiries.map((inquiry) => {
          const active = inquiry.id === selectedId
          return (
            <li key={inquiry.id}>
              <button
                onClick={() => onSelect(inquiry)}
                className={`block w-full px-4 py-3 text-left transition ${
                  active ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{inquiry.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[inquiry.status] ?? STATUS_STYLE['대기']}`}>
                    {inquiry.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{inquiry.company}</p>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">{inquiry.question}</p>
                <p className="mt-1.5 text-[11px] text-slate-300">{inquiry.receivedAt} · {inquiry.category}</p>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
