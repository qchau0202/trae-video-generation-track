import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Vault from './pages/Vault'
import CampaignBuilder from './pages/CampaignBuilder'
import Generation from './pages/Generation'
import CampaignDetail from './pages/CampaignDetail'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vault/new" element={<Vault />} />
            <Route path="/vault/:id" element={<Vault />} />
            <Route path="/vault/:id/videos" element={<CampaignBuilder />} />
            <Route path="/vault/:vaultId/videos/:videoId/generate" element={<Generation />} />
            <Route path="/vault/:vaultId/videos/:videoId" element={<CampaignDetail />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
