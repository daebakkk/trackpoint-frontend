import Navbar from '../components/Navbar';

const staffDirectory = [
  { id: 'ST-001', name: 'Abisola Adegboruwa', office: 'HQ - Floor 2', title: 'IT Admin', assignment: 'ASUS 2022 (0567)' },
  { id: 'ST-002', name: 'Casey Luo', office: 'IT Support Office', title: 'Support Engineer', assignment: 'DELL 2024 (0182)' },
  { id: 'ST-003', name: 'Gbemi Oduselu', office: 'Training Office', title: 'Systems Trainer', assignment: 'HP i7 (0769)' },
  { id: 'ST-004', name: 'Jada Ricottski', office: 'Human Resources', title: 'HR Operations Lead', assignment: 'MacBook Pro (0243)' },
  { id: 'ST-005', name: 'Maya Johnson', office: 'Finance Wing', title: 'Compliance Analyst', assignment: 'Lenovo ThinkPad T14 (0311)' },
  { id: 'ST-006', name: 'Noah Patel', office: 'Accounts Office', title: 'IT Technician', assignment: 'Dell OptiPlex 7090 (0648)' },
  { id: 'ST-007', name: 'Ifeoma Chukwu', office: 'Operations Desk', title: 'Operations Manager', assignment: 'HP EliteBook 850 (0427)' },
  { id: 'ST-008', name: 'David Kim', office: 'Remote Staff Pool', title: 'Infrastructure Engineer', assignment: 'Surface Laptop 5 (0589)' },
];

export default function Staff() {
  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="stfPage">
        <section className="stfTop">
          <div className="stfTopRow">
            <h1 className="stfTitle">Staff Directory</h1>
            <button type="button" className="pageActionBtn">Add Staff</button>
          </div>
          <p className="stfHeading">Staff records with assigned assets and device IDs.</p>
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
              {staffDirectory.map((staff) => (
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
      </main>
    </div>
  );
}
