import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import MascotIcon from './MascotIcon'

const NAV_ITEMS = [
  { to: '/', end: true, emoji: '🏠', label: '대시보드' },
  { to: '/consultation', end: false, emoji: '💬', label: '상담' },
  { to: '/evidence', end: true, emoji: '📚', label: '근거자료' },
  { to: '/evidence/upload', end: false, emoji: '📤', label: '자료 업로드' },
  { to: '/faq-insight', end: false, emoji: '📊', label: 'FAQ Insight' },
  { to: '/faq-list', end: false, emoji: '📋', label: 'FAQ 목록' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      collapsed ? 'justify-center' : ''
    } ${isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-y-auto border-r border-slate-100 bg-white py-5 transition-all duration-200 ${
        collapsed ? 'w-[68px] px-2' : 'w-60 px-4'
      }`}
    >
      <div className={`mb-4 flex items-center px-1 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-2">
            <MascotIcon className="h-8 w-8 shrink-0" />
            <p className="text-xs font-bold leading-tight text-slate-800">
              AI 업무처리
              <br />
              Assistant
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
          title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
        >
          <span className="text-lg leading-none">☰</span>
        </button>
      </div>

      {collapsed && (
        <div className="mb-4 flex justify-center">
          <MascotIcon className="h-8 w-8" />
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navItemClass} title={collapsed ? item.label : undefined}>
            <span>{item.emoji}</span>
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
