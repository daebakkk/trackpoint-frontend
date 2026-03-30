import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const initialMaintenanceLanes = {
  Critical: [],
  Planned: [],
  Preventive: [],
};

const initialMaintenanceTimeline = [];

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

function parseEtaDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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
  const [historyRange, setHistoryRange] = useState('Last 30 Days');
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({
    lane: 'Planned',
    ticket: '',
    assetId: '',
    task: '',
    owner: '',
    eta: '',
  });

  const healthCards = (() => {
    const openTickets = tickets.filter((ticket) => ticket.status !== 'Completed').length;
    const completedTickets = tickets.filter((ticket) => ticket.status === 'Completed').length;
    const dueSoon = tickets.filter((ticket) => {
      if (ticket.status === 'Completed') return false;
      const etaDate = parseEtaDate(ticket.eta);
      if (!etaDate) return false;
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
      return etaDate >= startOfToday && etaDate < startOfWeek;
    }).length;

    return [
      { label: 'Open Tickets', value: `${openTickets}`, meta: 'Active maintenance items' },
      { label: 'Due This Week', value: `${dueSoon}`, meta: 'Upcoming repairs' },
      { label: 'Completed Repairs', value: `${completedTickets}`, meta: 'Resolved tickets' },
    ];
  })();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => {
      if (name === 'assetId') {
        const asset = assets.find((item) => String(item.asset_id || item.assetId).trim().toLowerCase() === value.trim().toLowerCase());
        return { ...prev, [name]: value, owner: asset?.location || prev.owner };
      }
      return { ...prev, [name]: value };
    });
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
              <div className="mntOpsHeroActions">
                <button type="button" className="pageActionBtn" onClick={() => setShowForm(true)}>Create Ticket</button>
                <button type="button" className="pageActionBtn mntOpsHistoryBtn" onClick={() => setShowHistory((prev) => !prev)}>
                  {showHistory ? 'Hide Repair History' : 'Repair History'}
                </button>
              </div>
            </section>

            {showHistory && (
              <section className="mntOpsHistory">
              <div className="mntOpsHistoryHead">
                <h3>Repair History</h3>
                <div className="mntOpsHistoryControls">
                  <span>Completed</span>
                  <select
                    className="assOfficeSelect mntOpsRangeSelect"
                    value={historyRange}
                    onChange={(event) => setHistoryRange(event.target.value)}
                  >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>Last 6 Months</option>
                  </select>
                </div>
              </div>
              <div className="mntOpsHistoryList">
                {tickets.filter((ticket) => ticket.status === 'Completed').length === 0 && (
                  <p className="mntOpsHistoryEmpty">No completed repairs yet.</p>
                )}
                {tickets
                  .filter((ticket) => ticket.status === 'Completed')
                  .filter((ticket) => {
                    const completedAt = ticket.completed_at ? new Date(ticket.completed_at) : null;
                    if (!completedAt || Number.isNaN(completedAt.getTime())) return true;
                    const now = new Date();
                    let days = 30;
                    if (historyRange === 'Last 7 Days') days = 7;
                    if (historyRange === 'Last 90 Days') days = 90;
                    if (historyRange === 'Last 6 Months') days = 180;
                    const cutoff = new Date(now);
                    cutoff.setDate(now.getDate() - days);
                    return completedAt >= cutoff;
                  })
                  .slice(0, 12)
                  .map((ticket) => (
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
            )}

            <section className="mntOpsHealthGrid">
              {healthCards.map((item) => (
                <article className="mntOpsHealthCard" key={item.label}>
                  <p>{item.label}</p>
                  <h3>{item.value}</h3>
                  <span>{item.meta}</span>
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
                            <div className="mntOpsCardActions">
                              {(() => {
                                const etaDate = parseEtaDate(card.eta);
                                if (!etaDate) return null;
                                const today = new Date();
                                const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                                const startOfDayAfter = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
                                if (etaDate >= startOfToday && etaDate < startOfTomorrow) {
                                  return <span className="mntOpsDueTag mntOpsDueToday">Due Today</span>;
                                }
                                if (etaDate >= startOfTomorrow && etaDate < startOfDayAfter) {
                                  return <span className="mntOpsDueTag mntOpsDueTomorrow">Due Tomorrow</span>;
                                }
                                return null;
                              })()}
                              <button
                                type="button"
                                className="mntOpsCompleteBtn"
                                disabled={isCompleting}
                                onClick={() => handleCompleteTicket(card)}
                              >
                                Mark Completed
                              </button>
                            </div>
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
