import Navbar from '../components/Navbar';
import { useEffect, useMemo, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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

function buildIncidentSeries(tickets) {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({ key, count: 0 });
  }

  tickets.forEach((ticket) => {
    const createdAt = ticket.created_at ? ticket.created_at.slice(0, 10) : null;
    const day = days.find((d) => d.key === createdAt);
    if (day) day.count += 1;
  });

  return days;
}

function buildLinePoints(series) {
  const chartLeft = 40;
  const chartRight = 580;
  const chartTop = 30;
  const chartBottom = 180;
  const width = chartRight - chartLeft;
  const height = chartBottom - chartTop;
  const maxCount = Math.max(1, ...series.map((point) => point.count));

  return series.map((point, index) => {
    const x = chartLeft + (width * index) / (series.length - 1 || 1);
    const y = chartBottom - (point.count / maxCount) * height;
    return `${Math.round(x)},${Math.round(y)}`;
  });
}

export default function Dashboard() {
  const [firstName, setFirstName] = useState('');
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setFetchError('');
      try {
        const [assetsResponse, ticketsResponse, assignmentsResponse, staffResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/assets/`),
          fetch(`${API_BASE_URL}/api/maintenance-tickets/`),
          fetch(`${API_BASE_URL}/api/assignments/`),
          fetch(`${API_BASE_URL}/api/staff/`),
        ]);
        if (!assetsResponse.ok) {
          const text = await assetsResponse.text();
          throw new Error(text || assetsResponse.statusText);
        }
        if (!ticketsResponse.ok) {
          const text = await ticketsResponse.text();
          throw new Error(text || ticketsResponse.statusText);
        }
        if (!assignmentsResponse.ok) {
          const text = await assignmentsResponse.text();
          throw new Error(text || assignmentsResponse.statusText);
        }
        if (!staffResponse.ok) {
          const text = await staffResponse.text();
          throw new Error(text || staffResponse.statusText);
        }
        const assetsData = await assetsResponse.json();
        const ticketsData = await ticketsResponse.json();
        const assignmentsData = await assignmentsResponse.json();
        const staffData = await staffResponse.json();
        setAssets(assetsData);
        setTickets(ticketsData);
        setAssignments(assignmentsData);
        setStaff(staffData);
      } catch (error) {
        setFetchError(error.message || 'Unable to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const [meResponse, settingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/settings/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const meData = meResponse.ok ? await meResponse.json() : {};
        const settingsData = settingsResponse.ok ? await settingsResponse.json() : {};
        const displayName = (settingsData.display_name || '').trim();
        const first = (meData.first_name || '').trim();
        const fallback = (meData.username || meData.email || '').trim();
        const nameSource = displayName || first || fallback;
        const greetingName = nameSource ? nameSource.split(' ')[0] : '';
        setFirstName(greetingName);
      } catch {
        // ignore user fetch errors
      }
    }

    loadUser();
  }, []);

  const utilization = useMemo(() => {
    if (!assets.length || !staff.length) {
      return [{ team: 'No data yet', value: 0 }];
    }
    const staffOfficeMap = staff.reduce((acc, person) => {
      acc[String(person.staff_id).trim().toLowerCase()] = person.office || 'Unassigned';
      return acc;
    }, {});
    const officeCounts = assets.reduce((acc, asset) => {
      const staffId = (asset.assigned_to_staff_id || '').toString().trim().toLowerCase();
      const office = staffOfficeMap[staffId] || 'Unassigned';
      acc[office] = (acc[office] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(officeCounts);
    const maxCount = Math.max(1, ...entries.map(([, count]) => count));
    return entries
      .map(([office, count]) => ({
        team: office,
        value: Math.round((count / maxCount) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [assets, staff]);

  const recentActivity = useMemo(() => {
    const ticketActivity = tickets.map((ticket) => ({
      item: `Ticket ${ticket.ticket_id} opened for ${ticket.asset_name || ticket.asset}`,
      time: ticket.created_at,
    }));
    const assignmentActivity = assignments.map((assignment) => ({
      item: `Assignment ${assignment.assignment_id} issued to ${assignment.assignee_name || 'Unassigned'}`,
      time: assignment.date_assigned,
    }));
    return [...ticketActivity, ...assignmentActivity]
      .filter((entry) => entry.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
      .map((entry) => ({ item: entry.item, time: formatTimeAgo(entry.time) }));
  }, [tickets, assignments]);

  const alerts = useMemo(() => {
    const assetAlerts = assets
      .filter((asset) => {
        const status = (asset.status || '').toLowerCase();
        return status.includes('critical') || status.includes('lost') || status.includes('repair');
      })
      .map((asset) => {
        const status = (asset.status || '').toLowerCase();
        const level = status.includes('critical') || status.includes('lost') ? 'High' : 'Medium';
        return { level, item: `${asset.name} (${asset.asset_id}) marked ${asset.status}` };
      });
    const ticketAlerts = tickets
      .filter((ticket) => ticket.lane === 'Critical')
      .map((ticket) => ({
        level: 'High',
        item: `Critical ticket ${ticket.ticket_id} for ${ticket.asset_name || ticket.asset}`,
      }));
    const combined = [...ticketAlerts, ...assetAlerts].slice(0, 3);
    return combined.length ? combined : [{ level: 'Low', item: 'No active alerts' }];
  }, [assets, tickets]);

  const incidentSeries = useMemo(() => buildIncidentSeries(tickets), [tickets]);
  const incidentPoints = useMemo(() => buildLinePoints(incidentSeries), [incidentSeries]);
  const linePath = incidentPoints.length ? `M${incidentPoints.join(' L')}` : '';

  const kpis = useMemo(() => {
    const openTickets = tickets.filter((ticket) => ticket.status !== 'Completed');
    const inRepairTickets = tickets.filter((ticket) => {
      const status = (ticket.status || '').toLowerCase();
      return status.includes('repair') || status.includes('in progress') || status.includes('in-progress');
    });
    const totalAssets = assets.length;
    const healthyAssets = assets.filter((asset) => {
      const status = (asset.status || '').toLowerCase();
      return status.includes('good') || status.includes('working');
    }).length;
    const unassignedAssets = assets.filter((asset) => !asset.assigned_to).length;
    const uptime = totalAssets ? `${Math.round((healthyAssets / totalAssets) * 1000) / 10}%` : '0%';

    return [
      { label: 'Asset Uptime', value: uptime, trend: 'Live from asset status' },
      { label: 'Open Tickets', value: `${openTickets.length}`, trend: 'Active maintenance tickets' },
      { label: 'In Repair', value: `${inRepairTickets.length}`, trend: 'In-progress tickets' },
      { label: 'Unassigned Assets', value: `${unassignedAssets}`, trend: 'Awaiting assignment' },
    ];
  }, [assets, tickets]);

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
            <section className="dashGreeting">
              <h2>{`Hi, ${firstName || 'there'}`}</h2>
              <p>Here is your latest operational snapshot.</p>
            </section>
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
                  {linePath && (
                    <>
                      <path d={`${linePath} L580 180 L40 180 Z`} className="dashLineArea" />
                      <polyline points={incidentPoints.join(' ')} className="dashLinePath" />
                    </>
                  )}
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

            {isLoading && <p className="assHeading">Loading dashboard data...</p>}
            {!isLoading && fetchError && <p className="assHeading">{fetchError}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
