import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './Welcome'
import SendComplaint from './sendComplaint'
import TrackCase from './trackCase'
import AgencyPortal from './AgencyPortal'
import StatusDashboard from './statusCard'
import AgencyDashboard from './AgencyDashboard'
import ComplaintDetails from './complaint'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/send-complaint" element={<SendComplaint />} />
        <Route path="/track-case" element={<TrackCase />} />
        <Route path="/agency-portal" element={<AgencyPortal />} />
        <Route path="/status-dashboard" element={<StatusDashboard />} />
        <Route path="/agency-dashboard" element={<AgencyDashboard />} />
        <Route path="/complaint" element={< ComplaintDetails/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
