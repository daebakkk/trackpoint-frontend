import Navbar from '../components/Navbar';
import { useEffect, useMemo, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function normalizeAssignment(item) {
  const assetLabel = item.asset_name ? `${item.asset_name}${item.asset_code ? ` (${item.asset_code})` : ''}` : `Asset #${item.asset ?? '-'}`;
  const assigneeLabel = item.assignee_name || (item.assignee ? `Staff #${item.assignee}` : 'Unassigned');

  return {
    pk: item.id,
    id: item.assignment_id,
    asset: assetLabel,
    assignee: assigneeLabel,
    assignedOn: item.date_assigned,
    returnBy: item.return_date || '',
    status: item.status,
  };
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [historyRange, setHistoryRange] = useState('Last 3 Months');
  const [activeView, setActiveView] = useState('current');

  useEffect(() => {
    async function loadAssignments() {
      setIsLoading(true);
      setFetchError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/assignments/`);
        if (!response.ok) throw new Error('Failed to load assignments.');
        const data = await response.json();
        setAssignments(data.map(normalizeAssignment));
      } catch (error) {
        setFetchError(error.message || 'Unable to fetch assignments.');
      } finally {
        setIsLoading(false);
      }
    }

    loadAssignments();
  }, []);


  const assignmentStats = useMemo(() => {
    const goodCondition = assignments.filter((item) => item.status === 'Active').length;
    const needingRepair = assignments.filter((item) => item.status === 'In Review').length;
    const returned = assignments.filter((item) => item.status === 'Returned').length;
    return [
      { label: 'In Good Condition', value: String(goodCondition) },
      { label: 'Needing Repair', value: String(needingRepair) },
      { label: 'Returned', value: String(returned) },
    ];
  }, [assignments]);

  const currentAssignments = useMemo(
    () => assignments.filter((item) => item.status === 'Active' || item.status === 'In Review'),
    [assignments],
  );

  const previousAssignments = useMemo(
    () => assignments.filter((item) => item.status === 'Returned'),
    [assignments],
  );

  const previousByRange = useMemo(() => {
    const now = new Date();
    let days = 90;
    if (historyRange === 'Last 30 Days') days = 30;
    if (historyRange === 'Last 6 Months') days = 180;
    if (historyRange === 'Last 1 Year') days = 365;
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - days);
    return previousAssignments.filter((item) => {
      const returnedOn = new Date(item.returnBy);
      return !Number.isNaN(returnedOn.valueOf()) && returnedOn >= threshold && returnedOn <= now;
    });
  }, [previousAssignments, historyRange]);

  const viewRows = useMemo(() => {
    if (activeView === 'current') return currentAssignments;
    if (activeView === 'previous') return previousByRange;
    return assignments;
  }, [activeView, assignments, currentAssignments, previousByRange]);

  const viewTitle =
    activeView === 'current' ? 'Current Assignments' :
      activeView === 'previous' ? 'Previous Assignments' : 'All Assignments';

  const navItems = [
    { key: 'current', label: 'Current', count: currentAssignments.length },
    { key: 'previous', label: 'Previous', count: previousByRange.length },
    { key: 'all', label: 'All', count: assignments.length },
  ];

  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="asnPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Assignments</h1>
              <p>Track device assignment lifecycle across teams and offices.</p>
            </section>
            <PageSidebar context="Assignments" />
          </div>
          <div className="appPageMain">
            <section className="asnTop">
              <div className="asnTopRow">
              </div>
              {isLoading && <p className="asnHeading">Loading assignments...</p>}
              {!isLoading && fetchError && <p className="asnHeading">{fetchError}</p>}
            </section>

            <section className="asnLayout">
              <aside className="asnSidebar">
                <nav className="asnNav">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`asnNavBtn ${activeView === item.key ? 'asnNavBtnActive' : ''}`}
                      onClick={() => setActiveView(item.key)}
                    >
                      <span>{item.label}</span>
                      <strong>{item.count}</strong>
                    </button>
                  ))}
                </nav>

                {activeView === 'previous' && (
                  <section className="asnSidebarSection">
                    <div className="asnSideHead">
                      <h3>Previous Range</h3>
                      <select
                        className="asnRangeSelect"
                        value={historyRange}
                        onChange={(e) => setHistoryRange(e.target.value)}
                      >
                        <option>Last 30 Days</option>
                        <option>Last 3 Months</option>
                        <option>Last 6 Months</option>
                        <option>Last 1 Year</option>
                      </select>
                    </div>
                    <p className="asnHelperText">Filter returned assignments by timeframe.</p>
                  </section>
                )}

                <section className="asnSidebarSection asnQuickStats">
                  {assignmentStats.map((item) => (
                    <div key={item.label}>
                      <p>{item.label}</p>
                      <h4>{item.value}</h4>
                    </div>
                  ))}
                </section>

                <section className="asnSidebarSection">
                  <h3>Recently Added</h3>
                  <ul className="asnSideList">
                    {assignments.slice(0, 3).map((item) => (
                      <li key={`${item.id}-recent`}>
                        <strong>{item.id}</strong>
                        <span>{item.asset}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>

              <section className="asnCard">
                <div className="asnTableHead">
                  <h3>{viewTitle}</h3>
                </div>
                <div className="asnTableWrap">
                  <table className="asnTable">
                    <thead>
                      <tr>
                        <th>Assignment ID</th>
                        <th>Asset</th>
                        <th>Assignee</th>
                        <th>Assigned On</th>
                        <th>Return By</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewRows.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.asset}</td>
                          <td>{item.assignee}</td>
                          <td>{item.assignedOn}</td>
                          <td>{item.returnBy}</td>
                          <td><span className={`asnBadge asnBadge${item.status.replace(' ', '')}`}>{item.status}</span></td>
                        </tr>
                      ))}
                      {viewRows.length === 0 && (
                        <tr>
                          <td className="asnEmptyRow" colSpan={6}>No assignments in this section.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
