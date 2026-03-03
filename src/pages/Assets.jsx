import Navbar from '../components/Navbar';
import { useState } from 'react';
import PageSidebar from '../components/PageSidebar';

const initialAssets = [
    { name: 'ASUS 2022', id: '0567', assignment: 'Abisola Adegboruwa', location: 'Fifth Lab', status: 'Good condition' },
    { name: 'DELL 2024', id: '0182', assignment: 'Casey Luo', location: 'IT Support Office', status: 'In Repair' },
    { name: 'HP i7', id: '0769', assignment: 'Gbemi Oduselu', location: 'Training Office', status: 'Good condition' },
    { name: 'MacBook Pro', id: '0243', assignment: 'Jada Ricottski', location: 'HR', status: 'Lost' },
    { name: 'Lenovo ThinkPad T14', id: '0311', assignment: 'Maya Johnson', location: 'Finance Wing', status: 'Good condition' },
    { name: 'Dell OptiPlex 7090', id: '0648', assignment: 'Noah Patel', location: 'Accounts Office', status: 'Good condition' },
    { name: 'iPad Pro 11', id: '0914', assignment: 'Tobi Alade', location: 'Executive Boardroom', status: 'In Use' },
    { name: 'HP EliteBook 850', id: '0427', assignment: 'Ifeoma Chukwu', location: 'Operations Desk', status: 'In Repair' },
    { name: 'Surface Laptop 5', id: '0589', assignment: 'David Kim', location: 'Remote Staff Pool', status: 'Good condition' },
    { name: 'Mac Mini M2', id: '0732', assignment: 'Ruth Mensah', location: 'Design Studio', status: 'Good condition' },
    { name: 'Cisco Catalyst 9200', id: '0821', assignment: 'Network Team', location: 'Server Room B', status: 'Critical Alert' },
    { name: 'Epson Workforce Printer', id: '0675', assignment: 'Admin Unit', location: 'Front Office', status: 'Low Toner' },
];
export default function Assets() {
    const [assets, setAssets] = useState(initialAssets);
    const [selectedOffice, setSelectedOffice] = useState('All Offices');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        assignment: '',
        location: '',
        status: 'Good condition',
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        const nextId = String(1000 + assets.length + 1);
        setAssets((prev) => [{ ...form, id: nextId }, ...prev]);
        setForm({
            name: '',
            assignment: '',
            location: '',
            status: 'Good condition',
        });
        setShowForm(false);
    }

    const officeOptions = ['All Offices', ...new Set(assets.map((asset) => asset.location))];
    const filteredAssets =
        selectedOffice === 'All Offices'
            ? assets
            : assets.filter((asset) => asset.location === selectedOffice);

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
                                <table className="assTable">
                                    <thead>
                                        <tr className="tabRow">
                                            <th>Name</th>
                                            <th>Asset ID</th>
                                            <th>Current Assignment</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssets.map((asset) => (
                                            <tr className="tabRow" key={asset.id}>
                                                <td>{asset.name}</td>
                                                <td>{asset.id}</td>
                                                <td>{asset.assignment}</td>
                                                <td>{asset.location}</td>
                                                <td>{asset.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <aside className="assrightCard">
                                <p className="assrightTitle">Current Asset Assignments ({selectedOffice})</p>
                                <ul className="assAssignList">
                                    {filteredAssets.map((asset) => (
                                        <li key={`${asset.id}-assn`}>
                                            <span>{asset.name}</span>
                                            <span>{asset.assignment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        </section>

                        {showForm && (
                            <div className="entryModalBackdrop" onClick={() => setShowForm(false)}>
                                <div className="entryModalCard" role="dialog" aria-modal="true" aria-label="Add asset" onClick={(e) => e.stopPropagation()}>
                                    <div className="entryModalHead">
                                        <h2>Add Asset</h2>
                                        <button type="button" className="entryCloseBtn" onClick={() => setShowForm(false)} aria-label="Close add asset form">x</button>
                                    </div>
                                    <form className="entryForm" onSubmit={handleSubmit}>
                                        <label>
                                            Asset name
                                            <input name="name" value={form.name} onChange={handleChange} required />
                                        </label>
                                        <label>
                                            Current assignment (skip if none)
                                            <input name="assignment" value={form.assignment} onChange={handleChange} />
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
                                        <button type="submit" className="entrySubmitBtn">Save Asset</button>
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
