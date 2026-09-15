export default function StatCard({
  label,
  value,
  suffix,
  accent,
}: {
  label: string
  value: number
  suffix?: string
  accent?: boolean
}) {
  return (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1.5 text-3xl font-bold ${accent ? 'text-brand-500' : 'text-slate-800'}`}>
        {value.toLocaleString()}
        {suffix && <span className="ml-1 text-base font-medium text-slate-400">{suffix}</span>}
      </p>
    </div>
  )
}
