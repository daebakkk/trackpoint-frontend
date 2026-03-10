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
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    async function loadLocations() {
      setIsLoading(true);
      setFetchError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets/`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || response.statusText);
        }
        const assets = await response.json();
        const mapped = assets.map((asset) => {
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
          </div>
        </div>
      </main>
    </div>
  );
}
