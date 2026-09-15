import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCompanies, fetchFaqAnalysis, fetchInquiries } from '../api/client'
import CategoryBarChart from '../components/CategoryBarChart'
import StatCard from '../components/StatCard'
import WorkInsightCard, { type WorkInsight } from '../components/WorkInsightCard'
import WorkStatusPill from '../components/WorkStatusPill'
import type { FaqAnalysisResponse, Inquiry, InquiryStatus } from '../types'

const PERIOD = '30days'
const PERIOD_LABEL = '최근 30일'

const STATUS_STYLE: Record<InquiryStatus, string> = {
  대기: 'bg-slate-100 text-slate-500',
  진행중: 'bg-sky-100 text-sky-700',
  완료: 'bg-emerald-100 text-emerald-700',
}

function insightMetaForCategory(category: string): Pick<WorkInsight, 'badge' | 'actionLabel' | 'actionTo'> {
  if (category === '연말정산') return { badge: '자료 확인', actionLabel: '근거자료 확인', actionTo: '/evidence' }
  if (category === '복리후생') return { badge: 'FAQ 추천', actionLabel: 'FAQ 생성 검토', actionTo: '/faq-insight' }
  return { badge: '주의', actionLabel: '상담 확인', actionTo: '/consultation' }
}

export default function DashboardPage() {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [data, setData] = useState<FaqAnalysisResponse | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [insights, setInsights] = useState<WorkInsight[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    async function load() {
      const [analysis, inquiryList, companies] = await Promise.all([
        fetchFaqAnalysis(PERIOD),
        fetchInquiries(),
        fetchCompanies(),
      ])
      if (cancelled) return
      setData(analysis)
      setInquiries(inquiryList)

      // 대시보드는 전체 회사 개요지만, "AI가 발견한 업무 인사이트"는 담당자가 바로
      // 확인할 수 있도록 일부 고객사를 표본으로 뽑아 회사별 1순위 FAQ 후보를 보여준다.
      const sampleCompanies = companies.slice(0, 3)
      const perCompany = await Promise.all(sampleCompanies.map((c) => fetchFaqAnalysis(PERIOD, c)))
      if (cancelled) return
      const built = perCompany
        .map((res, i) => {
          const top = res.faqCandidates[0]
          if (!top) return null
          const meta = insightMetaForCategory(top.category)
          const insight: WorkInsight = {
            id: sampleCompanies[i],
            company: sampleCompanies[i],
            category: top.category,
            description: top.reason,
            count: top.count,
            ...meta,
          }
          return insight
        })
        .filter((v): v is WorkInsight => v !== null)
      setInsights(built)
    }

    load()
      .then(() => {
        if (!cancelled) setStatus('done')
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '분석에 실패했습니다.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const waiting = inquiries.filter((i) => i.status === '대기').length
  const inProgress = inquiries.filter((i) => i.status === '진행중').length
  const done = inquiries.filter((i) => i.status === '완료').length
  const recent = inquiries.slice(0, 5)

  return (
    <div className="flex-1 space-y-5 p-5">
      <header>
        <h1 className="text-lg font-bold text-slate-800">대시보드</h1>
        <p className="text-sm text-slate-400">{PERIOD_LABEL} 전체 고객사 상담 현황입니다.</p>
      </header>

      {status === 'loading' && (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
          상담 데이터를 분석하고 있습니다...
        </div>
      )}
      {status === 'error' && <p className="text-sm text-red-500">{error}</p>}

      {status === 'done' && data && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <StatCard label="총 문의" value={data.totalConsultations} suffix="건" emoji="💬" color="blue" />
            <StatCard label="반복 문의" value={data.repeatedConsultations} suffix="건" emoji="🔁" color="purple" />
            <StatCard label="FAQ 후보" value={data.faqCandidateCount} suffix="건" emoji="⭐" color="orange" accent />
          </div>

          {/* A. AI 업무 현황 */}
          <div>
            <h2 className="mb-2.5 text-sm font-bold text-slate-700">AI 업무 현황</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <WorkStatusPill emoji="🟠" label="처리 대기" value={waiting} color="orange" />
              <WorkStatusPill emoji="🔎" label="AI 분석 완료" value={done} color="blue" />
              <WorkStatusPill emoji="⚠️" label="검토 필요" value={inProgress} color="yellow" />
              <WorkStatusPill emoji="📋" label="FAQ 전환 가능" value={data.faqCandidateCount} color="green" />
            </div>
          </div>

          {/* B. AI가 발견한 업무 인사이트 */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
            <h2 className="text-sm font-bold text-slate-700">AI가 발견한 업무 인사이트</h2>
            <p className="mb-4 mt-1 text-xs text-slate-400">
              최근 상담 데이터를 분석해 담당자가 확인할 주요 업무 이슈를 알려드립니다.
            </p>
            {insights.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">현재 눈에 띄는 이슈가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {insights.map((insight) => (
                  <WorkInsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
            <h2 className="mb-4 text-sm font-bold text-slate-700">문의 유형 분석 (전체 고객사)</h2>
            <CategoryBarChart data={data.categoryDistribution} />
          </div>

          {/* C. 최근 상담 */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">최근 상담</h2>
              <Link to="/consultation" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                상담 화면에서 보기 →
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">최근 상담 내역이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((inquiry) => (
                  <li key={inquiry.id} className="flex items-center gap-3 py-3">
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[inquiry.status]}`}>
                      {inquiry.status}
                    </span>
                    <span className="w-24 shrink-0 truncate text-xs text-slate-400">{inquiry.company}</span>
                    <span className="w-16 shrink-0 truncate text-xs text-slate-400">{inquiry.category}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{inquiry.question}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
