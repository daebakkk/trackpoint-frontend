import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const trustTags = ['IT Operations', 'Support Teams', 'Facilities', 'Security Ops', 'Procurement', 'Leadership'];

const workflowSteps = [
    {
        title: 'Capture Asset Events',
        text: 'Register purchases, repairs, retirements, and assignment changes the moment they happen.'
    },
    {
        title: 'Route Work Intelligently',
        text: 'Push issues to the right queue with clear ownership, status, and return timelines.'
    },
    {
        title: 'Report With Confidence',
        text: 'Use reliable metrics for uptime, risk, and maintenance health across all offices.'
    }
];

const highlightBlocks = [
    { title: 'Ops Visibility', value: '24/7', detail: 'Continuous tracking across assets and assignment activity.' },
    { title: 'Issue Throughput', value: '3.1x', detail: 'Faster handling when maintenance and assignment data stay synced.' },
    { title: 'Audit Readiness', value: '98%', detail: 'Traceable records for ownership, status, and lifecycle history.' },
];

const faqRows = [
    {
        q: 'Can TrackPoint support multiple offices?',
        a: 'Yes. You can segment assets by location while still monitoring everything from one dashboard.'
    },
    {
        q: 'Do we need a dedicated IT analyst to use it?',
        a: 'No. The workflows are built for support teams, admins, and operations leads without heavy training.'
    },
    {
        q: 'Can we export records for reviews and audits?',
        a: 'Yes. Reports are structured so compliance and management reviews are straightforward.'
    }
];

export default function Landingpg() {
    const [showLogin, setShowLogin] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('login') === '1') {
            setShowLogin(true);
        }
    }, [location.search]);

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

                <section className="landingTrustRow">
                    {trustTags.map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </section>

                <section className="landingWorkflow">
                    <div className="landingSectionHead">
                        <p>Workflow</p>
                        <h2>Built for teams that need order, speed, and accountability.</h2>
                    </div>
                    <div className="landingWorkflowGrid">
                        {workflowSteps.map((step, index) => (
                            <article key={step.title} className="landingWorkflowCard">
                                <strong>{String(index + 1).padStart(2, '0')}</strong>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="landingOpsSplit">
                    <article className="landingOpsPanel">
                        <p className="landingOpsEyebrow">Operations Pulse</p>
                        <h2>One control plane for assets, incidents, and assignment movement.</h2>
                        <p>
                            TrackPoint reduces blind spots by combining staff records, asset status,
                            and assignment history in one operating surface.
                        </p>
                    </article>
                    <article className="landingOpsStats">
                        {highlightBlocks.map((item) => (
                            <div key={item.title}>
                                <h3>{item.value}</h3>
                                <p>{item.title}</p>
                                <span>{item.detail}</span>
                            </div>
                        ))}
                    </article>
                </section>

                <section className="landingFaq">
                    <div className="landingSectionHead">
                        <p>FAQ</p>
                        <h2>Common questions before rollout.</h2>
                    </div>
                    <div className="landingFaqGrid">
                        {faqRows.map((row) => (
                            <article key={row.q} className="landingFaqCard">
                                <h3>{row.q}</h3>
                                <p>{row.a}</p>
                            </article>
                        ))}
                    </div>
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
