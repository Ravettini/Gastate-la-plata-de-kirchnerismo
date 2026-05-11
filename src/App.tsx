import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CaseSimulator } from './pages/CaseSimulator'
import { Dashboard } from './pages/Dashboard'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/caso/:id" element={<CaseSimulator />} />
      </Routes>
    </BrowserRouter>
  )
}
