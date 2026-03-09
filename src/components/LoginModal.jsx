import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function LoginModal({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Invalid login credentials.');
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      onClose();
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="loginModalBackdrop" onClick={onClose}>
      <div className="loginModalCard" role="dialog" aria-modal="true" aria-label="Log in" onClick={(e) => e.stopPropagation()}>
        <div className="loginModalHead">
          <h2>Log In</h2>
          <button type="button" className="loginCloseBtn" onClick={onClose} aria-label="Close login modal">x</button>
        </div>
        <p className="loginModalSub">Sign in to access your TrackPoint workspace.</p>

        <form className="loginForm" onSubmit={handleSubmit}>
          <label>
            Username / Employee ID
            <input name="username" type="text" placeholder="e.g. 0312" value={form.username} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="Enter password" value={form.password} onChange={handleChange} required />
          </label>
          {error && <p className="formError">{error}</p>}
          <button type="submit" className="loginSubmitBtn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
