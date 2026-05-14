import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { CaseSimulator } from './pages/CaseSimulator'
import { Dashboard } from './pages/Dashboard'
import { GameEnterrarlaToda } from './pages/GameEnterrarlaToda'
import { GameGondola } from './pages/GameGondola'

export function App() {
  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/caso/:id" element={<CaseSimulator />} />
        <Route path="/juegos/enterrarla-toda" element={<GameEnterrarlaToda />} />
        <Route path="/juegos/metro-gondola" element={<GameGondola />} />
      </Routes>
    </BrowserRouter>
  )
}
