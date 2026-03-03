import Navbar from '../components/Navbar';
import PageSidebar from '../components/PageSidebar';

const kpis = [
  { label: 'Asset Uptime', value: '99.4%', trend: '+1.2% vs last week' },
  { label: 'Open Tickets', value: '18', trend: '-6 resolved today' },
  { label: 'Avg Resolution', value: '2h 14m', trend: '-18m improvement' },
  { label: 'Compliance Score', value: '96/100', trend: '+4 this month' },
];

const utilization = [
  { team: 'IT Support', value: 84 },
  { team: 'Network Ops', value: 71 },
  { team: 'Security', value: 92 },
  { team: 'Field Staff', value: 63 },
];

const recentActivity = [
  { item: 'Laptop #TP-145 patched and verified', time: '8m ago' },
  { item: 'VPN outage ticket escalated to Network Ops', time: '22m ago' },
  { item: 'New hire onboarding bundle approved', time: '1h ago' },
  { item: 'Quarterly hardware audit completed', time: '2h ago' },
];

const alerts = [
  { level: 'High', item: 'Server Rack 3 temperature spike detected' },
  { level: 'Medium', item: '12 devices pending endpoint update' },
  { level: 'Low', item: '2 licenses expiring within 14 days' },
];

export default function Dashboard() {
  return (
    <div className="dashShell">
      <header>
        <Navbar />
      </header>

      <main className="dashPageModern">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Dashboard</h1>
              <p>Real-time visibility across assets, incidents, and team performance.</p>
            </section>
            <PageSidebar context="Dashboard" />
          </div>
          <div className="appPageMain">
            <section className="dashKpiGrid">
              {kpis.map((card) => (
                <article key={card.label} className="dashKpiCard">
                  <p className="dashKpiLabel">{card.label}</p>
                  <p className="dashKpiValue">{card.value}</p>
                  <p className="dashKpiTrend">{card.trend}</p>
                </article>
              ))}
            </section>

            <section className="dashMainGrid">
              <article className="dashPanel dashPanelWide">
                <div className="dashPanelHeader">
                  <h2>Incident Trend (7 Days)</h2>
                  <span>Live</span>
                </div>
                <svg viewBox="0 0 600 220" className="dashLineChart" role="img" aria-label="Incident trend line chart">
                  <defs>
                    <linearGradient id="lineGlow" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.36" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="600" height="220" fill="transparent" />
                  <g className="dashGridLines">
                    <line x1="40" y1="30" x2="580" y2="30" />
                    <line x1="40" y1="80" x2="580" y2="80" />
                    <line x1="40" y1="130" x2="580" y2="130" />
                    <line x1="40" y1="180" x2="580" y2="180" />
                  </g>
                  <path d="M40 180 L120 160 L200 120 L280 132 L360 92 L440 104 L520 70" className="dashLineArea" />
                  <polyline points="40,180 120,160 200,120 280,132 360,92 440,104 520,70" className="dashLinePath" />
                </svg>
              </article>

              <article className="dashPanel">
                <div className="dashPanelHeader">
                  <h2>Team Utilization</h2>
                </div>
                <div className="dashBars">
                  {utilization.map((bar) => (
                    <div key={bar.team} className="dashBarRow">
                      <div className="dashBarMeta">
                        <span>{bar.team}</span>
                        <span>{bar.value}%</span>
                      </div>
                      <div className="dashBarTrack">
                        <div className="dashBarFill" style={{ width: `${bar.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="dashPanel">
                <div className="dashPanelHeader">
                  <h2>Recent Activity</h2>
                </div>
                <ul className="dashList">
                  {recentActivity.map((activity) => (
                    <li key={activity.item}>
                      <p>{activity.item}</p>
                      <span>{activity.time}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="dashPanel">
                <div className="dashPanelHeader">
                  <h2>Priority Alerts</h2>
                </div>
                <ul className="dashAlertList">
                  {alerts.map((alert) => (
                    <li key={alert.item}>
                      <span className={`dashBadge dashBadge${alert.level}`}>{alert.level}</span>
                      <p>{alert.item}</p>
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
