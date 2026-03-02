import Navbar from '../components/Navbar';

const assets = [
    { name: 'ASUS 2022', id: '0567', assignment: 'Abisola Adegboruwa', location: 'Fifth Lab Floor 2', status: 'Good condition' },
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
    return (
        <div>
            <header>
                <Navbar />
            </header>
            <main className="assPage">
                <section className="assTop">
                    <div className="assTopRow">
                        <h1 className="assTitle">Assets</h1>
                        <button type="button" className="pageActionBtn">Add Asset</button>
                    </div>
                    <p className="assHeading">Track all office assets reliably</p>
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
                                {assets.map((asset) => (
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
                        <p className="assrightTitle">Current Asset Assignments</p>
                        <ul className="assAssignList">
                            {assets.map((asset) => (
                                <li key={`${asset.id}-assn`}>
                                    <span>{asset.name}</span>
                                    <span>{asset.assignment}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </section>
            </main>
        </div>
    )
}
