import IconBadge, { type IconBadgeColor } from './IconBadge'

export default function StatCard({
  label,
  value,
  suffix,
  emoji,
  color = 'blue',
  accent,
}: {
  label: string
  value: number
  suffix?: string
  emoji: string
  color?: IconBadgeColor
  accent?: boolean
}) {
  return (
    <div className="flex flex-1 items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
      <IconBadge emoji={emoji} color={color} size="lg" />
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${accent ? 'text-brand-500' : 'text-slate-800'}`}>
          {value.toLocaleString()}
          {suffix && <span className="ml-1 text-base font-medium text-slate-400">{suffix}</span>}
        </p>
      </div>
    </div>
  )
}
