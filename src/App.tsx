import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AnalyticsTracker } from './components/AnalyticsTracker'
import { CaseSimulator } from './pages/CaseSimulator'
import { Dashboard } from './pages/Dashboard'
import { GameEnterrarlaToda } from './pages/GameEnterrarlaToda'
import { StatsDashboard } from './pages/StatsDashboard'

export function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/caso/:id" element={<CaseSimulator />} />
        <Route path="/juegos/enterrarla-toda" element={<GameEnterrarlaToda />} />
        <Route path="/dashboard" element={<StatsDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
