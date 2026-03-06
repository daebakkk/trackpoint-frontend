import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Landingpg from './pages/Landingpg';
import Signup from './pages/Signup';
import Assets from './pages/Assets';
import Staff from './pages/Staff';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Location from './pages/Location';
import Assignments from './pages/Assignments';

function App() {
  return (
  <>
    <Router>
      <Routes>
        <Route path="/" element={<Landingpg />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/stfdr" element={<Staff />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/location" element={<Location />} />
        <Route path="/assignments" element={<Assignments />} />
      </Routes>
    </Router>
  </>
  )
}

export default App;
