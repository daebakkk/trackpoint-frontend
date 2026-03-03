import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from '../components/LoginModal';

const featureCards = [
    {
        title: 'Live Asset Intelligence',
        text: 'Track hardware status, ownership, and service history from one operational view.'
    },
    {
        title: 'Faster Incident Response',
        text: 'Prioritize urgent tickets with clear workflow status and escalation signals.'
    },
    {
        title: 'Audit-Ready Reporting',
        text: 'Generate clean compliance snapshots for teams, devices, and policy controls.'
    }
];

export default function Landingpg() {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div className="landingShell">
            <main className="landingPage">
                <section className="landingHero">
                    <p className="landingEyebrow">Asset Operations Platform</p>
                    <h1 className="landingHeading">TrackPoint powers modern IT teams with speed and control.</h1>
                    <p className="landingSubtext">
                        A single workspace for monitoring assets, resolving incidents, and keeping operations compliant.
                    </p>
                    <div className="landingActions">
                        <Link className="lpButton lpButtonPrimary" to="/signup">Get Started</Link>
                        <button type="button" className="lpButton lpButtonGhost" onClick={() => setShowLogin(true)}>Log In</button>
                        <Link className="lpButton lpButtonGhost" to="/dashboard">View Dashboard</Link>
                    </div>
                    <div className="landingStats">
                        <div>
                            <h3>99.4%</h3>
                            <p>Asset Uptime</p>
                        </div>
                        <div>
                            <h3>2h 14m</h3>
                            <p>Avg Resolution</p>
                        </div>
                        <div>
                            <h3>96/100</h3>
                            <p>Compliance Score</p>
                        </div>
                    </div>
                </section>

                <section className="landingFeatureGrid">
                    {featureCards.map((feature) => (
                        <article key={feature.title} className="landingFeatureCard">
                            <span className="landingCardAccent" />
                            <h2>{feature.title}</h2>
                            <p>{feature.text}</p>
                        </article>
                    ))}
                </section>
                <div className="landingBottomCta">
                    <p>Built for admins, support staff, and operations leaders.</p>
                    <Link className="lpButton lpButtonPrimary" to="/signup">Create Account</Link>
                </div>

                {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            </main>
        </div>
    )
}
