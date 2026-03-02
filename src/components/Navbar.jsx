import { NavLink } from 'react-router-dom';
import './Navbar.css';

const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Assets', to: '/assets' },
    { label: 'Staff', to: '/stfdr' },
    { label: 'Repairs', to: '/repairs' },
    { label: 'Reports', to: '/reports' },
    { label: 'Assignment History', to: '/asshis' },
];

export default function Navbar() {
    return (
        <header className="navWrap">
            <nav className="navbar">
                <div className="navTop">
                    <div className="navBrand">TrackPoint</div>
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
