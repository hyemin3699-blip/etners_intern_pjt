import { Link } from 'react-router-dom'

const BADGE_STYLE: Record<string, string> = {
  주의: 'bg-rose-50 text-rose-600',
  'FAQ 추천': 'bg-emerald-50 text-emerald-600',
  '자료 확인': 'bg-sky-50 text-sky-600',
}

export interface WorkInsight {
  id: string
  badge: '주의' | 'FAQ 추천' | '자료 확인'
  company: string
  category: string
  description: string
  count: number
  actionLabel: string
  actionTo: string
}

export default function WorkInsightCard({ insight }: { insight: WorkInsight }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE_STYLE[insight.badge]}`}>{insight.badge}</span>
        <span className="truncate text-xs font-semibold text-slate-500">
          {insight.company} · {insight.category}
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700">{insight.description}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          최근 문의 <b className="text-slate-600">{insight.count}건</b>
        </span>
        <Link
          to={insight.actionTo}
          className="shrink-0 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600"
        >
          {insight.actionLabel} →
        </Link>
      </div>
    </div>
  )
}
