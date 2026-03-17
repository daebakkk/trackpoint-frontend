import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Settings() {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    maintenanceAlerts: true,
    assignmentUpdates: true,
    weeklySummary: false,
    defaultOffice: '',
    reportRange: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [officeOptions, setOfficeOptions] = useState([]);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      setSaveError('');
      try {
        const token = localStorage.getItem('access_token');
        const [settingsResponse, staffResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/settings/me/`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
          fetch(`${API_BASE_URL}/api/staff/`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
        ]);
        if (!settingsResponse.ok) {
          throw new Error('Failed to load settings.');
        }
        const data = await settingsResponse.json();
        const staffData = staffResponse.ok ? await staffResponse.json() : [];
        const uniqueOffices = Array.from(new Set(staffData.map((person) => person.office).filter(Boolean)));
        setOfficeOptions(uniqueOffices);
        setForm((prev) => ({
          ...prev,
          displayName: data.display_name || '',
          email: data.email || '',
          maintenanceAlerts: data.maintenance_alerts ?? true,
          assignmentUpdates: data.assignment_updates ?? true,
          weeklySummary: data.weekly_summary ?? false,
          defaultOffice: data.default_office || (uniqueOffices[0] || ''),
          reportRange: data.report_range || '',
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
        throw new Error(data.detail || 'Failed to save settings.');
      }
      const data = await response.json();
      setForm((prev) => ({
        ...prev,
        displayName: data.display_name || prev.displayName,
        email: data.email || prev.email,
        maintenanceAlerts: data.maintenance_alerts ?? prev.maintenanceAlerts,
        assignmentUpdates: data.assignment_updates ?? prev.assignmentUpdates,
        weeklySummary: data.weekly_summary ?? prev.weeklySummary,
        defaultOffice: data.default_office || prev.defaultOffice,
        reportRange: data.report_range || prev.reportRange,
        password: '',
        confirmPassword: '',
      }));
      setSaveSuccess(successMessage);
    } catch (error) {
      setSaveError(error.message || 'Unable to save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleProfileSave() {
    handleSave(
      { display_name: form.displayName, email: form.email },
      'Profile updated.',
    );
  }

  function handleNotificationsSave() {
    handleSave(
      {
        maintenance_alerts: form.maintenanceAlerts,
        assignment_updates: form.assignmentUpdates,
        weekly_summary: form.weeklySummary,
      },
      'Notifications updated.',
    );
  }

  function handleDefaultsSave() {
    handleSave(
      {
        default_office: form.defaultOffice,
        report_range: form.reportRange,
      },
      'Defaults saved.',
    );
  }

  function handlePasswordSave() {
    if (!form.password || form.password !== form.confirmPassword) {
      setSaveError('Passwords do not match.');
      return;
    }
    handleSave({ password: form.password }, 'Password updated.');
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
              <p>Manage your workspace preferences and defaults.</p>
            </section>
            <PageSidebar context="Settings" />
          </div>
          <div className="appPageMain">
            <section className="setGrid">
              <article className="setCard">
                <h2>Profile</h2>
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
                <button type="button" className="pageActionBtn" onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Update Profile'}
                </button>
              </article>

              <article className="setCard">
                <h2>Notifications</h2>
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
                <button type="button" className="pageActionBtn" onClick={handleNotificationsSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Notifications'}
                </button>
              </article>

              <article className="setCard">
                <h2>Defaults</h2>
                <div className="setField">
                  <label>Default office</label>
                  <select
                    name="defaultOffice"
                    value={form.defaultOffice}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    {officeOptions.length === 0 && <option>HQ</option>}
                    {officeOptions.map((office) => (
                      <option key={office}>{office}</option>
                    ))}
                  </select>
                </div>
                <div className="setField">
                  <label>Report range</label>
                  <select
                    name="reportRange"
                    value={form.reportRange}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                  </select>
                </div>
                <button type="button" className="pageActionBtn" onClick={handleDefaultsSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Defaults'}
                </button>
              </article>

              <article className="setCard">
                <h2>Security</h2>
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
            </section>
            {saveError && <p className="setMessage setMessageError">{saveError}</p>}
            {saveSuccess && <p className="setMessage setMessageSuccess">{saveSuccess}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
