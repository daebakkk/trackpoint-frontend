import { useState } from 'react';

export default function LoginModal({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
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
            Work email
            <input type="email" placeholder="name@company.com" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter password" required />
          </label>
          <button type="submit" className="loginSubmitBtn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
