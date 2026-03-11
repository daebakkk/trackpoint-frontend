import Navbar from '../components/Navbar';
import { useMemo, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const ranges = ['This Week', 'Last Week', 'This Month', 'Last 3 Months', 'Last 6 Months', 'Last Year'];
const departmentLabel = 'Operations + Asset Management';
const ownerLabel = 'TrackPoint Systems';

const reportByRange = {
  'This Week': [
    { metric: 'Good / Working Assets', count: 148, note: 'Assets currently available and functioning', trend: '+2 this week' },
    { metric: 'Assets Repaired', count: 9, note: 'Repairs completed in the current week', trend: '+3 vs last week' },
    { metric: 'Assets In Repair', count: 11, note: 'Currently in maintenance queue', trend: '-2 this week' },
    { metric: 'Lost Assets', count: 1, note: 'Reported lost this week', trend: '+1 this week' },
    { metric: 'Retired Assets', count: 2, note: 'Devices retired this week', trend: '+1 this week' },
    { metric: 'Unassigned Assets', count: 14, note: 'Available assets not assigned to staff', trend: '-2 this week' },
    { metric: 'Overdue Maintenance', count: 8, note: 'Assets past preventive maintenance date', trend: '-1 this week' },
  ],
  'Last Week': [
    { metric: 'Good / Working Assets', count: 146, note: 'Assets currently available and functioning', trend: '+1 last week' },
    { metric: 'Assets Repaired', count: 6, note: 'Repairs completed in last week', trend: '-1 vs previous week' },
    { metric: 'Assets In Repair', count: 13, note: 'Maintenance queue at week close', trend: '+1 last week' },
    { metric: 'Lost Assets', count: 0, note: 'No loss reported in that week', trend: 'No change' },
    { metric: 'Retired Assets', count: 1, note: 'Devices retired in last week', trend: 'No change' },
    { metric: 'Unassigned Assets', count: 16, note: 'Assets awaiting assignment', trend: '+1 last week' },
    { metric: 'Overdue Maintenance', count: 9, note: 'Assets past preventive maintenance date', trend: '+1 last week' },
  ],
  'This Month': [
    { metric: 'Good / Working Assets', count: 148, note: 'Assets currently available and functioning', trend: '+6 this month' },
    { metric: 'Assets Repaired', count: 27, note: 'Completed repairs in the current month', trend: '+4 vs last month' },
    { metric: 'Assets In Repair', count: 11, note: 'Currently in maintenance queue', trend: '-3 this month' },
    { metric: 'Lost Assets', count: 2, note: 'Marked as lost this month', trend: '+1 this month' },
    { metric: 'Retired Assets', count: 5, note: 'Devices decommissioned from active use', trend: '+2 this month' },
    { metric: 'Unassigned Assets', count: 14, note: 'Available assets not assigned to staff', trend: '-5 this month' },
    { metric: 'Overdue Maintenance', count: 8, note: 'Assets due for preventive maintenance', trend: '-2 this month' },
  ],
  'Last 3 Months': [
    { metric: 'Good / Working Assets', count: 436, note: 'Average working pool across the quarter', trend: '+18 vs prior quarter' },
    { metric: 'Assets Repaired', count: 74, note: 'Repairs completed in last 3 months', trend: '+11 vs prior quarter' },
    { metric: 'Assets In Repair', count: 31, note: 'Active maintenance backlog', trend: '-4 vs prior quarter' },
    { metric: 'Lost Assets', count: 5, note: 'Losses reported in last 3 months', trend: '+1 vs prior quarter' },
    { metric: 'Retired Assets', count: 19, note: 'Decommissioned devices in last 3 months', trend: '+3 vs prior quarter' },
    { metric: 'Unassigned Assets', count: 42, note: 'Assets awaiting assignment over period', trend: '-9 vs prior quarter' },
    { metric: 'Overdue Maintenance', count: 24, note: 'Overdue preventive tasks over period', trend: '-5 vs prior quarter' },
  ],
  'Last 6 Months': [
    { metric: 'Good / Working Assets', count: 874, note: 'Average working pool across half-year', trend: '+31 vs prior period' },
    { metric: 'Assets Repaired', count: 146, note: 'Repairs completed in last 6 months', trend: '+22 vs prior period' },
    { metric: 'Assets In Repair', count: 54, note: 'Active maintenance backlog', trend: '-6 vs prior period' },
    { metric: 'Lost Assets', count: 9, note: 'Losses reported in last 6 months', trend: '+2 vs prior period' },
    { metric: 'Retired Assets', count: 31, note: 'Decommissioned devices in last 6 months', trend: '+6 vs prior period' },
    { metric: 'Unassigned Assets', count: 83, note: 'Assets awaiting assignment over period', trend: '-12 vs prior period' },
    { metric: 'Overdue Maintenance', count: 41, note: 'Overdue preventive tasks over period', trend: '-8 vs prior period' },
  ],
  'Last Year': [
    { metric: 'Good / Working Assets', count: 1732, note: 'Average working pool across the year', trend: '+48 vs prior year' },
    { metric: 'Assets Repaired', count: 301, note: 'Repairs completed in last year', trend: '+44 vs prior year' },
    { metric: 'Assets In Repair', count: 92, note: 'Active maintenance backlog', trend: '-10 vs prior year' },
    { metric: 'Lost Assets', count: 15, note: 'Losses reported in last year', trend: '+3 vs prior year' },
    { metric: 'Retired Assets', count: 64, note: 'Decommissioned devices in last year', trend: '+12 vs prior year' },
    { metric: 'Unassigned Assets', count: 148, note: 'Assets awaiting assignment over period', trend: '-21 vs prior year' },
    { metric: 'Overdue Maintenance', count: 77, note: 'Overdue preventive tasks over period', trend: '-14 vs prior year' },
  ],
};

export default function Reports() {
  const [range, setRange] = useState('This Month');
  const reportRows = useMemo(() => reportByRange[range], [range]);
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
                <label className="rptRangeLabel" htmlFor="report-range">Time Range</label>
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
          </div>
        </div>
      </main>
    </div>
  );
}
