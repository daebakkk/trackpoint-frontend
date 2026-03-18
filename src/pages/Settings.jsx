import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Settings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    username: '',
    maintenanceAlerts: true,
    assignmentUpdates: true,
    weeklySummary: false,
    darkMode: false,
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      setSaveError('');
      try {
        const token = localStorage.getItem('access_token');
        const [settingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/settings/me/`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
        ]);
        if (!settingsResponse.ok) {
          throw new Error('Failed to load settings.');
        }
        const data = await settingsResponse.json();
        setForm((prev) => ({
          ...prev,
          displayName: data.display_name || '',
          email: data.email || '',
          username: data.username || '',
          maintenanceAlerts: data.maintenance_alerts ?? true,
          assignmentUpdates: data.assignment_updates ?? true,
          weeklySummary: data.weekly_summary ?? false,
          darkMode: data.dark_mode ?? false,
        }));
      } catch (error) {
        setSaveError(error.message || 'Unable to load settings.');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }


  async function handleSave(payload, successMessage) {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/settings/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const firstFieldError = Object.values(data || {}).find((value) => Array.isArray(value) && value.length);
        const errorMessage = firstFieldError ? firstFieldError[0] : data.detail || 'Failed to save settings.';
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setForm((prev) => ({
        ...prev,
        displayName: data.display_name || prev.displayName,
        email: data.email || prev.email,
        username: data.username || prev.username,
        maintenanceAlerts: data.maintenance_alerts ?? prev.maintenanceAlerts,
        assignmentUpdates: data.assignment_updates ?? prev.assignmentUpdates,
        weeklySummary: data.weekly_summary ?? prev.weeklySummary,
        darkMode: data.dark_mode ?? prev.darkMode,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
      if (typeof data.dark_mode === 'boolean') {
        const themeValue = data.dark_mode ? 'dark' : 'light';
        document.documentElement.dataset.theme = themeValue;
        localStorage.setItem('theme', themeValue);
      }
      setSaveSuccess(successMessage);
    } catch (error) {
      setSaveError(error.message || 'Unable to save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleProfileSave() {
    handleSave(
      { display_name: form.displayName, email: form.email, username: form.username },
      'Profile updated.',
    );
  }

  function handleNotificationsSave() {
    handleSave(
      {
        maintenance_alerts: form.maintenanceAlerts,
        assignment_updates: form.assignmentUpdates,
        weekly_summary: form.weeklySummary,
        dark_mode: form.darkMode,
      },
      'Preferences updated.',
    );
  }

  function handlePasswordSave() {
    if (!form.currentPassword) {
      setSaveError('Enter your current password.');
      return;
    }
    if (!form.password || form.password !== form.confirmPassword) {
      setSaveError('Passwords do not match.');
      return;
    }
    handleSave({ current_password: form.currentPassword, password: form.password }, 'Password updated.');
  }

  return (
    <div>
      <header>
        <Navbar />
      </header>
      <main className="setPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Settings</h1>
              <p>Manage account details, preferences, and security.</p>
            </section>
            <PageSidebar context="Settings" />
          </div>
          <div className="appPageMain">
            <section className="setSection">
              <div className="setSectionHead">
                <div>
                  <h2>Account Details</h2>
                  <p>Update your name, email, and password.</p>
                </div>
                <button type="button" className="pageActionBtn" onClick={() => navigate('/profile')}>
                  View Profile
                </button>
              </div>
              <div className="setGrid">
                <article className="setCard">
                  <h3>Profile</h3>
                  <div className="setField">
                    <label>Display name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="setField">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  </div>
                  <div className="setField">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <button type="button" className="pageActionBtn" onClick={handleProfileSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Update Profile'}
                  </button>
                </article>

                <article className="setCard">
                  <h3>Security</h3>
                  <div className="setField">
                    <label>Current password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Current password"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="setField">
                    <label>Change password</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="New password"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="setField">
                    <label>Confirm password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                  </div>
                  <button type="button" className="pageActionBtn" onClick={handlePasswordSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Update Password'}
                  </button>
                </article>
              </div>
            </section>

            <section className="setSection">
              <div className="setSectionHead">
                <div>
                  <h2>Preferences</h2>
                  <p>Notification preferences and default views.</p>
                </div>
              </div>
              <div className="setGrid">
                <article className="setCard">
                  <h3>Preferences</h3>
                  <div className="setToggle">
                    <div>
                      <p>Maintenance alerts</p>
                      <span>Critical and high priority tickets</span>
                    </div>
                  <input
                    type="checkbox"
                    name="maintenanceAlerts"
                    checked={form.maintenanceAlerts}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="setToggle">
                  <div>
                    <p>Assignment updates</p>
                    <span>New and returned assignments</span>
                  </div>
                  <input
                    type="checkbox"
                    name="assignmentUpdates"
                    checked={form.assignmentUpdates}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                  <div className="setToggle">
                    <div>
                      <p>Weekly summary</p>
                      <span>Performance snapshot every Monday</span>
                    </div>
                  <input
                    type="checkbox"
                    name="weeklySummary"
                    checked={form.weeklySummary}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                  <div className="setToggle">
                    <div>
                      <p>Dark mode</p>
                      <span>Toggle the application theme</span>
                    </div>
                    <input
                      type="checkbox"
                      name="darkMode"
                      checked={form.darkMode}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <button type="button" className="pageActionBtn" onClick={handleNotificationsSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </article>
              </div>
            </section>
            {saveError && <p className="setMessage setMessageError">{saveError}</p>}
            {saveSuccess && <p className="setMessage setMessageSuccess">{saveSuccess}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
