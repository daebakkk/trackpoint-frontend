import Navbar from '../components/Navbar';
import { useEffect, useMemo, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const ranges = ['This Week', 'Last Week', 'This Month', 'Last 3 Months', 'Last 6 Months', 'Last Year'];
const departmentLabel = 'Operations + Asset Management';
const ownerLabel = 'TrackPoint Systems';

function getErrorMessage(response, fallback) {
  return response.json()
    .then((data) => {
      if (typeof data === 'string') return data;
      if (data.detail) return `${fallback} (${response.status}): ${data.detail}`;
      return `${fallback} (${response.status}): ${JSON.stringify(data)}`;
    })
    .catch(() => response.text().then((text) => `${fallback} (${response.status}): ${text || response.statusText}`));
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfWeek(date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function getRangeWindow(rangeLabel) {
  const now = new Date();
  if (rangeLabel === 'This Week') {
    return { start: startOfWeek(now), end: now };
  }
  if (rangeLabel === 'Last Week') {
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    return { start: startOfDay(lastWeekStart), end: endOfDay(lastWeekEnd) };
  }
  if (rangeLabel === 'This Month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: startOfDay(start), end: now };
  }
  if (rangeLabel === 'Last 3 Months') {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 3);
    return { start: startOfDay(start), end: now };
  }
  if (rangeLabel === 'Last 6 Months') {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 6);
    return { start: startOfDay(start), end: now };
  }
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 1);
  return { start: startOfDay(start), end: now };
}

function getPreviousWindow(currentStart, currentEnd) {
  const duration = currentEnd.getTime() - currentStart.getTime();
  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  return { start: previousStart, end: previousEnd };
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDelta(current, previous) {
  const delta = current - previous;
  if (delta === 0) return 'No change vs prior period';
  return `${delta > 0 ? '+' : ''}${delta} vs prior period`;
}

export default function Reports() {
  const [range, setRange] = useState('This Month');
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    async function loadReportData() {
      setIsLoading(true);
      setFetchError('');
      try {
        const [assetsResponse, ticketsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/assets/`),
          fetch(`${API_BASE_URL}/api/maintenance-tickets/`),
        ]);
        if (!assetsResponse.ok) {
          throw new Error(await getErrorMessage(assetsResponse, 'Failed to load assets'));
        }
        if (!ticketsResponse.ok) {
          throw new Error(await getErrorMessage(ticketsResponse, 'Failed to load maintenance tickets'));
        }
        const assetsData = await assetsResponse.json();
        const ticketsData = await ticketsResponse.json();
        setAssets(assetsData);
        setTickets(ticketsData);
      } catch (error) {
        setFetchError(error.message || 'Unable to load report data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadReportData();
  }, []);

  const reportRows = useMemo(() => {
    const { start, end } = getRangeWindow(range);
    const previousWindow = getPreviousWindow(start, end);

    const workingAssets = assets.filter((asset) => {
      const status = (asset.status || '').toLowerCase();
      return status.includes('good') || status.includes('working');
    }).length;
    const inRepairAssets = assets.filter((asset) => {
      const status = (asset.status || '').toLowerCase();
      return status.includes('repair') || status.includes('critical');
    }).length;
    const lostAssets = assets.filter((asset) => (asset.status || '').toLowerCase().includes('lost')).length;
    const retiredAssets = assets.filter((asset) => {
      const status = (asset.status || '').toLowerCase();
      return status.includes('retired') || status.includes('decommission');
    }).length;
    const unassignedAssets = assets.filter((asset) => !asset.assigned_to).length;

    const ticketsInRange = tickets.filter((ticket) => {
      const createdAt = parseDate(ticket.created_at);
      return createdAt && createdAt >= start && createdAt <= end;
    }).length;
    const ticketsPrevious = tickets.filter((ticket) => {
      const createdAt = parseDate(ticket.created_at);
      return createdAt && createdAt >= previousWindow.start && createdAt <= previousWindow.end;
    }).length;

    const preventiveOverdue = tickets.filter((ticket) => {
      if (ticket.lane !== 'Preventive') return false;
      const etaDate = parseDate(ticket.eta);
      if (!etaDate) return false;
      const createdAt = parseDate(ticket.created_at);
      return etaDate <= end && (!createdAt || createdAt <= end);
    }).length;
    const preventiveOverduePrevious = tickets.filter((ticket) => {
      if (ticket.lane !== 'Preventive') return false;
      const etaDate = parseDate(ticket.eta);
      if (!etaDate) return false;
      const createdAt = parseDate(ticket.created_at);
      return etaDate <= previousWindow.end && (!createdAt || createdAt <= previousWindow.end);
    }).length;

    return [
      {
        metric: 'Good / Working Assets',
        count: workingAssets,
        note: 'Assets currently available and functioning',
        trend: 'Live snapshot',
      },
      {
        metric: 'Assets In Repair',
        count: inRepairAssets,
        note: 'Assets flagged for repair or critical status',
        trend: 'Live snapshot',
      },
      {
        metric: 'Maintenance Tickets Opened',
        count: ticketsInRange,
        note: `Tickets created between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`,
        trend: formatDelta(ticketsInRange, ticketsPrevious),
      },
      {
        metric: 'Lost Assets',
        count: lostAssets,
        note: 'Assets marked lost in the registry',
        trend: 'Live snapshot',
      },
      {
        metric: 'Retired Assets',
        count: retiredAssets,
        note: 'Assets marked retired or decommissioned',
        trend: 'Live snapshot',
      },
      {
        metric: 'Unassigned Assets',
        count: unassignedAssets,
        note: 'Assets without an active assignee',
        trend: 'Live snapshot',
      },
      {
        metric: 'Preventive Tickets Overdue',
        count: preventiveOverdue,
        note: `Preventive tickets due by ${end.toLocaleDateString()}`,
        trend: formatDelta(preventiveOverdue, preventiveOverduePrevious),
      },
    ];
  }, [assets, tickets, range]);

  const summaryCards = useMemo(() => reportRows.slice(0, 4), [reportRows]);

  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="rptPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Reports</h1>
              <p>Asset health report summary for operations and maintenance.</p>
            </section>
            <PageSidebar context="Reports" />
          </div>
          <div className="appPageMain">
            <section className="rptTop">
              <div className="rptTopRow">
                <button type="button" className="pageActionBtn">Create Report</button>
              </div>
              <div className="rptRangeBar">
                <select
                  id="report-range"
                  className="assOfficeSelect rptRangeSelect"
                  value={range}
                  onChange={(event) => setRange(event.target.value)}
                >
                  {ranges.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="rptSheet">
              <div className="rptSheetHero">
                <div>
                  <p className="rptSheetEyebrow">Operational Intelligence Report</p>
                  <h2>{range} Asset Performance Review</h2>
                  <p className="rptSheetSub">
                    Consolidated health metrics, maintenance outcomes, and assignment readiness across the asset fleet.
                  </p>
                </div>
                <div className="rptMetaStack">
                  <div>
                    <span>Department</span>
                    <strong>{departmentLabel}</strong>
                  </div>
                  <div>
                    <span>Prepared By</span>
                    <strong>{ownerLabel}</strong>
                  </div>
                  <div>
                    <span>Report Window</span>
                    <strong>{range}</strong>
                  </div>
                </div>
              </div>

              <div className="rptSummaryGrid">
                {summaryCards.map((card) => (
                  <article key={card.metric} className="rptSummaryCard">
                    <p>{card.metric}</p>
                    <h3>{card.count}</h3>
                    <span>{card.note}</span>
                  </article>
                ))}
              </div>

              <div className="rptSectionHeader">
                <h3>Key Metrics</h3>
                <span>Performance Breakdown</span>
              </div>
              <div className="rptTableWrap">
                <table className="rptTable">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Count</th>
                      <th>Details</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row) => (
                      <tr key={row.metric}>
                        <td>{row.metric}</td>
                        <td>{row.count}</td>
                        <td>{row.note}</td>
                        <td>{row.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {isLoading && <p className="assHeading">Loading report data...</p>}
            {!isLoading && fetchError && <p className="assHeading">{fetchError}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
