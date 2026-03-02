import Navbar from "../components/Navbar";

const repairQueue = [
  { ticket: 'R-1021', asset: 'DELL 2024 (0182)', issue: 'Motherboard diagnostics', assigned: 'Casey Luo', priority: 'High', eta: 'Today' },
  { ticket: 'R-1022', asset: 'HP EliteBook 850 (0427)', issue: 'Battery replacement', assigned: 'Noah Patel', priority: 'Medium', eta: 'Tomorrow' },
  { ticket: 'R-1023', asset: 'Epson Workforce Printer (0675)', issue: 'Toner and paper feed fault', assigned: 'Ifeoma Chukwu', priority: 'Low', eta: '2 days' },
  { ticket: 'R-1024', asset: 'Cisco Catalyst 9200 (0821)', issue: 'Port instability check', assigned: 'Network Team', priority: 'High', eta: 'Today' },
  { ticket: 'R-1025', asset: 'MacBook Pro (0243)', issue: 'Display assembly', assigned: 'David Kim', priority: 'Medium', eta: '3 days' },
];

const stats = [
  { label: 'Open Repairs', value: '5' },
  { label: 'High Priority', value: '2' },
  { label: 'Completed Today', value: '3' },
];

export default function Repairs() {
  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="repPage">
        <section className="repTop">
          <div className="repTopRow">
            <h1 className="repTitle">Repairs</h1>
            <button type="button" className="pageActionBtn">Create Ticket</button>
          </div>
          <p className="repHeading">Track devices in repair and monitor repair turnaround.</p>
        </section>

        <section className="repStats">
          {stats.map((stat) => (
            <article className="repStatCard" key={stat.label}>
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </article>
          ))}
        </section>

        <section className="repCard">
          <table className="repTable">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Asset</th>
                <th>Issue</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {repairQueue.map((item) => (
                <tr key={item.ticket}>
                  <td>{item.ticket}</td>
                  <td>{item.asset}</td>
                  <td>{item.issue}</td>
                  <td>{item.assigned}</td>
                  <td>
                    <span className={`repBadge repBadge${item.priority}`}>{item.priority}</span>
                  </td>
                  <td>{item.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
