import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCompanies } from '../api/client'

interface CompanyContextValue {
  companies: string[]
  company: string
  setCompany: (company: string) => void
}

const CompanyContext = createContext<CompanyContextValue | null>(null)
const STORAGE_KEY = 'mmc-selected-company'

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<string[]>([])
  const [company, setCompanyState] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')

  useEffect(() => {
    fetchCompanies().then((list) => {
      setCompanies(list)
      setCompanyState((prev) => (prev && list.includes(prev) ? prev : (list[0] ?? '')))
    })
  }, [])

  function setCompany(next: string) {
    setCompanyState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <CompanyContext.Provider value={{ companies, company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany는 CompanyProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
