import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function normalizeStaff(item) {
  return {
    pk: item.id,
    id: item.staff_id,
    name: item.name,
    office: item.office,
    title: item.job_title,
    assignment: 'Unassigned',
  };
}

export default function Staff() {
  const [staffDirectory, setStaffDirectory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('All Offices');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    staffId: '',
    name: '',
    office: '',
    title: '',
  });

  useEffect(() => {
    async function loadStaff() {
      setIsLoading(true);
      setFetchError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/staff/`);
        if (!response.ok) throw new Error('Failed to load staff.');
        const data = await response.json();
        setStaffDirectory(data.map(normalizeStaff));
      } catch (error) {
        setFetchError(error.message || 'Unable to fetch staff.');
      } finally {
        setIsLoading(false);
      }
    }

    loadStaff();
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
        staff_id: form.staffId,
        name: form.name,
        office: form.office,
        job_title: form.title,
      };
      const response = await fetch(`${API_BASE_URL}/api/staff/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save staff.');

      const created = await response.json();
      setStaffDirectory((prev) => [normalizeStaff(created), ...prev]);
      setForm({ staffId: '', name: '', office: '', title: '' });
      setShowForm(false);
    } catch (error) {
      setFetchError(error.message || 'Unable to save staff.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const officeOptions = ['All Offices', ...new Set(staffDirectory.map((staff) => staff.office))];
  const filteredStaff =
    selectedOffice === 'All Offices'
      ? staffDirectory
      : staffDirectory.filter((staff) => staff.office === selectedOffice);
  const searchFilteredStaff = filteredStaff.filter((staff) => {
    const haystack = `${staff.id} ${staff.name} ${staff.office} ${staff.title} ${staff.assignment}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });
  const sortedStaff = [...searchFilteredStaff].sort((a, b) => {
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

      <main className="stfPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Staff Directory</h1>
              <p>Staff records with assigned assets and device IDs.</p>
            </section>
            <PageSidebar context="Staff" />
          </div>
          <div className="appPageMain">
            <section className="stfTop">
              <div className="stfTopRow">
                <div className="assTopActions">
                  <button type="button" className="pageActionBtn" onClick={() => setShowForm(true)}>Add Staff</button>
                  <input
                    className="pageSearchInput"
                    type="search"
                    placeholder="Search staff..."
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

            {isLoading && <p className="stfHeading">Loading staff...</p>}
            {!isLoading && fetchError && <p className="stfHeading">{fetchError}</p>}

            <section className="stfCard">
              <div className="stfTableWrap">
                <table className="stfTable">
                  <thead>
                    <tr>
                      <th><button type="button" className="tableSortBtn" onClick={() => handleSort('id')}>Staff ID</button></th>
                      <th><button type="button" className="tableSortBtn" onClick={() => handleSort('name')}>Name</button></th>
                      <th><button type="button" className="tableSortBtn" onClick={() => handleSort('office')}>Office</button></th>
                      <th><button type="button" className="tableSortBtn" onClick={() => handleSort('title')}>Job Title</button></th>
                      <th><button type="button" className="tableSortBtn" onClick={() => handleSort('assignment')}>Assignment</button></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStaff.map((staff) => (
                      <tr key={staff.id}>
                        <td>{staff.id}</td>
                        <td>{staff.name}</td>
                        <td>{staff.office}</td>
                        <td>{staff.title}</td>
                        <td>{staff.assignment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {showForm && (
              <div className="entryModalBackdrop" onClick={() => setShowForm(false)}>
                <div className="entryModalCard" role="dialog" aria-modal="true" aria-label="Add staff" onClick={(e) => e.stopPropagation()}>
                  <div className="entryModalHead">
                    <h2>Add Staff</h2>
                    <button type="button" className="entryCloseBtn" onClick={() => setShowForm(false)} aria-label="Close add staff form">x</button>
                  </div>
                  <form className="entryForm" onSubmit={handleSubmit}>
                    <label>
                      Staff ID
                      <input name="staffId" value={form.staffId} onChange={handleChange} required />
                    </label>
                    <label>
                      Full name
                      <input name="name" value={form.name} onChange={handleChange} required />
                    </label>
                    <label>
                      Office
                      <input name="office" value={form.office} onChange={handleChange} required />
                    </label>
                    <label>
                      Job title
                      <input name="title" value={form.title} onChange={handleChange} required />
                    </label>
                    <button type="submit" className="entrySubmitBtn" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Staff'}
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
