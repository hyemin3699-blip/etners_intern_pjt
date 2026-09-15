import { useEffect, useState } from 'react'
import { deleteEvidenceDocument, fetchEvidenceDocuments } from '../api/client'
import CompanySelector from '../components/CompanySelector'
import EvidenceViewerModal from '../components/EvidenceViewerModal'
import { useCompany } from '../context/CompanyContext'
import type { EvidenceDocument, EvidenceScope } from '../types'

const CATEGORIES = ['급여', '복리후생', '연말정산', '기타']

export default function EvidencePage() {
  const { company } = useCompany()
  const [scope, setScope] = useState<EvidenceScope>('common')
  const [category, setCategory] = useState('전체')
  const [docs, setDocs] = useState<EvidenceDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [viewingId, setViewingId] = useState<number | null>(null)

  function load() {
    if (scope === 'company' && !company) return
    setLoading(true)
    fetchEvidenceDocuments({
      scope,
      company: scope === 'company' ? company : undefined,
      category: category === '전체' ? undefined : category,
    })
      .then(setDocs)
      .finally(() => setLoading(false))
  }

  useEffect(load, [scope, company, category])

  async function handleDelete(id: number) {
    if (!confirm('이 자료를 삭제하시겠습니까?')) return
    await deleteEvidenceDocument(id)
    load()
  }

  return (
    <div className="flex-1 space-y-5 p-5">
      <header>
        <h1 className="text-lg font-bold text-slate-800">근거자료</h1>
        <p className="text-sm text-slate-400">업무 처리에 활용할 사내 규정/지침 자료를 확인합니다.</p>
      </header>

      <div className="flex gap-1 rounded-full bg-slate-100 p-1 sm:w-fit">
        <button
          onClick={() => setScope('common')}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition sm:flex-none ${
            scope === 'common' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          공통 자료
        </button>
        <button
          onClick={() => setScope('company')}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition sm:flex-none ${
            scope === 'company' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          고객사 자료
        </button>
      </div>

      {scope === 'common' ? (
        <p className="text-xs text-slate-400">고객사와 무관하게 담당자가 기본적으로 알아야 하는 공통 업무 지식입니다.</p>
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
        ) : docs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">등록된 자료가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xl">📄</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{d.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {d.category} · 업데이트 {d.uploadedAt}
                      {d.sectionCount > 0 && ` · AI 검색 대상 ${d.sectionCount}건`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setViewingId(d.id)}
                    className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    보기
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="rounded-full border border-red-100 px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewingId !== null && <EvidenceViewerModal documentId={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  )
}
