import Navbar from '../components/Navbar';
import { useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const initialStaffDirectory = [
  { id: '0941', name: 'Abisola Adegboruwa', office: 'Fifth Lab', title: 'Intern', assignment: 'ASUS 2022 (0567)' },
  { id: '0122', name: 'Casey Luo', office: 'IT Support Office', title: 'Support Engineer', assignment: 'DELL 2024 (0182)' },
  { id: '1053', name: 'Gbemi Oduselu', office: 'Training Office', title: 'Systems Trainer', assignment: 'HP i7 (0769)' },
  { id: '0684', name: 'Jada Ricottski', office: 'Human Resources', title: 'HR Assistant', assignment: 'MacBook Pro (0243)' },
  { id: '0715', name: 'Maya Johnson', office: 'Finance Wing', title: 'Compliance Analyst', assignment: 'Lenovo ThinkPad T14 (0311)' },
  { id: '0246', name: 'Noah Patel', office: 'Accounts Office', title: 'IT Technician', assignment: 'Dell OptiPlex 7090 (0648)' },
  { id: '0137', name: 'Ifeoma Chukwu', office: 'Operations Desk', title: 'Operations Manager', assignment: 'HP EliteBook 850 (0427)' },
  { id: '0098', name: 'David Kim', office: 'Remote Staff Pool', title: 'Infrastructure Engineer', assignment: 'Surface Laptop 5 (0589)' },
];

export default function Staff() {
  const [staffDirectory, setStaffDirectory] = useState(initialStaffDirectory);
  const [selectedOffice, setSelectedOffice] = useState('All Offices');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    office: '',
    title: '',
    assignment: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextId = `ST-${String(staffDirectory.length + 1).padStart(3, '0')}`;
    setStaffDirectory((prev) => [{ id: nextId, ...form }, ...prev]);
    setForm({ name: '', office: '', title: '', assignment: '' });
    setShowForm(false);
  }

  const officeOptions = ['All Offices', ...new Set(staffDirectory.map((staff) => staff.office))];
  const filteredStaff =
    selectedOffice === 'All Offices'
      ? staffDirectory
      : staffDirectory.filter((staff) => staff.office === selectedOffice);

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

            <section className="stfCard">
              <table className="stfTable">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Office</th>
                    <th>Job Title</th>
                    <th>Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
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
                    <label>
                      Assigned asset
                      <input name="assignment" value={form.assignment} onChange={handleChange} placeholder="e.g. ASUS 2022 (0567)" />
                    </label>
                    <button type="submit" className="entrySubmitBtn">Save Staff</button>
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
