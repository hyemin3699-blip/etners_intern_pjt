import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// StrictMode는 개발 모드에서 effect를 두 번 실행해 각 AI 호출(Gemini 무료 할당량 소모)이
// 페이지 진입/모달 오픈마다 중복 발생시키므로, 이 프로젝트에서는 의도적으로 사용하지 않는다.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
