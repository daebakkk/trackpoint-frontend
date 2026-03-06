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
        location: item.location,
        status: item.status,
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
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [selectedOffice, setSelectedOffice] = useState('All Offices');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        assetId: '',
        name: '',
        location: '',
        status: 'Good condition',
        assignedTo: '',
    });

    useEffect(() => {
        async function loadAssets() {
            setIsLoading(true);
            setFetchError('');
            try {
                const response = await fetch(`${API_BASE_URL}/api/assets/`);
                if (!response.ok) {
                    throw new Error(await getErrorMessage(response, 'Failed to load assets'));
                }
                const data = await response.json();
                setAssets(data.map(normalizeAsset));
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

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                asset_id: form.assetId,
                name: form.name,
                location: form.location,
                status: form.status,
                assigned_to: form.assignedTo ? Number(form.assignedTo) : null,
            };

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
                assignedTo: '',
            });
            setShowForm(false);
        } catch (error) {
            setFetchError(error.message || 'Unable to save asset.');
        } finally {
            setIsSubmitting(false);
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
                                                <tr className="tabRow" key={asset.id}>
                                                    <td>{asset.name}</td>
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
                                            Assigned staff DB ID (optional)
                                            <input name="assignedTo" type="number" min="1" value={form.assignedTo} onChange={handleChange} />
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
                                            </select>
                                        </label>
                                        <button type="submit" className="entrySubmitBtn" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save Asset'}
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
