const COLOR_STYLE = {
  orange: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'ring-brand-100' },
  blue: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  red: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
} as const

export type WorkStatusColor = keyof typeof COLOR_STYLE

export default function WorkStatusPill({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string
  label: string
  value: number
  color: WorkStatusColor
}) {
  const style = COLOR_STYLE[color]
  return (
    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)]">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ring-1 ${style.bg} ${style.ring}`}>
        {emoji}
      </span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-xl font-bold leading-tight ${style.text}`}>
          {value}
          <span className="ml-0.5 text-xs font-medium text-slate-400">건</span>
        </p>
      </div>
    </div>
  )
}
