import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    displayName: '',
    defaultOffice: '',
    reportRange: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        const [meResponse, settingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me/`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' },
          }),
          fetch(`${API_BASE_URL}/api/settings/me/`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' },
          }),
        ]);
        if (!meResponse.ok) {
          throw new Error('Failed to load profile.');
        }
        const meData = await meResponse.json();
        const settingsData = settingsResponse.ok ? await settingsResponse.json() : {};
        setProfile({
          username: settingsData.username || meData.username || '',
          email: settingsData.email || meData.email || '',
          firstName: meData.first_name || '',
          lastName: meData.last_name || '',
          displayName: settingsData.display_name || `${meData.first_name || ''} ${meData.last_name || ''}`.trim() || meData.username || meData.email || '',
          defaultOffice: 'Not set',
          reportRange: settingsData.report_range || 'Not set',
        });
      } catch (err) {
        setError(err.message || 'Unable to load profile.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <div>
      <header>
        <Navbar />
      </header>
      <main className="setPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Profile</h1>
              <p>Your account details and workspace identity.</p>
            </section>
            <PageSidebar context="Settings" />
          </div>
          <div className="appPageMain">
            <section className="profileHero">
              <div className="profileAvatar">
                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2>{profile.displayName || 'Your Profile'}</h2>
                <p>Account identity, access defaults, and preferences.</p>
                <div className="profileBadges">
                  <span>{profile.username || 'Username pending'}</span>
                  <span>{profile.email || 'Email pending'}</span>
                </div>
              </div>
              <div className="profileHeroActions">
                <button
                  type="button"
                  className="pageActionBtn"
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/?login=1');
                  }}
                >
                  Log Out
                </button>
              </div>
            </section>

            <section className="profileGrid">
              <article className="profileCard">
                <h3>Identity</h3>
                <div className="profileRow">
                  <span>Display name</span>
                  <strong>{profile.displayName || 'Not set'}</strong>
                </div>
                <div className="profileRow">
                  <span>Username</span>
                  <strong>{profile.username || 'Not set'}</strong>
                </div>
                <div className="profileRow">
                  <span>Email</span>
                  <strong>{profile.email || 'Not set'}</strong>
                </div>
              </article>
            </section>

            {isLoading && <p className="setMessage">Loading profile...</p>}
            {!isLoading && error && <p className="setMessage setMessageError">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
