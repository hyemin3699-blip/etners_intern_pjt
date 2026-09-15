const GRADIENTS = {
  orange: 'from-brand-400 to-brand-600',
  blue: 'from-sky-400 to-blue-500',
  purple: 'from-violet-400 to-purple-500',
  green: 'from-emerald-400 to-teal-500',
  pink: 'from-pink-400 to-rose-500',
} as const

export type IconBadgeColor = keyof typeof GRADIENTS

export default function IconBadge({
  emoji,
  color = 'orange',
  size = 'md',
}: {
  emoji: string
  color?: IconBadgeColor
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-2xl' : size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-base'
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-[0_4px_10px_-2px_rgba(0,0,0,0.18)] ring-1 ring-white/40 ${GRADIENTS[color]} ${sizeClass}`}
    >
      <span className="drop-shadow-sm">{emoji}</span>
    </span>
  )
}
