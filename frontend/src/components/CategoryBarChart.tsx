import type { CategoryDistributionItem } from '../types'

export default function CategoryBarChart({ data }: { data: CategoryDistributionItem[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.category} className="flex items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-slate-500">{d.category}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-semibold text-slate-700">{d.count}</span>
        </div>
      ))}
    </div>
  )
}
