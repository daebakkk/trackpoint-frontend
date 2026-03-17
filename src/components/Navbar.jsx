import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Assets', to: '/assets' },
    { label: 'Staff', to: '/stfdr' },
    { label: 'Maintenance', to: '/maintenance' },
    { label: 'Location', to: '/location' },
    { label: 'Reports', to: '/reports' },
    { label: 'Assignments', to: '/assignments' },
];

export default function Navbar() {
    const navigate = useNavigate();
    return (
        <header className="navWrap">
            <nav className="navbar">
                <div className="navTop">
                    <div className="navBrand">TrackPoint</div>
                    <button
                        type="button"
                        className="navIconBtn"
                        aria-label="Settings"
                        title="Settings"
                        onClick={() => navigate('/settings')}
                    >
                        <svg className="navIcon" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M19.14,12.94a7.43,7.43,0,0,0,.05-.94,7.43,7.43,0,0,0-.05-.94l2.11-1.65a.48.48,0,0,0,.12-.61l-2-3.46a.49.49,0,0,0-.59-.22l-2.49,1a7.28,7.28,0,0,0-1.63-.94l-.38-2.65A.48.48,0,0,0,13.81,2H10.19a.48.48,0,0,0-.47.4L9.34,5.05a7.28,7.28,0,0,0-1.63.94l-2.49-1a.49.49,0,0,0-.59.22l-2,3.46a.48.48,0,0,0,.12.61l2.11,1.65a7.43,7.43,0,0,0-.05.94,7.43,7.43,0,0,0,.05.94L2.75,14.59a.48.48,0,0,0-.12.61l2,3.46a.49.49,0,0,0,.59.22l2.49-1a7.28,7.28,0,0,0,1.63.94l.38,2.65a.48.48,0,0,0,.47.4h3.62a.48.48,0,0,0,.47-.4l.38-2.65a7.28,7.28,0,0,0,1.63-.94l2.49,1a.49.49,0,0,0,.59-.22l2-3.46a.48.48,0,0,0-.12-.61ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
                        </svg>
                    </button>
                </div>
                <ul className="navLinks">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) => `navLink ${isActive ? 'navLinkActive' : ''}`}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}
