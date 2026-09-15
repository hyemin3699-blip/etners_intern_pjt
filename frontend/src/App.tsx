import { Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { CompanyProvider } from './context/CompanyContext'
import ConsultationPage from './pages/ConsultationPage'
import DashboardPage from './pages/DashboardPage'
import EvidencePage from './pages/EvidencePage'
import EvidenceUploadPage from './pages/EvidenceUploadPage'
import FaqInsightPage from './pages/FaqInsightPage'
import FaqListPage from './pages/FaqListPage'

function App() {
  return (
    <CompanyProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/evidence/upload" element={<EvidenceUploadPage />} />
            <Route path="/faq-insight" element={<FaqInsightPage />} />
            <Route path="/faq-list" element={<FaqListPage />} />
          </Routes>
        </main>
      </div>
    </CompanyProvider>
  )
}

export default App
