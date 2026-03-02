import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Landingpg from './pages/Landingpg';
import Signup from './pages/Signup';
import Assets from './pages/Assets';
import Staff from './pages/Staff';
import Repairs from './pages/Repairs';

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
        <Route path="/staff" element={<Staff />} />
        <Route path="/repairs" element={<Repairs />} />
      </Routes>
    </Router>
  </>
  )
}

export default App;
