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
    approvedBy: item.approved_by || '-',
  };
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [historyRange, setHistoryRange] = useState('Last 3 Months');
  const [activeView, setActiveView] = useState('current');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    assignmentId: '',
    assetId: '',
    assigneeId: '',
    assignedOn: '',
    returnBy: '',
    status: 'Active',
    approvedBy: '',
  });

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

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        assignment_id: form.assignmentId,
        asset: Number(form.assetId),
        assignee: form.assigneeId ? Number(form.assigneeId) : null,
        date_assigned: form.assignedOn,
        return_date: form.returnBy || null,
        status: form.status,
        approved_by: form.approvedBy,
      };
      const response = await fetch(`${API_BASE_URL}/api/assignments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save assignment.');

      const created = await response.json();
      setAssignments((prev) => [normalizeAssignment(created), ...prev]);
      setForm({
        assignmentId: '',
        assetId: '',
        assigneeId: '',
        assignedOn: '',
        returnBy: '',
        status: 'Active',
        approvedBy: '',
      });
      setShowForm(false);
    } catch (error) {
      setFetchError(error.message || 'Unable to save assignment.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
                <button type="button" className="pageActionBtn" onClick={() => setShowForm(true)}>Assign</button>
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
                        <th>Approved By</th>
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
                          <td>{item.approvedBy}</td>
                        </tr>
                      ))}
                      {viewRows.length === 0 && (
                        <tr>
                          <td className="asnEmptyRow" colSpan={7}>No assignments in this section.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>

            {showForm && (
              <div className="entryModalBackdrop" onClick={() => setShowForm(false)}>
                <div className="entryModalCard" role="dialog" aria-modal="true" aria-label="Create assignment" onClick={(e) => e.stopPropagation()}>
                  <div className="entryModalHead">
                    <h2>Assign Asset</h2>
                    <button type="button" className="entryCloseBtn" onClick={() => setShowForm(false)} aria-label="Close assignment form">x</button>
                  </div>
                  <form className="entryForm" onSubmit={handleSubmit}>
                    <label>
                      Assignment ID
                      <input name="assignmentId" value={form.assignmentId} onChange={handleChange} placeholder="e.g. AS-3001" required />
                    </label>
                    <label>
                      Asset DB ID
                      <input name="assetId" type="number" min="1" value={form.assetId} onChange={handleChange} required />
                    </label>
                    <label>
                      Assignee DB ID (optional)
                      <input name="assigneeId" type="number" min="1" value={form.assigneeId} onChange={handleChange} />
                    </label>
                    <label>
                      Assigned on
                      <input name="assignedOn" type="date" value={form.assignedOn} onChange={handleChange} required />
                    </label>
                    <label>
                      Return by
                      <input name="returnBy" type="date" value={form.returnBy} onChange={handleChange} required />
                    </label>
                    <label>
                      Status
                      <select name="status" value={form.status} onChange={handleChange}>
                        <option>Active</option>
                        <option>In Review</option>
                        <option>Returned</option>
                      </select>
                    </label>
                    <label>
                      Approved by
                      <input name="approvedBy" value={form.approvedBy} onChange={handleChange} />
                    </label>
                    <button type="submit" className="entrySubmitBtn" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Assignment'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
