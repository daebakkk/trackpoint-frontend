import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const initialMaintenanceLanes = {
  Critical: [
    { id: null, ticket: 'M-2201', asset: 'DELL 2024 (0182)', task: 'Motherboard diagnostics', owner: 'Casey Luo', eta: 'Today 16:30' },
    { id: null, ticket: 'M-2204', asset: 'Cisco Catalyst 9200 (0821)', task: 'Port stability testing', owner: 'Network Team', eta: 'Today 18:00' },
  ],
  Planned: [
    { id: null, ticket: 'M-2202', asset: 'HP EliteBook 850 (0427)', task: 'Battery replacement', owner: 'Noah Patel', eta: 'Tomorrow 11:00' },
    { id: null, ticket: 'M-2205', asset: 'MacBook Pro (0243)', task: 'Display assembly', owner: 'David Kim', eta: 'Mar 04 13:00' },
  ],
  Preventive: [
    { id: null, ticket: 'PM-3110', asset: 'Server Room B UPS', task: 'Quarterly battery check', owner: 'Ifeoma Chukwu', eta: 'Mar 05 10:00' },
    { id: null, ticket: 'PM-3111', asset: 'Floor 2 Rack', task: 'Cable integrity audit', owner: 'Network Team', eta: 'Mar 06 09:00' },
  ],
};

const machineHealth = [
  { system: 'Endpoint Fleet', uptime: '99.2%', trend: '+0.4%' },
  { system: 'Network Core', uptime: '98.6%', trend: '-0.2%' },
  { system: 'Print Services', uptime: '97.9%', trend: '+0.1%' },
];

const initialMaintenanceTimeline = [
  { time: '08:15', event: 'Auto-check completed for 42 devices', level: 'Info' },
  { time: '09:40', event: 'Critical alert raised for Switch Rack 2', level: 'Critical' },
  { time: '10:05', event: 'Battery replacement ticket assigned', level: 'Action' },
  { time: '11:30', event: 'Maintenance window approved by ops lead', level: 'Info' },
];

async function getErrorMessage(response, fallback) {
  try {
    const data = await response.json();
    if (typeof data === 'string') return data;
    if (data.detail) return `${fallback} (${response.status}): ${data.detail}`;
    return `${fallback} (${response.status}): ${JSON.stringify(data)}`;
  } catch {
    const text = await response.text();
    return `${fallback} (${response.status}): ${text || response.statusText}`;
  }
}

function buildTimelineFromTickets(tickets) {
  return tickets.slice(0, 6).map((ticket) => ({
    time: new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event: `${ticket.ticket_id} created for ${ticket.assetLabel}`,
    level: ticket.lane === 'Critical' ? 'Critical' : ticket.lane === 'Preventive' ? 'Info' : 'Action',
  }));
}

function formatEta(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    }
  }
  return value;
}

export default function Maintenance() {
  const [maintenanceLanes, setMaintenanceLanes] = useState(initialMaintenanceLanes);
  const [maintenanceTimeline, setMaintenanceTimeline] = useState(initialMaintenanceTimeline);
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    lane: 'Planned',
    ticket: '',
    assetId: '',
    task: '',
    owner: '',
    eta: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function buildNextTicketId(laneValue, existingTickets) {
    const prefix = laneValue === 'Preventive' ? 'PM-' : 'M-';
    const allTickets = existingTickets.map((item) => item.ticket_id);
    const usedNumbers = allTickets
      .filter((ticket) => ticket.startsWith(prefix))
      .map((ticket) => Number(ticket.replace(prefix, '')))
      .filter((num) => Number.isFinite(num));
    const maxNumber = usedNumbers.length ? Math.max(...usedNumbers) : laneValue === 'Preventive' ? 3100 : 2200;
    return `${prefix}${maxNumber + 1}`;
  }

  function buildLanesFromTickets(data) {
    return data.reduce(
      (acc, ticket) => {
        if (ticket.status === 'Completed') {
          return acc;
        }
        const laneKey = ticket.lane || 'Planned';
        const assetLabel = ticket.asset_name && ticket.asset_code
          ? `${ticket.asset_name} (${ticket.asset_code})`
          : ticket.asset;
        acc[laneKey] = acc[laneKey] || [];
        acc[laneKey].push({
          id: ticket.id,
          ticket: ticket.ticket_id,
          asset: assetLabel,
          task: ticket.task,
          owner: ticket.owner,
          eta: ticket.eta,
        });
        return acc;
      },
      { Critical: [], Planned: [], Preventive: [] },
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const laneValue = form.lane || 'Planned';
    const assetIdValue = form.assetId.trim();
    const taskValue = form.task.trim();
    const ownerValue = form.owner.trim();
    const etaValue = form.eta.trim();

    if (!assetIdValue || !taskValue || !ownerValue || !etaValue) {
      return;
    }

    setIsSubmitting(true);
    setFetchError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance-tickets/`);
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to load tickets for ID generation'));
      }
      const currentTickets = await response.json();
      const payload = {
        ticket_id: form.ticket.trim() || buildNextTicketId(laneValue, currentTickets),
        lane: laneValue,
        asset_id: assetIdValue,
        task: taskValue,
        owner: ownerValue,
        eta: etaValue,
        status: 'Open',
      };

      const createResponse = await fetch(`${API_BASE_URL}/api/maintenance-tickets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!createResponse.ok) {
        throw new Error(await getErrorMessage(createResponse, 'Failed to create ticket'));
      }

      const created = await createResponse.json();
      setTickets((prev) => [created, ...prev]);
      const assetLabel = created.asset_name && created.asset_code
        ? `${created.asset_name} (${created.asset_code})`
        : created.asset;
      setMaintenanceLanes((prev) => ({
        ...prev,
        [created.lane]: [
          {
            id: created.id,
            ticket: created.ticket_id,
            asset: assetLabel,
            task: created.task,
            owner: created.owner,
            eta: created.eta,
          },
          ...(prev[created.lane] || []),
        ],
      }));

      setMaintenanceTimeline((prev) => ([
        {
          time: new Date(created.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `${created.ticket_id} created for ${assetLabel}`,
          level: created.lane === 'Critical' ? 'Critical' : created.lane === 'Preventive' ? 'Info' : 'Action',
        },
        ...prev,
      ]));

      setForm({
        lane: 'Planned',
        ticket: '',
        assetId: '',
        task: '',
        owner: '',
        eta: '',
      });
      setShowForm(false);
    } catch (error) {
      setFetchError(error.message || 'Unable to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteTicket(card) {
    if (!card.id) {
      return;
    }
    setIsCompleting(true);
    setFetchError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance-tickets/${card.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to complete ticket'));
      }
      const updated = await response.json();
      setTickets((prev) => {
        const nextTickets = prev.map((item) => (item.id === updated.id ? updated : item));
        setMaintenanceLanes(buildLanesFromTickets(nextTickets));
        return nextTickets;
      });
    } catch (error) {
      setFetchError(error.message || 'Unable to complete ticket.');
    } finally {
      setIsCompleting(false);
    }
  }

  useEffect(() => {
    async function loadTickets() {
      setIsLoading(true);
      setAssetsLoading(true);
      setFetchError('');
      try {
        const [ticketsResponse, assetsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/maintenance-tickets/`),
          fetch(`${API_BASE_URL}/api/assets/`),
        ]);
        if (!ticketsResponse.ok) {
          throw new Error(await getErrorMessage(ticketsResponse, 'Failed to load maintenance tickets'));
        }
        const data = await ticketsResponse.json();
        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          setAssets(assetsData);
        } else {
          setAssets([]);
        }
        setTickets(data);
        setMaintenanceLanes(buildLanesFromTickets(data));
        const timelineTickets = data.map((ticket) => ({
          ...ticket,
          assetLabel: ticket.asset_name && ticket.asset_code
            ? `${ticket.asset_name} (${ticket.asset_code})`
            : ticket.asset,
        }));
        setMaintenanceTimeline(buildTimelineFromTickets(timelineTickets));
      } catch (error) {
        setFetchError(error.message || 'Unable to load maintenance tickets.');
      } finally {
        setIsLoading(false);
        setAssetsLoading(false);
      }
    }

    loadTickets();
  }, []);

  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="mntOpsPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Preventive + Corrective Operations</h1>
              <p>A live operations board for maintenance routing, machine health, and execution timeline.</p>
            </section>
            <PageSidebar context="Maintenance" />
          </div>
          <div className="appPageMain">
            <section className="mntOpsHero">
              <div>
                <p className="mntOpsEyebrow">Maintenance Control Board</p>
              </div>
              <button type="button" className="pageActionBtn" onClick={() => setShowForm(true)}>Create Ticket</button>
            </section>

            <section className="mntOpsHealthGrid">
              {machineHealth.map((item) => (
                <article className="mntOpsHealthCard" key={item.system}>
                  <p>{item.system}</p>
                  <h3>{item.uptime}</h3>
                  <span>{item.trend} this week</span>
                </article>
              ))}
            </section>

            <section className="mntOpsMainGrid">
              <article className="mntOpsLaneBoard">
                <div className="mntOpsPanelHead">
                  <h2>Workstream Lanes</h2>
                  <span>Live Queue</span>
                </div>
                <div className="mntOpsLanes">
                  {Object.entries(maintenanceLanes).map(([lane, cards]) => (
                    <section className="mntOpsLane" key={lane}>
                      <h3>{lane}</h3>
                      <div className="mntOpsCards">
                        {cards.map((card) => (
                          <article className="mntOpsCard" key={card.ticket}>
                            <div className="mntOpsCardTop">
                              <p>{card.ticket}</p>
                              <span>{formatEta(card.eta)}</span>
                            </div>
                            <h4>{card.asset}</h4>
                            <p className="mntOpsTask">{card.task}</p>
                            <p className="mntOpsOwner">Owner: {card.owner}</p>
                            <button
                              type="button"
                              className="mntOpsCompleteBtn"
                              disabled={isCompleting}
                              onClick={() => handleCompleteTicket(card)}
                            >
                              Mark Completed
                            </button>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </article>

              <aside className="mntOpsTimeline">
                <div className="mntOpsPanelHead">
                  <h2>Execution Timeline</h2>
                </div>
                <ul>
                  {maintenanceTimeline.map((entry) => (
                    <li key={`${entry.time}-${entry.event}`}>
                      <div>
                        <strong>{entry.time}</strong>
                        <p>{entry.event}</p>
                      </div>
                      <span className={`mntOpsTag mntOpsTag${entry.level}`}>{entry.level}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </section>

            <section className="mntOpsHistory">
              <div className="mntOpsPanelHead">
                <h2>Repair History</h2>
                <span>Completed</span>
              </div>
              <div className="mntOpsHistoryList">
                {tickets.filter((ticket) => ticket.status === 'Completed').length === 0 && (
                  <p className="mntOpsHistoryEmpty">No completed repairs yet.</p>
                )}
                {tickets.filter((ticket) => ticket.status === 'Completed').map((ticket) => (
                  <div key={ticket.id} className="mntOpsHistoryRow">
                    <div>
                      <strong>{ticket.ticket_id}</strong>
                      <p>{ticket.asset_name ? `${ticket.asset_name} (${ticket.asset_code || ticket.asset_id || ''})` : ticket.asset}</p>
                    </div>
                    <div>
                      <span>{ticket.task}</span>
                      <span className="mntOpsHistoryMeta">{ticket.completed_at ? new Date(ticket.completed_at).toLocaleString() : 'Completed'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {isLoading && <p className="assHeading">Loading tickets...</p>}
            {!isLoading && fetchError && <p className="assHeading">{fetchError}</p>}

            {showForm && (
              <div className="entryModalBackdrop" onClick={() => setShowForm(false)}>
                <div className="entryModalCard" role="dialog" aria-modal="true" aria-label="Create maintenance ticket" onClick={(e) => e.stopPropagation()}>
                  <div className="entryModalHead">
                    <h2>Create Ticket</h2>
                    <button type="button" className="entryCloseBtn" onClick={() => setShowForm(false)} aria-label="Close create ticket form">x</button>
                  </div>
                  <form className="entryForm" onSubmit={handleSubmit}>
                    <label>
                      Lane
                      <select name="lane" value={form.lane} onChange={handleChange}>
                        <option>Critical</option>
                        <option>Planned</option>
                        <option>Preventive</option>
                      </select>
                    </label>
                    <label>
                      Ticket ID (optional)
                      <input name="ticket" value={form.ticket} onChange={handleChange} placeholder="Leave empty to auto-generate" />
                    </label>
                    <label>
                      Asset ID
                      <input
                        name="assetId"
                        list="maintenance-asset-options"
                        value={form.assetId}
                        onChange={handleChange}
                        placeholder={assetsLoading ? 'Loading assets...' : 'Select or type an asset ID'}
                        required
                      />
                      <datalist id="maintenance-asset-options">
                        {assets.map((asset) => (
                          <option key={asset.id} value={asset.asset_id}>
                            {asset.name} ({asset.asset_id})
                          </option>
                        ))}
                      </datalist>
                    </label>
                    <label>
                      Task
                      <input name="task" value={form.task} onChange={handleChange} placeholder="e.g. Battery replacement" required />
                    </label>
                    <label>
                      Owner
                      <input name="owner" value={form.owner} onChange={handleChange} placeholder="e.g. Support Team" required />
                    </label>
                    <label>
                      ETA
                      <input name="eta" type="datetime-local" value={form.eta} onChange={handleChange} required />
                    </label>
                    <button type="submit" className="entrySubmitBtn" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Ticket'}
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
