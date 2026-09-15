import { useState } from 'react'
import { useCompany } from '../context/CompanyContext'

export default function CompanySelector({ align = 'left' }: { align?: 'left' | 'right' }) {
  const { companies, company, setCompany } = useCompany()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <span>🏢</span>
        <span>{company || '회사를 선택하세요'}</span>
        <span className="text-[10px] text-slate-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <ul
          className={`absolute top-full z-20 mt-2 max-h-64 w-48 overflow-y-auto rounded-xl border border-slate-100 bg-white py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {companies.map((c) => (
            <li key={c}>
              <button
                onClick={() => {
                  setCompany(c)
                  setOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                  c === company ? 'font-semibold text-brand-600' : 'text-slate-600'
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
