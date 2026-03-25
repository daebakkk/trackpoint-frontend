import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
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
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifError, setNotifError] = useState('');
    const notifRef = useRef(null);

    async function loadNotifications() {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        setNotifLoading(true);
        setNotifError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/notifications/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to load notifications.');
            }
            const data = await response.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            setNotifError(error.message || 'Unable to load notifications.');
        } finally {
            setNotifLoading(false);
        }
    }

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(() => {
            loadNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (!notifOpen || !notifRef.current) return;
            if (!notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [notifOpen]);


    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.is_read).length,
        [notifications],
    );

    useEffect(() => {
        if (notifOpen && unreadCount > 0) {
            markAllRead();
        }
    }, [notifOpen, unreadCount]);

    async function markNotificationRead(notificationId) {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/notifications/${notificationId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_read: true }),
            });
            setNotifications((prev) => prev.map((item) => (
                item.id === notificationId ? { ...item, is_read: true } : item
            )));
        } catch {
            // ignore
        }
    }

    async function markAllRead() {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/notifications/mark_all_read/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
        } catch {
            // ignore
        }
    }

    function formatTimeAgo(value) {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '-';
        const diffMs = Date.now() - parsed.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        const diffDay = Math.floor(diffHr / 24);
        return `${diffDay}d ago`;
    }

    return (
        <header className="navWrap">
            <nav className="navbar">
                <div className="navTop">
                    <div className="navBrand">TrackPoint</div>
                    <div className="navActions" ref={notifRef}>
                        <button
                            type="button"
                            className="navIconBtn navNotifBtn"
                            aria-label="Notifications"
                            title="Notifications"
                            onClick={() => setNotifOpen((prev) => !prev)}
                        >
                            <svg className="navIcon" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    fill="currentColor"
                                    d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z"
                                />
                            </svg>
                            {unreadCount > 0 && <span className="navNotifDot" />}
                        </button>
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
                        {notifOpen && (
                            <div className="navNotifPanel">
                                <div className="navNotifHead">
                                    <div>
                                        <h4>Notifications</h4>
                                        <p>{unreadCount} unread</p>
                                    </div>
                                    <button type="button" onClick={markAllRead} disabled={!notifications.length}>
                                        Mark all read
                                    </button>
                                </div>
                                <div className="navNotifList">
                                    {notifLoading && <p className="navNotifEmpty">Loading...</p>}
                                    {!notifLoading && notifError && <p className="navNotifEmpty">{notifError}</p>}
                                    {!notifLoading && !notifError && notifications.length === 0 && (
                                        <p className="navNotifEmpty">No notifications yet.</p>
                                    )}
                                    {notifications.map((item) => (
                                        <button
                                            type="button"
                                            key={item.id}
                                            className={`navNotifItem ${item.is_read ? '' : 'navNotifUnread'}`}
                                            onClick={() => {
                                                if (item.link) {
                                                    navigate(item.link);
                                                }
                                                markNotificationRead(item.id);
                                            }}
                                        >
                                            <div>
                                                <strong>{item.title}</strong>
                                                {item.message && <p>{item.message}</p>}
                                            </div>
                                            <span>{formatTimeAgo(item.created_at)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
