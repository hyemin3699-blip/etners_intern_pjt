import { NavLink, Route, Routes } from 'react-router-dom'
import ConsultationPage from './pages/ConsultationPage'
import FaqInsightPage from './pages/FaqInsightPage'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
    isActive ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-100'
  }`

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h1 className="text-base font-bold text-slate-800">AI 업무처리 Assistant</h1>
        </div>
        <nav className="flex gap-1">
          <NavLink to="/" end className={navLinkClass}>
            상담 처리
          </NavLink>
          <NavLink to="/faq-insight" className={navLinkClass}>
            AI FAQ Insight
          </NavLink>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<ConsultationPage />} />
          <Route path="/faq-insight" element={<FaqInsightPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
