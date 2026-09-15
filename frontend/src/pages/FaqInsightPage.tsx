import { useEffect, useState } from 'react'
import { fetchFaqAnalysis } from '../api/client'
import CategoryBarChart from '../components/CategoryBarChart'
import FaqDraftModal from '../components/FaqDraftModal'
import StatCard from '../components/StatCard'
import type { FaqAnalysisResponse, FaqCandidate } from '../types'

const PERIOD = '30days'
const PERIOD_LABEL = '최근 30일'

export default function FaqInsightPage() {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [data, setData] = useState<FaqAnalysisResponse | null>(null)
  const [selected, setSelected] = useState<FaqCandidate | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setStatus('loading')
    fetchFaqAnalysis(PERIOD)
      .then((res) => {
        setData(res)
        setStatus('done')
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : '분석에 실패했습니다.')
        setStatus('error')
      })
  }, [])

  return (
    <div className="flex-1 space-y-5 p-5">
      <header>
        <h1 className="text-lg font-bold text-slate-800">AI FAQ Insight</h1>
        <p className="text-sm text-slate-400">{PERIOD_LABEL} 상담 데이터를 AI가 분석한 결과입니다.</p>
      </header>

      {status === 'loading' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          상담 데이터를 분석하고 있습니다...
        </div>
      )}
      {status === 'error' && <p className="text-sm text-red-500">{error}</p>}

      {status === 'done' && data && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <StatCard label="총 문의" value={data.totalConsultations} suffix="건" />
            <StatCard label="반복 문의" value={data.repeatedConsultations} suffix="건" />
            <StatCard label="FAQ 후보" value={data.faqCandidateCount} suffix="건" accent />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-700">문의 유형 분석</h2>
            <CategoryBarChart data={data.categoryDistribution} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-700">AI FAQ 추천</h2>
            <ul className="divide-y divide-slate-100">
              {data.faqCandidates.map((c, i) => (
                <li key={c.title} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-400">{c.reason}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">{c.count}건</span>
                    <button
                      onClick={() => setSelected(c)}
                      className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                    >
                      FAQ 초안 생성
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {selected && (
        <FaqDraftModal candidate={selected} period={PERIOD} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
