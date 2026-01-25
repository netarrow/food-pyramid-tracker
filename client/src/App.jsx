import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Tracker from './pages/Tracker';
import Stats from './pages/Stats';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Routes>
          <Route path="/" element={<Tracker />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>

        <nav className="nav-bar">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">➕</span>
            <span>Tracker</span>
          </NavLink>

          <NavLink
            to="/stats"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Stats</span>
          </NavLink>
        </nav>
      </div>
    </Router>
  );
}

export default App;
