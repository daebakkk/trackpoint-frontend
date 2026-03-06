import Navbar from '../components/Navbar';
import { useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const assetLocations = [
  { asset: 'ASUS 2022 (0567)', building: 'Fifth Lab', floor: 'Floor 2', room: 'Intern Space', holder: 'Abisola Adegboruwa', status: 'Healthy' },
  { asset: 'DELL 2024 (0182)', building: 'Main Building', floor: 'Floor 1', room: 'IT Support Office', holder: 'Casey Luo', status: 'Attention' },
  { asset: 'HP i7 (0769)', building: 'Main Building', floor: 'Floor 3', room: 'Training Room', holder: 'Gbemi Oduselu', status: 'Healthy' },
  { asset: 'MacBook Pro (0243)', building: 'Main Building', floor: 'Floor 2', room: 'HR Office', holder: 'Jada Ricottski', status: 'Review' },
  { asset: 'Lenovo ThinkPad T14 (0311)', building: 'Main Building', floor: 'Floor 4', room: 'Finance Wing', holder: 'Maya Johnson', status: 'Healthy' },
  { asset: 'Cisco Catalyst 9200 (0821)', building: 'Data Center', floor: 'Ground', room: 'Server Room B', holder: 'Network Team', status: 'Attention' },
  { asset: 'Epson Workforce Printer (0675)', building: 'Main Building', floor: 'Floor 1', room: 'Front Office', holder: 'Admin Unit', status: 'Healthy' },
];

export default function Location() {
  const [selectedFilter, setSelectedFilter] = useState('All Locations');
  const [searchTerm, setSearchTerm] = useState('');
  const roomOptions = [...new Set(assetLocations.filter((row) => row.building !== 'Fifth Lab').map((row) => row.room))];
  const locationOptions = ['All Locations', 'Fifth Lab', ...roomOptions];
  const filteredRows =
    selectedFilter === 'All Locations'
      ? assetLocations
      : selectedFilter === 'Fifth Lab'
        ? assetLocations.filter((row) => row.building === 'Fifth Lab')
        : assetLocations.filter((row) => row.room === selectedFilter);
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
                      <tr key={row.asset}>
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
          </div>
        </div>
      </main>
    </div>
  );
}
