import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function normalizeAsset(item) {
    return {
        id: item.id,
        name: item.name,
        assetId: item.asset_id,
        assignment: item.assigned_to_name || 'Unassigned',
        assignedToStaffId: item.assigned_to_staff_id || '',
        location: item.location,
        status: item.status,
        createdAt: item.created_at || '',
    };
}

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

export default function Assets() {
    const [assets, setAssets] = useState([]);
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [selectedOffice, setSelectedOffice] = useState('All Offices');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [showForm, setShowForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isRetiring, setIsRetiring] = useState(false);
    const [form, setForm] = useState({
        assetId: '',
        name: '',
        location: '',
        status: 'Good condition',
        assignedToStaffId: '',

    });
    const [assignForm, setAssignForm] = useState({
        assetId: '',
        staffId: '',
    });
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [assetAssignments, setAssetAssignments] = useState([]);
    const [assetTickets, setAssetTickets] = useState([]);
    const [ticketForm, setTicketForm] = useState({
        lane: 'Planned',
        ticket: '',
        assetId: '',
        task: '',
        owner: '',
        eta: '',
    });

    useEffect(() => {
        async function loadAssets() {
            setIsLoading(true);
            setFetchError('');
            try {
                const [assetsResponse, staffResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/assets/`),
                    fetch(`${API_BASE_URL}/api/staff/`),
                ]);
                if (!assetsResponse.ok) {
                    throw new Error(await getErrorMessage(assetsResponse, 'Failed to load assets'));
                }
                if (!staffResponse.ok) {
                    throw new Error(await getErrorMessage(staffResponse, 'Failed to load staff'));
                }
                const assetsData = await assetsResponse.json();
                const staffData = await staffResponse.json();
                setAssets(assetsData.map(normalizeAsset));
                setStaff(staffData);
            } catch (error) {
                setFetchError(error.message || `Unable to fetch assets from ${API_BASE_URL}.`);
            } finally {
                setIsLoading(false);
            }
        }

        loadAssets();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleAssignChange(event) {
        const { name, value } = event.target;
        setAssignForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleTicketChange(event) {
        const { name, value } = event.target;
        setTicketForm((prev) => {
            if (name === 'assetId') {
                const asset = assets.find(
                    (item) => String(item.assetId).trim().toLowerCase() === value.trim().toLowerCase(),
                );
                return { ...prev, [name]: value, owner: asset?.location || prev.owner };
            }
            return { ...prev, [name]: value };
        });
    }

    async function openAssetDetails(asset) {
        if (selectedAsset && selectedAsset.id === asset.id && showDetails) {
            return;
        }
        setSelectedAsset(asset);
        setTicketForm((prev) => ({
            ...prev,
            assetId: asset.assetId || '',
        }));
        setShowDetails(true);
        setIsLoadingDetails(true);
        setAssetAssignments([]);
        setAssetTickets([]);
        setFetchError('');
        try {
            const [assignmentsResponse, ticketsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/assignments/?search=${encodeURIComponent(asset.assetId)}`),
                fetch(`${API_BASE_URL}/api/maintenance-tickets/?search=${encodeURIComponent(asset.assetId)}`),
            ]);
            const assignmentsData = assignmentsResponse.ok ? await assignmentsResponse.json() : [];
            const ticketsData = ticketsResponse.ok ? await ticketsResponse.json() : [];
            setAssetAssignments(assignmentsData);
            setAssetTickets(ticketsData);
        } catch (error) {
            setFetchError(error.message || 'Unable to load asset details.');
        } finally {
            setIsLoadingDetails(false);
        }
    }


    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                asset_id: form.assetId,
                name: form.name,
                location: form.location,
                status: form.status,
                assigned_to: null,
            };

            if (form.assignedToStaffId.trim()) {
                const staffIdInput = form.assignedToStaffId.trim().toLowerCase();
                let matchedStaff = staff.find(
                    (row) => String(row.staff_id).trim().toLowerCase() === staffIdInput,
                );
                if (!matchedStaff) {
                    const staffResponse = await fetch(
                        `${API_BASE_URL}/api/staff/?search=${encodeURIComponent(form.assignedToStaffId.trim())}`,
                    );
                    if (!staffResponse.ok) {
                        throw new Error(await getErrorMessage(staffResponse, 'Failed to validate assigned staff'));
                    }
                    const staffRows = await staffResponse.json();
                    matchedStaff = staffRows.find(
                        (row) => String(row.staff_id).trim().toLowerCase() === staffIdInput,
                    );
                }
                if (!matchedStaff) {
                    throw new Error(`Staff ID "${form.assignedToStaffId}" does not exist.`);
                }
                payload.assigned_to = matchedStaff.id;
            }

            const response = await fetch(`${API_BASE_URL}/api/assets/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(await getErrorMessage(response, 'Failed to save asset'));
            }

            const created = await response.json();
            setAssets((prev) => [normalizeAsset(created), ...prev]);
            setForm({
                assetId: '',
                name: '',
                location: '',
                status: 'Good condition',
                assignedToStaffId: '',
            });
            setShowForm(false);
        } catch (error) {
            setFetchError(error.message || 'Unable to save asset.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleAssignSubmit(event) {
        event.preventDefault();
        setIsAssigning(true);
        setFetchError('');
        try {
            const assetIdInput = assignForm.assetId.trim().toLowerCase();
            const staffIdInput = assignForm.staffId.trim().toLowerCase();
            const assetRow = assets.find(
                (row) => String(row.assetId).trim().toLowerCase() === assetIdInput,
            );
            if (!assetRow) {
                throw new Error(`Asset ID "${assignForm.assetId}" does not exist.`);
            }
            let matchedStaff = staff.find(
                (row) => String(row.staff_id).trim().toLowerCase() === staffIdInput,
            );
            if (!matchedStaff) {
                const staffResponse = await fetch(
                    `${API_BASE_URL}/api/staff/?search=${encodeURIComponent(assignForm.staffId.trim())}`,
                );
                if (!staffResponse.ok) {
                    throw new Error(await getErrorMessage(staffResponse, 'Failed to validate assigned staff'));
                }
                const staffRows = await staffResponse.json();
                matchedStaff = staffRows.find(
                    (row) => String(row.staff_id).trim().toLowerCase() === staffIdInput,
                );
            }
            if (!matchedStaff) {
                throw new Error(`Staff ID "${assignForm.staffId}" does not exist.`);
            }

            const response = await fetch(`${API_BASE_URL}/api/assets/${assetRow.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assigned_to: matchedStaff.id }),
            });
            if (!response.ok) {
                throw new Error(await getErrorMessage(response, 'Failed to assign asset'));
            }
            const updated = await response.json();
            setAssets((prev) => prev.map((item) => (item.id === updated.id ? normalizeAsset(updated) : item)));
            setAssignForm({ assetId: '', staffId: '' });
            setShowAssignForm(false);
        } catch (error) {
            setFetchError(error.message || 'Unable to assign asset.');
        } finally {
            setIsAssigning(false);
        }
    }

    async function handleTicketSubmit(event) {
        event.preventDefault();
        const laneValue = ticketForm.lane || 'Planned';
        const assetIdValue = ticketForm.assetId.trim();
        const taskValue = ticketForm.task.trim();
        const ownerValue = ticketForm.owner.trim();
        const etaValue = ticketForm.eta.trim();

        if (!assetIdValue || !taskValue || !ownerValue || !etaValue) {
            return;
        }

        setIsCreatingTicket(true);
        setFetchError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/maintenance-tickets/`);
            if (!response.ok) {
                throw new Error(await getErrorMessage(response, 'Failed to load tickets for ID generation'));
            }
            const currentTickets = await response.json();
            const prefix = laneValue === 'Preventive' ? 'PM-' : 'M-';
            const usedNumbers = currentTickets
                .map((item) => item.ticket_id)
                .filter((ticket) => ticket.startsWith(prefix))
                .map((ticket) => Number(ticket.replace(prefix, '')))
                .filter((num) => Number.isFinite(num));
            const maxNumber = usedNumbers.length ? Math.max(...usedNumbers) : laneValue === 'Preventive' ? 3100 : 2200;
            const payload = {
                ticket_id: ticketForm.ticket.trim() || `${prefix}${maxNumber + 1}`,
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
            setTicketForm({
                lane: 'Planned',
                ticket: '',
                assetId: selectedAsset ? selectedAsset.assetId : '',
                task: '',
                owner: '',
                eta: '',
            });
            setShowTicketForm(false);
        } catch (error) {
            setFetchError(error.message || 'Unable to create ticket.');
        } finally {
            setIsCreatingTicket(false);
        }
    }

    async function handleRetireAsset() {
        if (!selectedAsset) return;
        setIsRetiring(true);
        setFetchError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/assets/${selectedAsset.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Retired', assigned_to: null }),
            });
            if (!response.ok) {
                throw new Error(await getErrorMessage(response, 'Failed to retire asset'));
            }
            const updated = await response.json();
            setAssets((prev) => prev.map((item) => (item.id === updated.id ? normalizeAsset(updated) : item)));
            setSelectedAsset(normalizeAsset(updated));
        } catch (error) {
            setFetchError(error.message || 'Unable to retire asset.');
        } finally {
            setIsRetiring(false);
        }
    }

    const officeOptions = ['All Offices', ...new Set(assets.map((asset) => asset.location))];
    const filteredAssets =
        selectedOffice === 'All Offices'
            ? assets
            : assets.filter((asset) => asset.location === selectedOffice);
    const searchFilteredAssets = filteredAssets.filter((asset) => {
        const haystack = `${asset.name} ${asset.assetId} ${asset.assignment} ${asset.location} ${asset.status}`.toLowerCase();
        return haystack.includes(searchTerm.trim().toLowerCase());
    });
    const sortedAssets = [...searchFilteredAssets].sort((a, b) => {
        const left = (a[sortBy] ?? '').toString().toLowerCase();
        const right = (b[sortBy] ?? '').toString().toLowerCase();
        if (left < right) return sortDir === 'asc' ? -1 : 1;
        if (left > right) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    function handleSort(field) {
        if (sortBy === field) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            return;
        }
        setSortBy(field);
        setSortDir('asc');
    }

    return (
        <div>
            <header>
                <Navbar />
            </header>
            <main className="assPage">
                <div className="appPageLayout">
                    <div className="appPageLeftRail">
                        <section className="appPageLeftIntro">
                            <h1>Assets</h1>
                            <p>Track all office assets reliably</p>
                        </section>
                        <PageSidebar context="Assets" />
                    </div>
                    <div className="appPageMain">
                        <section className="assTop">
                            <div className="assTopRow">
                                <div className="assTopActions">
                                    <button type="button" className="pageActionBtn" onClick={() => setShowForm(true)}>Add Asset</button>
                                    <input
                                        className="pageSearchInput"
                                        type="search"
                                        placeholder="Search assets..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <select
                                        className="assOfficeSelect"
                                        value={selectedOffice}
                                        onChange={(e) => setSelectedOffice(e.target.value)}
                                    >
                                        {officeOptions.map((office) => (
                                            <option key={office} value={office}>
                                                {office}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="assGrid">
                            <div className="assCard">
                                <div className="assTableWrap">
                                    <table className="assTable">
                                        <thead>
                                            <tr className="tabRow">
                                                <th><button type="button" className="tableSortBtn" onClick={() => handleSort('name')}>Name</button></th>
                                                <th><button type="button" className="tableSortBtn" onClick={() => handleSort('assetId')}>Asset ID</button></th>
                                                <th><button type="button" className="tableSortBtn" onClick={() => handleSort('assignment')}>Current Assignment</button></th>
                                                <th><button type="button" className="tableSortBtn" onClick={() => handleSort('location')}>Location</button></th>
                                                <th><button type="button" className="tableSortBtn" onClick={() => handleSort('status')}>Status</button></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedAssets.map((asset) => (
                                                <tr
                                                    className="tabRow assClickableRow"
                                                    key={asset.id}
                                                    onClick={() => openAssetDetails(asset)}
                                                >
                                                    <td className="assNameCell">{asset.name}</td>
                                                    <td>{asset.assetId}</td>
                                                    <td>{asset.assignment}</td>
                                                    <td>{asset.location}</td>
                                                    <td>{asset.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <aside className="assrightCard">
                                <p className="assrightTitle">Current Asset Assignments ({selectedOffice})</p>
                                <ul className="assAssignList">
                                    {searchFilteredAssets.map((asset) => (
                                        <li key={`${asset.assetId}-assn`}>
                                            <span>{asset.name}</span>
                                            <span>{asset.assignment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        </section>

                        {isLoading && <p className="assHeading">Loading assets...</p>}
                        {!isLoading && fetchError && <p className="assHeading">{fetchError}</p>}

                        {showForm && (
                            <div className="entryModalBackdrop" onClick={() => setShowForm(false)}>
                                <div className="entryModalCard" role="dialog" aria-modal="true" aria-label="Add asset" onClick={(e) => e.stopPropagation()}>
                                    <div className="entryModalHead">
                                        <h2>Add Asset</h2>
                                        <button type="button" className="entryCloseBtn" onClick={() => setShowForm(false)} aria-label="Close add asset form">x</button>
                                    </div>
                                    <form className="entryForm" onSubmit={handleSubmit}>
                                        <label>
                                            Asset ID
                                            <input name="assetId" value={form.assetId} onChange={handleChange} required />
                                        </label>
                                        <label>
                                            Asset name
                                            <input name="name" value={form.name} onChange={handleChange} required />
                                        </label>
                                        <label>
                                            Assigned Staff ID (if assigned)
                                            <input
                                                name="assignedToStaffId"
                                                list="asset-staff-options"
                                                value={form.assignedToStaffId}
                                                onChange={handleChange}
                                                placeholder="e.g. 0312"
                                            />
                                            <datalist id="asset-staff-options">
                                                {staff.map((person) => (
                                                    <option key={person.id} value={person.staff_id}>
                                                        {person.name} ({person.staff_id})
                                                    </option>
                                                ))}
                                            </datalist>
                                        </label>
                                        <label>
                                            Location
                                            <input name="location" value={form.location} onChange={handleChange} required />
                                        </label>
                                        <label>
                                            Status
                                            <select name="status" value={form.status} onChange={handleChange}>
                                                <option>Good condition</option>
                                                <option>In Repair</option>
                                                <option>Lost</option>
                                                <option>Critical Alert</option>
                                                <option>Retired</option>
                                            </select>
                                        </label>
                                        <button type="submit" className="entrySubmitBtn" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save Asset'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {showAssignForm && (
                            <div className="entryModalBackdrop entryModalBackdropModal" onClick={() => setShowAssignForm(false)}>
                                <div className="entryModalCard assetDetailModalTop" role="dialog" aria-modal="true" aria-label="Assign asset" onClick={(e) => e.stopPropagation()}>
                                    <div className="entryModalHead">
                                        <h2>Assign Asset</h2>
                                        <button type="button" className="entryCloseBtn" onClick={() => setShowAssignForm(false)} aria-label="Close assign asset form">x</button>
                                    </div>
                                    <form className="entryForm" onSubmit={handleAssignSubmit}>
                                        <label>
                                            Asset ID
                                            <input
                                                name="assetId"
                                                list="assign-asset-options"
                                                value={assignForm.assetId}
                                                onChange={handleAssignChange}
                                                placeholder="Select or type an asset ID"
                                                required
                                            />
                                            <datalist id="assign-asset-options">
                                                {assets.map((asset) => (
                                                    <option key={asset.id} value={asset.assetId}>
                                                        {asset.name} ({asset.assetId})
                                                    </option>
                                                ))}
                                            </datalist>
                                        </label>
                                        <label>
                                            Assign to Staff
                                            <input
                                                name="staffId"
                                                list="assign-staff-options"
                                                value={assignForm.staffId}
                                                onChange={handleAssignChange}
                                                placeholder="Select staff ID"
                                                required
                                            />
                                            <datalist id="assign-staff-options">
                                                {staff.map((person) => (
                                                    <option key={person.id} value={person.staff_id}>
                                                        {person.name} ({person.staff_id})
                                                    </option>
                                                ))}
                                            </datalist>
                                        </label>
                                        <button type="submit" className="entrySubmitBtn" disabled={isAssigning}>
                                            {isAssigning ? 'Assigning...' : 'Assign Asset'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {showDetails && selectedAsset && (
                            <div className="entryModalBackdrop" onClick={() => setShowDetails(false)}>
                                <div
                                    className="entryModalCard assetDetailCard"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Asset details"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="entryModalHead">
                                        <h2>Asset Details</h2>
                                        <button type="button" className="entryCloseBtn" onClick={() => setShowDetails(false)} aria-label="Close asset details">x</button>
                                    </div>
                                    <div className="assetDetailBody">
                                        <section className="assetDetailSummary">
                                            <h3>{selectedAsset.name}</h3>
                                            <p><strong>Asset ID:</strong> {selectedAsset.assetId}</p>
                                            <p><strong>Status:</strong> {selectedAsset.status}</p>
                                            <p><strong>Location:</strong> {selectedAsset.location}</p>
                                            <p><strong>Assigned To:</strong> {selectedAsset.assignment}</p>
                                            <p><strong>Assigned Staff ID:</strong> {selectedAsset.assignedToStaffId || 'Unassigned'}</p>
                                            <p><strong>Date Added:</strong> {selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleString() : 'Unknown'}</p>
                                        </section>

                                        <section className="assetDetailSection">
                                            <h4>Current Assignment</h4>
                                            {assetAssignments.filter((item) => item.status !== 'Returned').length === 0 && (
                                                <p className="assetDetailEmpty">No active assignments.</p>
                                            )}
                                            {assetAssignments.filter((item) => item.status !== 'Returned').map((item) => (
                                                <div key={item.assignment_id} className="assetDetailRow">
                                                    <span>{item.assignment_id}</span>
                                                    <span>{item.assignee_name || 'Unassigned'} ({item.assignee_staff_id || 'N/A'})</span>
                                                    <span>Assigned: {item.date_assigned}</span>
                                                </div>
                                            ))}
                                        </section>

                                        <section className="assetDetailSection">
                                            <h4>Previous Assignments</h4>
                                            {assetAssignments.filter((item) => item.status === 'Returned').length === 0 && (
                                                <p className="assetDetailEmpty">No previous assignments.</p>
                                            )}
                                            {assetAssignments.filter((item) => item.status === 'Returned').map((item) => (
                                                <div key={item.assignment_id} className="assetDetailRow">
                                                    <span>{item.assignment_id}</span>
                                                    <span>{item.assignee_name || 'Unassigned'} ({item.assignee_staff_id || 'N/A'})</span>
                                                    <span>Returned: {item.return_date || 'N/A'}</span>
                                                </div>
                                            ))}
                                        </section>

                                        <section className="assetDetailSection">
                                            <h4>Repair History</h4>
                                            {isLoadingDetails && <p className="assetDetailEmpty">Loading history...</p>}
                                            {!isLoadingDetails && assetTickets.length === 0 && (
                                                <p className="assetDetailEmpty">No maintenance tickets found.</p>
                                            )}
                                            {!isLoadingDetails && assetTickets.map((ticket) => (
                                                <div key={ticket.ticket_id} className="assetDetailRow">
                                                    <span>{ticket.ticket_id}</span>
                                                    <span>{ticket.task}</span>
                                                    <span>{ticket.lane}</span>
                                                </div>
                                            ))}
                                        </section>

                                        <section className="assetDetailSection">
                                            <h4>Actions</h4>
                                            <div className="assetDetailActions">
                                                <button type="button" className="pageActionBtn" onClick={() => setShowAssignForm(true)}>
                                                    Assign Asset
                                                </button>
                                                <button type="button" className="pageActionBtn" onClick={() => setShowTicketForm(true)}>
                                                    Create Ticket
                                                </button>
                                                {selectedAsset.status !== 'Retired' && (
                                                    <button
                                                        type="button"
                                                        className="pageActionBtn assetRetireBtn"
                                                        onClick={handleRetireAsset}
                                                        disabled={isRetiring}
                                                    >
                                                        {isRetiring ? 'Retiring...' : 'Retire Asset'}
                                                    </button>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showTicketForm && (
                            <div className="entryModalBackdrop entryModalBackdropModal" onClick={() => setShowTicketForm(false)}>
                                <div className="entryModalCard assetDetailModalTop" role="dialog" aria-modal="true" aria-label="Create maintenance ticket" onClick={(e) => e.stopPropagation()}>
                                    <div className="entryModalHead">
                                        <h2>Create Ticket</h2>
                                        <button type="button" className="entryCloseBtn" onClick={() => setShowTicketForm(false)} aria-label="Close create ticket form">x</button>
                                    </div>
                                    <form className="entryForm" onSubmit={handleTicketSubmit}>
                                        <label>
                                            Lane
                                            <select name="lane" value={ticketForm.lane} onChange={handleTicketChange}>
                                                <option>Critical</option>
                                                <option>Planned</option>
                                                <option>Preventive</option>
                                            </select>
                                        </label>
                                        <label>
                                            Ticket ID (optional)
                                            <input name="ticket" value={ticketForm.ticket} onChange={handleTicketChange} placeholder="Leave empty to auto-generate" />
                                        </label>
                                        <label>
                                            Asset ID
                                            <input
                                                name="assetId"
                                                list="asset-ticket-options"
                                                value={ticketForm.assetId}
                                                onChange={handleTicketChange}
                                                placeholder="Select or type an asset ID"
                                                required
                                            />
                                            <datalist id="asset-ticket-options">
                                                {assets.map((asset) => (
                                                    <option key={asset.id} value={asset.assetId}>
                                                        {asset.name} ({asset.assetId})
                                                    </option>
                                                ))}
                                            </datalist>
                                        </label>
                                        <label>
                                            Task
                                            <input name="task" value={ticketForm.task} onChange={handleTicketChange} placeholder="e.g. Battery replacement" required />
                                        </label>
                                        <label>
                                            Owner
                                            <input name="owner" value={ticketForm.owner} onChange={handleTicketChange} placeholder="e.g. Support Team" required />
                                        </label>
                                        <label>
                                            ETA
                                            <input name="eta" type="datetime-local" value={ticketForm.eta} onChange={handleTicketChange} required />
                                        </label>
                                        <button type="submit" className="entrySubmitBtn" disabled={isCreatingTicket}>
                                            {isCreatingTicket ? 'Creating...' : 'Create Ticket'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
