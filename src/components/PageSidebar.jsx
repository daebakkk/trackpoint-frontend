import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const baseContent = {
  Welcome: {
    status: 'Platform Ready',
    metric: 'Live data enabled',
    notes: ['Fast onboarding flow', 'Login popup available', 'Dashboard preview enabled'],
  },
  Signup: {
    status: 'Account Setup',
    metric: '2 min average',
    notes: ['Use work email', 'Pick role carefully', 'Strong password required'],
  },
};

const actionMap = {
  Dashboard: [
    { label: 'Open Maintenance', to: '/maintenance' },
    { label: 'View Reports', to: '/reports' },
    { label: 'Review Assets', to: '/assets' },
  ],
  Assets: [
    { label: 'Add Asset', to: '/assets' },
    { label: 'Assign Asset', to: '/assets' },
    { label: 'Review Staff', to: '/stfdr' },
  ],
  Staff: [
    { label: 'View Staff', to: '/stfdr' },
    { label: 'Review Assets', to: '/assets' },
    { label: 'Assignments', to: '/assignments' },
  ],
  Assignments: [
    { label: 'Open Assignments', to: '/assignments' },
    { label: 'Review Assets', to: '/assets' },
    { label: 'Maintenance', to: '/maintenance' },
  ],
  Maintenance: [
    { label: 'Create Ticket', to: '/maintenance' },
    { label: 'Review Assets', to: '/assets' },
    { label: 'Assignments', to: '/assignments' },
  ],
  Location: [
    { label: 'View Assets', to: '/assets' },
    { label: 'Review Staff', to: '/stfdr' },
    { label: 'Assignments', to: '/assignments' },
  ],
  Reports: [
    { label: 'Open Reports', to: '/reports' },
    { label: 'View Dashboard', to: '/dashboard' },
    { label: 'Maintenance', to: '/maintenance' },
  ],
};

function formatTimeAgo(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'â€”';
  const diffMs = Date.now() - parsed.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function PageSidebar({ context = 'Dashboard' }) {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSidebarData() {
      setIsLoading(true);
      try {
        const [assetsResponse, staffResponse, assignmentsResponse, ticketsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/assets/`),
          fetch(`${API_BASE_URL}/api/staff/`),
          fetch(`${API_BASE_URL}/api/assignments/`),
          fetch(`${API_BASE_URL}/api/maintenance-tickets/`),
        ]);
        if (!isMounted) return;
        const [assetsData, staffData, assignmentsData, ticketsData] = await Promise.all([
          assetsResponse.ok ? assetsResponse.json() : [],
          staffResponse.ok ? staffResponse.json() : [],
          assignmentsResponse.ok ? assignmentsResponse.json() : [],
          ticketsResponse.ok ? ticketsResponse.json() : [],
        ]);
        setAssets(assetsData);
        setStaff(staffData);
        setAssignments(assignmentsData);
        setTickets(ticketsData);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSidebarData();
    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (baseContent[context]) return baseContent[context];

    const assetsCount = assets.length;
    const staffCount = staff.length;
    const assignmentsCount = assignments.length;
    const ticketsCount = tickets.length;
    const openAssignments = assignments.filter((item) => item.status !== 'Returned').length;
    const returnedAssignments = assignments.filter((item) => item.status === 'Returned').length;
    const unassignedAssets = assets.filter((asset) => !asset.assigned_to).length;
    const criticalAssets = assets.filter((asset) => {
      const status = (asset.status || '').toLowerCase();
      return status.includes('critical') || status.includes('lost') || status.includes('repair');
    }).length;
    const criticalTickets = tickets.filter((ticket) => ticket.lane === 'Critical').length;
    const locationsCount = new Set(assets.map((asset) => asset.location || 'Unassigned')).size;

    if (isLoading) {
      return {
        status: 'Loading',
        metric: 'Fetching live data',
        notes: ['Syncing assets', 'Syncing staff', 'Syncing assignments'],
      };
    }

    const contextMap = {
      Dashboard: {
        status: 'Live Monitoring',
        metric: `${ticketsCount} open tickets`,
        notes: [
          `${criticalAssets} assets flagged`,
          `${unassignedAssets} unassigned assets`,
          `${assignmentsCount} assignments tracked`,
        ],
      },
      Assets: {
        status: 'Inventory View',
        metric: `${assetsCount} tracked assets`,
        notes: [
          `${unassignedAssets} unassigned assets`,
          `${criticalAssets} assets need attention`,
          `${locationsCount} active locations`,
        ],
      },
      Staff: {
        status: 'Team Directory',
        metric: `${staffCount} active staff`,
        notes: [
          `${openAssignments} active assignments`,
          `${unassignedAssets} assets unassigned`,
          `${locationsCount} offices covered`,
        ],
      },
      Assignments: {
        status: 'Assignment Flow',
        metric: `${assignmentsCount} records`,
        notes: [
          `${openAssignments} active`,
          `${returnedAssignments} returned`,
          `${unassignedAssets} assets unassigned`,
        ],
      },
      Maintenance: {
        status: 'Ops Queue',
        metric: `${ticketsCount} active tasks`,
        notes: [
          `${criticalTickets} critical tickets`,
          `${criticalAssets} assets flagged`,
          `${assetsCount} assets tracked`,
        ],
      },
      Location: {
        status: 'Location Tracking',
        metric: `${locationsCount} mapped locations`,
        notes: [
          `${assetsCount} tracked assets`,
          `${unassignedAssets} unassigned assets`,
          `${staffCount} staff coverage`,
        ],
      },
      Reports: {
        status: 'Reporting Window',
        metric: `${assetsCount} assets, ${ticketsCount} tickets`,
        notes: [
          `${criticalAssets} assets flagged`,
          `${openAssignments} active assignments`,
          `${locationsCount} locations tracked`,
        ],
      },
    };

    return contextMap[context] || contextMap.Dashboard;
  }, [assets, staff, assignments, tickets, context, isLoading]);

  const quickActions = useMemo(() => actionMap[context] || actionMap.Dashboard, [context]);

  const liveFeed = useMemo(() => {
    const ticketActivity = tickets.map((ticket) => ({
      time: ticket.created_at,
      text: `Ticket ${ticket.ticket_id} created`,
    }));
    const assignmentActivity = assignments.map((assignment) => ({
      time: assignment.date_assigned,
      text: `Assignment ${assignment.assignment_id} issued`,
    }));
    const combined = [...ticketActivity, ...assignmentActivity]
      .filter((entry) => entry.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
      .map((entry) => ({ time: formatTimeAgo(entry.time), text: entry.text }));
    return combined.length ? combined : [{ time: 'â€”', text: 'No recent activity' }];
  }, [tickets, assignments]);

  const systemHealth = useMemo(() => ([
    { label: 'Assets', value: `${assets.length}` },
    { label: 'Staff', value: `${staff.length}` },
    { label: 'Queue', value: `${tickets.length} open` },
  ]), [assets.length, staff.length, tickets.length]);

  return (
    <aside className="appSidebar">
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
            <button
              key={action.label}
              type="button"
              className="appSidebarPillBtn"
              onClick={() => navigate(action.to)}
            >
              {action.label}
            </button>
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
