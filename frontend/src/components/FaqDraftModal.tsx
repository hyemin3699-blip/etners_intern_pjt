import { useEffect, useState } from 'react'
import { fetchFaqDraft, registerFaq } from '../api/client'
import type { FaqCandidate, FaqDraftResponse } from '../types'
import AiLoading from './AiLoading'
import IconBadge from './IconBadge'

export default function FaqDraftModal({
  candidate,
  period,
  onClose,
}: {
  candidate: FaqCandidate
  period: string
  onClose: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [data, setData] = useState<FaqDraftResponse | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [registerState, setRegisterState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    fetchFaqDraft(candidate.category, candidate.title, period)
      .then((res) => {
        if (cancelled) return
        setData(res)
        setQuestion(res.question)
        setAnswer(res.answer)
        setStatus('done')
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'FAQ 초안 생성에 실패했습니다.')
        setStatus('error')
      })
    // React StrictMode(개발 모드)는 effect를 한 번 더 실행해 마운트를 검증한다.
    // 이 cleanup은 그 첫 번째(버려질) 실행의 결과만 무시하도록 막아준다.
    return () => {
      cancelled = true
    }
  }, [candidate, period])

  async function handleRegister() {
    setRegisterState('saving')
    try {
      await registerFaq(candidate.category, candidate.title, question, answer)
      setRegisterState('done')
    } catch {
      setRegisterState('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
            <IconBadge emoji="📝" color="pink" size="sm" />
            FAQ 초안
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="닫기">
            ✕
          </button>
        </div>

        {status === 'loading' && <AiLoading label="기존 담당자 답변을 바탕으로 FAQ 초안을 작성하고 있습니다..." />}
        {status === 'error' && <p className="text-sm text-red-500">{error}</p>}

        {status === 'done' && data && (
          <div className="space-y-4 text-sm">
            {registerState === 'done' ? (
              <div className="rounded-2xl bg-brand-50 px-4 py-6 text-center">
                <p className="text-2xl">🎉</p>
                <p className="mt-1 text-sm font-semibold text-brand-700">FAQ로 등록되었습니다.</p>
                <button
                  onClick={onClose}
                  className="mt-4 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  닫기
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-600" htmlFor="faq-question">
                    질문
                  </label>
                  <input
                    id="faq-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full rounded-2xl bg-brand-50 px-3 py-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="faq-answer">
                    답변 <span className="font-normal text-slate-400">(직접 수정 가능)</span>
                  </label>
                  <textarea
                    id="faq-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-slate-200 px-3 py-2.5 leading-relaxed text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div className="flex gap-4 rounded-2xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                  <span>참고 상담 총 <b className="text-slate-800">{data.referenceCount}건</b></span>
                  <span>최근 상담 <b className="text-slate-800">{data.recentCount}건</b></span>
                  <span>담당자 답변 <b className="text-slate-800">{data.answeredCount}건</b> 존재</span>
                </div>

                {registerState === 'error' && (
                  <p className="text-xs text-red-500">등록에 실패했습니다. 다시 시도해주세요.</p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={onClose}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                  >
                    닫기
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={!question.trim() || !answer.trim() || registerState === 'saving'}
                    className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {registerState === 'saving' ? '등록 중...' : '등록하기'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
