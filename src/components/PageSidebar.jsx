const contextContent = {
  Welcome: {
    status: 'Platform Ready',
    metric: '99.4% uptime',
    notes: ['Fast onboarding flow', 'Login popup available', 'Dashboard preview enabled'],
  },
  Signup: {
    status: 'Account Setup',
    metric: '2 min average',
    notes: ['Use work email', 'Pick role carefully', 'Strong password required'],
  },
  Dashboard: {
    status: 'Live Monitoring',
    metric: '18 open tickets',
    notes: ['Check priority alerts', 'Review activity feed', 'Watch utilization trend'],
  },
  Assets: {
    status: 'Inventory View',
    metric: '12 tracked assets',
    notes: ['Filter by office', 'Watch status labels', 'Update missing assignments'],
  },
  Staff: {
    status: 'Team Directory',
    metric: '8 active staff',
    notes: ['Filter by office', 'Confirm assigned assets', 'Spot role coverage gaps'],
  },
  Assignments: {
    status: 'Assignment Flow',
    metric: '15 records',
    notes: ['Compare current vs previous', 'Use time range filter', 'Track return dates'],
  },
  Maintenance: {
    status: 'Ops Queue',
    metric: '6 active tasks',
    notes: ['Prioritize critical lane', 'Update ETA quickly', 'Close completed tickets'],
  },
  Location: {
    status: 'Location Tracking',
    metric: '7 mapped assets',
    notes: ['Filter by Fifth Lab', 'Confirm holder details', 'Watch attention-tagged rows'],
  },
  Reports: {
    status: 'Reporting Window',
    metric: '7 key metrics',
    notes: ['Switch time range', 'Compare trend deltas', 'Flag risky movement'],
  },
};

const quickActions = [
  'Add new record',
  'Export current view',
  'Review flagged items',
];

const liveFeed = [
  { time: '2m', text: 'Sync check completed' },
  { time: '9m', text: 'Data cache refreshed' },
  { time: '18m', text: 'Status board updated' },
  { time: '31m', text: 'User action logged' },
];

const systemHealth = [
  { label: 'Sync', value: 'Stable' },
  { label: 'Latency', value: '41ms' },
  { label: 'Queue', value: 'Normal' },
];

export default function PageSidebar({ context = 'Dashboard' }) {
  const content = contextContent[context] || contextContent.Dashboard;

  return (
    <aside className="appSidebar">
      <section className="appSidebarSection">
        <h3>{context}</h3>
        <p>Context panel for this page.</p>
      </section>

      <section className="appSidebarSection">
        <h4>Snapshot</h4>
        <div className="appSidebarMeta">
          <p className="appSidebarMetaLabel">{content.status}</p>
          <p className="appSidebarMetaValue">{content.metric}</p>
        </div>
      </section>

      <section className="appSidebarSection">
        <h4>Focus</h4>
        <ul>
          {content.notes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="appSidebarSection">
        <h4>Quick Actions</h4>
        <div className="appSidebarPills">
          {quickActions.map((action) => (
            <span key={action}>{action}</span>
          ))}
        </div>
      </section>

      <section className="appSidebarSection appSidebarGrow">
        <h4>Live Feed</h4>
        <ul className="appSidebarFeed">
          {liveFeed.map((item) => (
            <li key={`${item.time}-${item.text}`}>
              <strong>{item.time}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="appSidebarSection">
        <h4>System Health</h4>
        <div className="appSidebarHealth">
          {systemHealth.map((item) => (
            <p key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </p>
          ))}
        </div>
      </section>
    </aside>
  );
}
