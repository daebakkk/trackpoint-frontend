import Navbar from '../components/Navbar';
import { useEffect, useMemo, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function getStatusLabel(status) {
  const value = (status || '').toLowerCase();
  if (value.includes('good') || value.includes('working')) return 'Healthy';
  if (value.includes('repair') || value.includes('critical')) return 'Attention';
  if (value.includes('lost')) return 'Review';
  return 'Healthy';
}

function parseLocation(locationValue) {
  const raw = (locationValue || '').trim();
  if (!raw) {
    return { building: 'Unspecified', floor: '—', room: 'Unassigned Area' };
  }
  const floorMatch = raw.match(/Floor\s*\d+/i);
  const floor = floorMatch ? floorMatch[0].replace(/\s+/g, ' ') : /ground/i.test(raw) ? 'Ground' : '—';

  if (/fifth lab/i.test(raw)) {
    return {
      building: 'Fifth Lab',
      floor,
      room: raw.replace(/fifth lab/ig, '').replace(/[-–,]/g, '').trim() || 'Fifth Lab',
    };
  }

  if (/main building/i.test(raw)) {
    return {
      building: 'Main Building',
      floor,
      room: raw.replace(/main building/ig, '').replace(/[-–,]/g, '').trim() || 'Main Building',
    };
  }

  if (/data center/i.test(raw)) {
    return {
      building: 'Data Center',
      floor,
      room: raw.replace(/data center/ig, '').replace(/[-–,]/g, '').trim() || 'Data Center',
    };
  }

  return { building: 'Office', floor, room: raw };
}

export default function Location() {
  const [selectedFilter, setSelectedFilter] = useState('All Locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [assets, setAssets] = useState([]);
  const [locationEvents, setLocationEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    assetId: '',
    location: '',
    note: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.assetId.trim() || !form.location.trim()) {
      return;
    }
    setIsSubmitting(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/location-events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          asset_id: form.assetId.trim(),
          location: form.location.trim(),
          note: form.note.trim(),
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }
      setForm({ assetId: '', location: '', note: '' });
      setShowForm(false);
      await loadLocations();
    } catch (error) {
      setFetchError(error.message || 'Unable to save location update.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadLocations() {
    setIsLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('access_token');
      const [assetsResponse, eventsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/assets/`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        }),
        fetch(`${API_BASE_URL}/api/location-events/`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        }),
      ]);
      if (!assetsResponse.ok) {
        const text = await assetsResponse.text();
        throw new Error(text || assetsResponse.statusText);
      }
      const assetsData = await assetsResponse.json();
      const eventsData = eventsResponse.ok ? await eventsResponse.json() : [];
      setAssets(assetsData);
      setLocationEvents(eventsData);
      const mapped = assetsData.map((asset) => {
        const locationParts = parseLocation(asset.location);
        return {
          id: asset.id,
          asset: `${asset.name} (${asset.asset_id})`,
          building: locationParts.building,
          floor: locationParts.floor,
          room: locationParts.room || asset.location,
          holder: asset.assigned_to_name || 'Unassigned',
          status: getStatusLabel(asset.status),
        };
      });
      setRows(mapped);
    } catch (error) {
      setFetchError(error.message || 'Unable to load locations.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  const roomOptions = useMemo(
    () => [...new Set(rows.filter((row) => row.building !== 'Fifth Lab').map((row) => row.room))],
    [rows],
  );
  const locationOptions = ['All Locations', 'Fifth Lab', ...roomOptions];
  const filteredRows =
    selectedFilter === 'All Locations'
      ? rows
      : selectedFilter === 'Fifth Lab'
        ? rows.filter((row) => row.building === 'Fifth Lab')
        : rows.filter((row) => row.room === selectedFilter);
  const searchFilteredRows = filteredRows.filter((row) => {
    const haystack = `${row.asset} ${row.building} ${row.floor} ${row.room} ${row.holder} ${row.status}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="locPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Asset Location Map</h1>
              <p>In-office location for each asset by building, floor, and room.</p>
            </section>
            <PageSidebar context="Location" />
          </div>
          <div className="appPageMain">
            <section className="locTop">
              <div className="assTopRow">
                <button type="button" className="pageActionBtn" onClick={() => setShowForm(true)}>
                  Update Location
                </button>
                <input
                  className="pageSearchInput"
                  type="search"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="assOfficeSelect"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  {locationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="locCard">
              <div className="locTableWrap">
                <table className="locTable">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Building</th>
                      <th>Floor</th>
                      <th>Room</th>
                      <th>Current Holder</th>
                      <th>Location Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchFilteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.asset}</td>
                        <td>{row.building}</td>
                        <td>{row.floor}</td>
                        <td>{row.room}</td>
                        <td>{row.holder}</td>
                        <td><span className={`locBadge locBadge${row.status}`}>{row.status}</span></td>
                      </tr>
                    ))}
                    {searchFilteredRows.length === 0 && (
                      <tr>
                        <td className="asnEmptyRow" colSpan={6}>No location rows match this search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {isLoading && <p className="assHeading">Loading locations...</p>}
            {!isLoading && fetchError && <p className="assHeading">{fetchError}</p>}

            <section className="locHistory">
              <div className="locHistoryHead">
                <h3>Location History</h3>
                <span>Recent check-ins</span>
              </div>
              <div className="locHistoryList">
                {locationEvents.length === 0 && <p className="locHistoryEmpty">No location events recorded yet.</p>}
                {locationEvents.slice(0, 8).map((event) => (
                  <div key={event.id} className="locHistoryRow">
                    <div>
                      <strong>{event.asset_name} ({event.asset_code})</strong>
                      <p>{event.location}</p>
                    </div>
                    <div>
                      <span>{event.note || 'No note'}</span>
                      <span className="locHistoryMeta">{new Date(event.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="entryModalBackdrop" onClick={() => setShowForm(false)}>
          <div className="entryModalCard" role="dialog" aria-modal="true" aria-label="Update location" onClick={(e) => e.stopPropagation()}>
            <div className="entryModalHead">
              <h2>Update Location</h2>
              <button type="button" className="entryCloseBtn" onClick={() => setShowForm(false)} aria-label="Close location form">x</button>
            </div>
            <form className="entryForm" onSubmit={handleSubmit}>
              <label>
                Asset ID
                <input
                  name="assetId"
                  list="location-asset-options"
                  value={form.assetId}
                  onChange={handleChange}
                  placeholder="Select or type asset ID"
                  required
                />
                <datalist id="location-asset-options">
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.asset_id}>
                      {asset.name} ({asset.asset_id})
                    </option>
                  ))}
                </datalist>
              </label>
              <label>
                New location
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Fifth Lab - Floor 2"
                  required
                />
              </label>
              <label>
                Note (optional)
                <input
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="e.g. Moved after repair"
                />
              </label>
              <button type="submit" className="entrySubmitBtn" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
