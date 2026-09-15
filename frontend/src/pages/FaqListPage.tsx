import { useEffect, useState } from 'react'
import { deleteRegisteredFaq, fetchRegisteredFaqs } from '../api/client'
import CompanySelector from '../components/CompanySelector'
import { useCompany } from '../context/CompanyContext'
import type { RegisteredFaq } from '../types'

const CATEGORIES = ['급여', '복리후생', '연말정산', '기타']

export default function FaqListPage() {
  const { company } = useCompany()
  const [scope, setScope] = useState<'common' | 'company'>('common')
  const [category, setCategory] = useState('전체')
  const [faqs, setFaqs] = useState<RegisteredFaq[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  function load() {
    if (scope === 'company' && !company) return
    setLoading(true)
    fetchRegisteredFaqs({ scope, company: scope === 'company' ? company : undefined })
      .then(setFaqs)
      .finally(() => setLoading(false))
  }

  useEffect(load, [scope, company])

  async function handleDelete(id: number) {
    if (!confirm('이 FAQ를 삭제하시겠습니까?')) return
    await deleteRegisteredFaq(id)
    load()
  }

  const filtered = category === '전체' ? faqs : faqs.filter((f) => f.category === category)

  return (
    <div className="flex-1 space-y-5 p-5">
      <header>
        <h1 className="text-lg font-bold text-slate-800">FAQ 목록</h1>
        <p className="text-sm text-slate-400">등록된 FAQ를 확인하고 관리합니다.</p>
      </header>

      <div className="flex gap-1 rounded-full bg-slate-100 p-1 sm:w-fit">
        <button
          onClick={() => setScope('common')}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition sm:flex-none ${
            scope === 'common' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          전 고객사 공통 FAQ
        </button>
        <button
          onClick={() => setScope('company')}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition sm:flex-none ${
            scope === 'company' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          고객사별 FAQ
        </button>
      </div>

      {scope === 'common' ? (
        <p className="text-xs text-slate-400">특정 고객사에 국한되지 않고 공통적으로 자주 나오는 FAQ입니다.</p>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">현재 고객사</span>
          <CompanySelector />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['전체', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              category === c
                ? 'bg-brand-500 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
        {scope === 'company' && !company ? (
          <p className="py-8 text-center text-sm text-slate-400">먼저 위에서 회사를 선택하세요.</p>
        ) : loading ? (
          <p className="py-8 text-center text-sm text-slate-400">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            등록된 FAQ가 없습니다.
            <br />
            FAQ Insight에서 FAQ 초안을 생성하고 등록해보세요.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((f) => {
              const expanded = expandedId === f.id
              return (
                <li key={f.id} className="py-3.5">
                  <button
                    onClick={() => setExpandedId(expanded ? null : f.id)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                          {f.category}
                        </span>
                        {f.company && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                            {f.company}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-300">{f.createdAt.slice(0, 10)}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{f.question}</p>
                      {!expanded && <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{f.answer}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-slate-300">{expanded ? '접기 ▲' : '펼치기 ▼'}</span>
                  </button>

                  {expanded && (
                    <div className="mt-3 flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-sm leading-relaxed text-slate-700">{f.answer}</p>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="shrink-0 rounded-full border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
