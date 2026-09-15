import { useState } from 'react'
import { fetchRecommendation } from '../api/client'
import type { Priority, RecommendationResponse } from '../types'
import AiLoading from './AiLoading'

const PRIORITY_STYLE: Record<Priority, string> = {
  긴급: 'bg-red-100 text-red-600',
  일반: 'bg-slate-100 text-slate-600',
  낮음: 'bg-slate-100 text-slate-400',
}

export default function RecommendationPanel({
  employeeId,
  question,
}: {
  employeeId: number
  question: string
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [data, setData] = useState<RecommendationResponse | null>(null)
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [error, setError] = useState('')

  async function handleRecommend() {
    setStatus('loading')
    setError('')
    try {
      const result = await fetchRecommendation(employeeId, question)
      setData(result)
      setChecked({})
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : '추천에 실패했습니다.')
      setStatus('error')
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <span className="text-brand-500">✅</span> AI 업무처리 추천
        </h2>
        <button
          onClick={handleRecommend}
          disabled={status === 'loading'}
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {status === 'done' ? '다시 추천' : '업무처리 추천'}
        </button>
      </div>

      {status === 'idle' && (
        <p className="mt-4 text-sm text-slate-400">
          버튼을 눌러 현재 문의를 처리하기 위해 확인할 업무를 추천받으세요.
        </p>
      )}
      {status === 'loading' && <AiLoading label="문의 내용을 분석하고 업무를 추천하고 있습니다..." />}
      {status === 'error' && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {status === 'done' && data && (
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {data.category}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {data.topic}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_STYLE[data.priority] ?? PRIORITY_STYLE['일반']}`}>
              우선순위 · {data.priority}
            </span>
          </div>

          <p className="text-slate-700">{data.summary}</p>

          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500">추천 업무</p>
            <ul className="space-y-1.5">
              {data.recommendedActions.map((action, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={!!checked[i]}
                      onChange={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                    />
                    <span className={checked[i] ? 'text-slate-400 line-through' : 'text-slate-700'}>
                      {action}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border-l-4 border-rose-300 bg-rose-50 px-3 py-2 text-slate-700">
            <p className="mb-0.5 text-xs font-semibold text-rose-600">주의사항</p>
            <p>{data.caution}</p>
          </div>
        </div>
      )}
    </section>
  )
}
