import Navbar from '../components/Navbar';
import { useMemo, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const ranges = ['This Week', 'Last Week', 'This Month', 'Last 3 Months'];

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
};

export default function Reports() {
  const [range, setRange] = useState('This Month');
  const reportRows = useMemo(() => reportByRange[range], [range]);

  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="rptPage">
        <div className="appPageLayout">
          <PageSidebar context="Reports" />
          <div className="appPageMain">
            <section className="rptTop">
              <div className="rptTopRow">
                <h1 className="rptTitle">Reports</h1>
                <button type="button" className="pageActionBtn">Create Report</button>
              </div>
              <p className="rptHeading">Asset health report summary for operations and maintenance.</p>
              <div className="rptRangeBar">
                {ranges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rptRangeBtn ${range === item ? 'rptRangeBtnActive' : ''}`}
                    onClick={() => setRange(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="rptCard">
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
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
