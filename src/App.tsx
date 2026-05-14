import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { CaseSimulator } from './pages/CaseSimulator'
import { Dashboard } from './pages/Dashboard'
import { GameEnterrarlaToda } from './pages/GameEnterrarlaToda'

export function App() {
  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/caso/:id" element={<CaseSimulator />} />
        <Route path="/juegos/enterrarla-toda" element={<GameEnterrarlaToda />} />
      </Routes>
    </BrowserRouter>
  )
}
