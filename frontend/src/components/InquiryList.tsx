import { useState } from 'react'
import type { Inquiry, InquiryStatus } from '../types'

const STATUS_STYLE: Record<string, string> = {
  대기: 'bg-slate-100 text-slate-500',
  진행중: 'bg-sky-100 text-sky-700',
  완료: 'bg-emerald-100 text-emerald-700',
}

const STATUS_FILTERS: ('전체' | InquiryStatus)[] = ['전체', '대기', '진행중', '완료']

const AVATAR_GRADIENTS = [
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-pink-400 to-rose-500',
  'from-amber-400 to-orange-500',
]

function avatarGradient(id: number) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]
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
  const [statusFilter, setStatusFilter] = useState<'전체' | InquiryStatus>('전체')
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = statusFilter === '전체' ? inquiries : inquiries.filter((i) => i.status === statusFilter)

  return (
    <section className="flex min-h-0 flex-col rounded-3xl border border-slate-100 bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
      <header className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-800">상담 신청자 목록</h2>
          <p className="text-xs text-slate-400">처리할 상담을 선택하세요</p>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            {statusFilter}
            <span className="text-[9px] text-slate-400">{filterOpen ? '▲' : '▼'}</span>
          </button>

          {filterOpen && (
            <ul className="absolute right-0 top-full z-20 mt-2 w-24 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
              {STATUS_FILTERS.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => {
                      setStatusFilter(s)
                      setFilterOpen(false)
                    }}
                    className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-slate-50 ${
                      s === statusFilter ? 'font-semibold text-brand-600' : 'text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-400">해당 상태의 상담이 없습니다.</p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {filtered.map((inquiry) => {
            const active = inquiry.id === selectedId
            return (
              <li key={inquiry.id}>
                <button
                  onClick={() => onSelect(inquiry)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-400 ${
                    active ? 'bg-brand-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-sm ${avatarGradient(inquiry.id)}`}
                  >
                    {inquiry.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-800">{inquiry.name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[inquiry.status] ?? STATUS_STYLE['대기']}`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{inquiry.company}</p>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">{inquiry.question}</p>
                    <p className="mt-1.5 text-[11px] text-slate-300">{inquiry.receivedAt} · {inquiry.category}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
