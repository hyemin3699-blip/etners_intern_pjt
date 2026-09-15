import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadEvidenceDocument } from '../api/client'
import { useCompany } from '../context/CompanyContext'
import type { EvidenceScope } from '../types'

const CATEGORIES = ['급여', '복리후생', '연말정산', '기타']

export default function EvidenceUploadPage() {
  const navigate = useNavigate()
  const { companies, company: currentCompany } = useCompany()
  const [scope, setScope] = useState<EvidenceScope>('company')
  const [company, setCompany] = useState(currentCompany)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [name, setName] = useState('')
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [error, setError] = useState('')

  const canSubmit = category && name.trim() && (scope === 'common' || company) && status !== 'saving'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, ''))
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setStatus('saving')
    setError('')
    try {
      await uploadEvidenceDocument({
        scope,
        company: scope === 'company' ? company : undefined,
        category,
        name: name.trim(),
        description: description.trim(),
        fileName: fileName || undefined,
      })
      navigate('/evidence')
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드에 실패했습니다.')
      setStatus('idle')
    }
  }

  return (
    <div className="flex-1 space-y-5 p-5">
      <header>
        <h1 className="text-lg font-bold text-slate-800">자료 업로드</h1>
        <p className="text-sm text-slate-400">근거자료로 활용할 사내 규정/지침 자료를 등록합니다.</p>
      </header>

      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-slate-100 bg-white p-6 text-sm shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">구분</label>
          <div className="flex gap-1 rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setScope('common')}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                scope === 'common' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              공통 자료
            </button>
            <button
              onClick={() => setScope('company')}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                scope === 'company' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              고객사 자료
            </button>
          </div>
        </div>

        {scope === 'company' && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">회사</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">분류</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">파일</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full rounded-2xl border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">문서명</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 복리후생 규정.pdf"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            설명/메모 <span className="font-normal text-slate-400">(선택)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-2xl border border-slate-200 px-3 py-2.5 text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {status === 'error' && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => navigate('/evidence')}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'saving' ? '등록 중...' : '자료 등록'}
          </button>
        </div>
      </div>
    </div>
  )
}
