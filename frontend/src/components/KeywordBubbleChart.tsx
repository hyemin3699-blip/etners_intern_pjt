import { useEffect, useMemo, useRef, useState } from 'react'
import type { FaqCandidate } from '../types'

// 부드러운 파스텔 톤 팔레트(반투명) — 버블마다 순환 사용해 다양한 색감을 준다.
const PALETTE = [
  { bg: 'rgba(255,138,101,0.55)', border: 'rgba(255,111,61,0.9)' }, // coral
  { bg: 'rgba(147,129,255,0.48)', border: 'rgba(124,102,255,0.85)' }, // lavender
  { bg: 'rgba(93,188,230,0.48)', border: 'rgba(56,161,214,0.85)' }, // sky blue
  { bg: 'rgba(93,201,170,0.48)', border: 'rgba(56,178,143,0.85)' }, // mint
  { bg: 'rgba(255,179,128,0.55)', border: 'rgba(255,150,84,0.9)' }, // peach
  { bg: 'rgba(255,158,181,0.48)', border: 'rgba(255,120,150,0.85)' }, // soft rose
]

interface BubbleNode {
  x: number
  y: number
  r: number
  candidate: FaqCandidate
}

const HEIGHT = 300
const PADDING = 8

// 간단한 원형 패킹 시뮬레이션: 초기 위치를 원형으로 흩뿌린 뒤,
// 중심으로 당기는 힘 + 겹침 해소를 반복해 자연스럽게 뭉친 배치를 만든다.
function computeLayout(data: FaqCandidate[], width: number, height: number): BubbleNode[] {
  const n = data.length
  if (n === 0 || width === 0) return []

  const counts = data.map((d) => d.count)
  const maxCount = Math.max(...counts)
  const minCount = Math.min(...counts)
  const shortSide = Math.min(width, height)
  const minR = Math.max(34, shortSide * 0.11)
  const maxR = Math.max(minR + 14, shortSide * 0.24)

  const radii = counts.map((c) => {
    if (maxCount === minCount) return (minR + maxR) / 2
    const ratio = Math.sqrt((c - minCount) / (maxCount - minCount))
    return minR + ratio * (maxR - minR)
  })

  const cx = width / 2
  const cy = height / 2
  const nodes: BubbleNode[] = data.map((candidate, i) => {
    const angle = (i / n) * Math.PI * 2
    const dist = shortSide * 0.22
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: radii[i],
      candidate,
    }
  })

  for (let iter = 0; iter < 400; iter++) {
    for (const node of nodes) {
      node.x += (cx - node.x) * 0.012
      node.y += (cy - node.y) * 0.012
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
        const minDist = a.r + b.r + PADDING
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2
          const ux = dx / dist
          const uy = dy / dist
          a.x -= ux * overlap
          a.y -= uy * overlap
          b.x += ux * overlap
          b.y += uy * overlap
        }
      }
    }
    for (const node of nodes) {
      node.x = Math.min(width - node.r, Math.max(node.r, node.x))
      node.y = Math.min(height - node.r, Math.max(node.r, node.y))
    }
  }

  return nodes
}

export default function KeywordBubbleChart({
  data,
  selectedTitle,
  onSelect,
}: {
  data: FaqCandidate[]
  selectedTitle?: string | null
  onSelect?: (candidate: FaqCandidate) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(w)
    })
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  const nodes = useMemo(() => computeLayout(data, width, HEIGHT), [data, width])
  const hovered = nodes.find((n) => n.candidate.title === hoveredTitle)

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">표시할 문의 데이터가 없습니다.</p>
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: HEIGHT }}>
      {nodes.map((node, i) => {
        const { candidate: d, r, x, y } = node
        const palette = PALETTE[i % PALETTE.length]
        const isSelected = d.title === selectedTitle
        const isHovered = d.title === hoveredTitle
        return (
          <button
            key={d.title}
            onMouseEnter={() => setHoveredTitle(d.title)}
            onMouseLeave={() => setHoveredTitle((prev) => (prev === d.title ? null : prev))}
            onClick={() => onSelect?.(d)}
            className="absolute flex flex-col items-center justify-center rounded-full text-center transition-[left,top,transform] duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            style={{
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              backgroundColor: palette.bg,
              border: `1.5px solid ${palette.border}`,
              boxShadow: isSelected
                ? `0 6px 20px -4px ${palette.border}`
                : '0 4px 12px -4px rgba(15,23,42,0.12)',
              transform: isHovered || isSelected ? 'scale(1.08)' : 'scale(1)',
              opacity: hoveredTitle && !isHovered ? 0.75 : 1,
              zIndex: isHovered || isSelected ? 10 : 1,
            }}
          >
            <span
              className="line-clamp-2 px-2 font-semibold leading-tight text-slate-700"
              style={{ fontSize: Math.max(10.5, Math.min(14, r / 3.4)) }}
            >
              {d.title}
            </span>
            <span className="mt-0.5 font-bold text-slate-600" style={{ fontSize: Math.max(10, Math.min(12, r / 4.2)) }}>
              {d.count}건
            </span>
          </button>
        )
      })}

      {hovered && (
        <div
          className="pointer-events-none absolute z-20 w-52 -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-xl"
          style={{
            left: Math.min(Math.max(hovered.x, 104), width - 104),
            top: Math.max(hovered.y - hovered.r - 10, 8),
            transform: 'translateY(-100%)',
          }}
        >
          <p className="text-xs font-bold text-slate-800">{hovered.candidate.title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{hovered.candidate.reason}</p>
          <p className="mt-1.5 text-[11px] font-semibold text-brand-600">{hovered.candidate.count}건의 반복 문의</p>
        </div>
      )}
    </div>
  )
}
