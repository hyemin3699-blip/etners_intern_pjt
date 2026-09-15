import { NavLink, Route, Routes } from 'react-router-dom'
import IconBadge from './components/IconBadge'
import ConsultationPage from './pages/ConsultationPage'
import FaqInsightPage from './pages/FaqInsightPage'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
  }`

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3">
        <div className="flex items-center gap-2.5">
          <IconBadge emoji="🔍" color="orange" size="sm" />
          <h1 className="text-base font-bold text-slate-800">AI 업무처리 Assistant</h1>
        </div>
        <nav className="flex gap-1 rounded-full bg-slate-100 p-1">
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
