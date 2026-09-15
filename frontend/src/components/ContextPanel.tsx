import { useState } from 'react'
import { fetchContext } from '../api/client'
import type { ContextResponse } from '../types'
import AiLoading from './AiLoading'

export default function ContextPanel({
  employeeId,
  question,
}: {
  employeeId: number
  question: string
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [data, setData] = useState<ContextResponse | null>(null)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    setStatus('loading')
    setError('')
    try {
      const result = await fetchContext(employeeId, question)
      setData(result)
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석에 실패했습니다.')
      setStatus('error')
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <span className="text-brand-500">🧭</span> AI 문의 Context
        </h2>
        <button
          onClick={handleAnalyze}
          disabled={status === 'loading'}
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {status === 'done' ? '다시 분석' : 'AI 분석'}
        </button>
      </div>

      {status === 'idle' && (
        <p className="mt-4 text-sm text-slate-400">
          버튼을 눌러 이 직원의 과거 상담 이력을 분석하세요.
        </p>
      )}
      {status === 'loading' && <AiLoading label="과거 상담 이력을 분석하고 있습니다..." />}
      {status === 'error' && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {status === 'done' && data && (
        <div className="mt-4 space-y-4 text-sm">
          <div className="rounded-xl bg-brand-50 p-3 text-slate-700">
            <p className="mb-1 text-xs font-semibold text-brand-700">최근 문의 요약</p>
            <p>{data.summary}</p>
          </div>

          {data.recentConsultations.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">최근 문의</p>
              <table className="w-full border-collapse overflow-hidden rounded-lg text-xs">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    <th className="px-2 py-1.5 font-medium">날짜</th>
                    <th className="px-2 py-1.5 font-medium">문의 내용</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentConsultations.map((c, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="whitespace-nowrap px-2 py-1.5 text-slate-400">{c.date}</td>
                      <td className="px-2 py-1.5 text-slate-700">{c.question}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.relatedConsultation && (
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">관련 문의</p>
              <p className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700">
                {data.relatedConsultation}
              </p>
            </div>
          )}

          <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-slate-700">
            <p className="mb-0.5 text-xs font-semibold text-amber-700">AI 참고</p>
            <p>{data.note}</p>
          </div>
        </div>
      )}
    </section>
  )
}
