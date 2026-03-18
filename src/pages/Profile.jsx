import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Profile() {
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
          username: meData.username || '',
          email: meData.email || settingsData.email || '',
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
              <p>Your account details and defaults.</p>
            </section>
            <PageSidebar context="Settings" />
          </div>
          <div className="appPageMain">
            <section className="setSection">
              <div className="setSectionHead">
                <div>
                  <h2>Account Overview</h2>
                  <p>Basic identity and workspace defaults.</p>
                </div>
              </div>
              <div className="setGrid">
                <article className="setCard">
                  <h3>Identity</h3>
                  <p className="setProfileLine"><strong>Display name:</strong> {profile.displayName || 'Not set'}</p>
                  <p className="setProfileLine"><strong>Username:</strong> {profile.username || 'Not set'}</p>
                  <p className="setProfileLine"><strong>Email:</strong> {profile.email || 'Not set'}</p>
                </article>
                <article className="setCard">
                  <h3>Defaults</h3>
                  <p className="setProfileLine"><strong>Default office:</strong> {profile.defaultOffice}</p>
                  <p className="setProfileLine"><strong>Report range:</strong> {profile.reportRange}</p>
                </article>
              </div>
            </section>

            {isLoading && <p className="setMessage">Loading profile...</p>}
            {!isLoading && error && <p className="setMessage setMessageError">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
