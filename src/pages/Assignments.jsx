import Navbar from '../components/Navbar';
import { useMemo, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const initialAssignments = [
  { id: 'AS-3001', asset: 'ASUS 2022 (0567)', assignee: 'Abisola Adegboruwa', assignedOn: '2026-02-11', returnBy: '2026-08-11', status: 'Active', approvedBy: 'Maya Johnson' },
  { id: 'AS-3002', asset: 'DELL 2024 (0182)', assignee: 'Casey Luo', assignedOn: '2026-02-08', returnBy: '2026-07-30', status: 'Active', approvedBy: 'Abisola Adegboruwa' },
  { id: 'AS-3003', asset: 'MacBook Pro (0243)', assignee: 'Jada Ricottski', assignedOn: '2026-01-20', returnBy: '2026-06-20', status: 'In Review', approvedBy: 'Ifeoma Chukwu' },
  { id: 'AS-3004', asset: 'Surface Laptop 5 (0589)', assignee: 'David Kim', assignedOn: '2026-02-01', returnBy: '2026-09-01', status: 'Active', approvedBy: 'Maya Johnson' },
  { id: 'AS-3005', asset: 'HP EliteBook 850 (0427)', assignee: 'Ifeoma Chukwu', assignedOn: '2026-01-28', returnBy: '2026-06-28', status: 'Returned', approvedBy: 'Abisola Adegboruwa' },
  { id: 'AS-3006', asset: 'Lenovo ThinkPad T14 (0311)', assignee: 'Maya Johnson', assignedOn: '2026-02-14', returnBy: '2026-08-14', status: 'Active', approvedBy: 'David Kim' },
  { id: 'AS-3007', asset: 'Dell OptiPlex 7090 (0648)', assignee: 'Noah Patel', assignedOn: '2026-01-15', returnBy: '2026-07-15', status: 'Active', approvedBy: 'Abisola Adegboruwa' },
  { id: 'AS-3008', asset: 'iPad Pro 11 (0914)', assignee: 'Tobi Alade', assignedOn: '2026-02-18', returnBy: '2026-05-18', status: 'In Review', approvedBy: 'Maya Johnson' },
  { id: 'AS-3009', asset: 'Mac Mini M2 (0732)', assignee: 'Ruth Mensah', assignedOn: '2026-01-09', returnBy: '2026-04-09', status: 'Returned', approvedBy: 'Casey Luo' },
  { id: 'AS-3010', asset: 'Epson Workforce Printer (0675)', assignee: 'Admin Unit', assignedOn: '2026-02-22', returnBy: '2026-06-22', status: 'Active', approvedBy: 'Ifeoma Chukwu' },
  { id: 'AS-3011', asset: 'HP i7 (0769)', assignee: 'Gbemi Oduselu', assignedOn: '2026-01-30', returnBy: '2026-07-30', status: 'Active', approvedBy: 'Maya Johnson' },
  { id: 'AS-3012', asset: 'Cisco Catalyst 9200 (0821)', assignee: 'Network Team', assignedOn: '2026-02-03', returnBy: '2026-11-03', status: 'In Review', approvedBy: 'David Kim' },
  { id: 'AS-3013', asset: 'ASUS 2022 (0567)', assignee: 'Training Pool', assignedOn: '2025-11-25', returnBy: '2026-02-25', status: 'Returned', approvedBy: 'Abisola Adegboruwa' },
  { id: 'AS-3014', asset: 'Surface Laptop 5 (0589)', assignee: 'Remote Team B', assignedOn: '2025-12-12', returnBy: '2026-03-01', status: 'Returned', approvedBy: 'Maya Johnson' },
  { id: 'AS-3015', asset: 'HP EliteBook 850 (0427)', assignee: 'Operations Desk', assignedOn: '2026-02-26', returnBy: '2026-08-26', status: 'Active', approvedBy: 'Ifeoma Chukwu' },
];

export default function Assignments() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [historyRange, setHistoryRange] = useState('Last 3 Months');
  const [activeView, setActiveView] = useState('current');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    asset: '',
    assignee: '',
    assignedOn: '',
    returnBy: '',
    status: 'Active',
    approvedBy: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextId = `AS-${String(3000 + assignments.length + 1)}`;
    setAssignments((prev) => [{ id: nextId, ...form }, ...prev]);
    setForm({
      asset: '',
      assignee: '',
      assignedOn: '',
      returnBy: '',
      status: 'Active',
      approvedBy: '',
    });
    setShowForm(false);
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
                      Asset
                      <input name="asset" value={form.asset} onChange={handleChange} placeholder="e.g. HP EliteBook 850 (0427)" required />
                    </label>
                    <label>
                      Assignee
                      <input name="assignee" value={form.assignee} onChange={handleChange} required />
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
                    <button type="submit" className="entrySubmitBtn">Save Assignment</button>
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
