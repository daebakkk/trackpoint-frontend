import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react';
import Dashboard from './pages/Dashboard'
import Landingpg from './pages/Landingpg';
import Signup from './pages/Signup';
import Assets from './pages/Assets';
import Staff from './pages/Staff';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Location from './pages/Location';
import Assignments from './pages/Assignments';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/?login=1" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const themeValue = storedTheme || 'dark';
    document.documentElement.dataset.theme = themeValue;
    if (!storedTheme) {
      localStorage.setItem('theme', themeValue);
    }
  }, []);
  return (
  <>
    <Router>
      <Routes>
        <Route path="/" element={<Landingpg />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/assets" element={<RequireAuth><Assets /></RequireAuth>} />
        <Route path="/stfdr" element={<RequireAuth><Staff /></RequireAuth>} />
        <Route path="/maintenance" element={<RequireAuth><Maintenance /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
        <Route path="/location" element={<RequireAuth><Location /></RequireAuth>} />
        <Route path="/assignments" element={<RequireAuth><Assignments /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </Router>
  </>
  )
}

export default App;
