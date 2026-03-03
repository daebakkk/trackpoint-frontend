import Navbar from '../components/Navbar';
import PageSidebar from '../components/PageSidebar';

const maintenanceLanes = {
  Critical: [
    { ticket: 'M-2201', asset: 'DELL 2024 (0182)', task: 'Motherboard diagnostics', owner: 'Casey Luo', eta: 'Today 16:30' },
    { ticket: 'M-2204', asset: 'Cisco Catalyst 9200 (0821)', task: 'Port stability testing', owner: 'Network Team', eta: 'Today 18:00' },
  ],
  Planned: [
    { ticket: 'M-2202', asset: 'HP EliteBook 850 (0427)', task: 'Battery replacement', owner: 'Noah Patel', eta: 'Tomorrow 11:00' },
    { ticket: 'M-2205', asset: 'MacBook Pro (0243)', task: 'Display assembly', owner: 'David Kim', eta: 'Mar 04 13:00' },
  ],
  Preventive: [
    { ticket: 'PM-3110', asset: 'Server Room B UPS', task: 'Quarterly battery check', owner: 'Ifeoma Chukwu', eta: 'Mar 05 10:00' },
    { ticket: 'PM-3111', asset: 'Floor 2 Rack', task: 'Cable integrity audit', owner: 'Network Team', eta: 'Mar 06 09:00' },
  ],
};

const machineHealth = [
  { system: 'Endpoint Fleet', uptime: '99.2%', trend: '+0.4%' },
  { system: 'Network Core', uptime: '98.6%', trend: '-0.2%' },
  { system: 'Print Services', uptime: '97.9%', trend: '+0.1%' },
];

const maintenanceTimeline = [
  { time: '08:15', event: 'Auto-check completed for 42 devices', level: 'Info' },
  { time: '09:40', event: 'Critical alert raised for Switch Rack 2', level: 'Critical' },
  { time: '10:05', event: 'Battery replacement ticket assigned', level: 'Action' },
  { time: '11:30', event: 'Maintenance window approved by ops lead', level: 'Info' },
];

export default function Maintenance() {
  return (
    <div>
      <header>
        <Navbar />
      </header>

      <main className="mntOpsPage">
        <div className="appPageLayout">
          <div className="appPageLeftRail">
            <section className="appPageLeftIntro">
              <h1>Preventive + Corrective Operations</h1>
              <p>A live operations board for maintenance routing, machine health, and execution timeline.</p>
            </section>
            <PageSidebar context="Maintenance" />
          </div>
          <div className="appPageMain">
            <section className="mntOpsHero">
              <div>
                <p className="mntOpsEyebrow">Maintenance Control Board</p>
              </div>
              <button type="button" className="pageActionBtn">Create Ticket</button>
            </section>

            <section className="mntOpsHealthGrid">
              {machineHealth.map((item) => (
                <article className="mntOpsHealthCard" key={item.system}>
                  <p>{item.system}</p>
                  <h3>{item.uptime}</h3>
                  <span>{item.trend} this week</span>
                </article>
              ))}
            </section>

            <section className="mntOpsMainGrid">
              <article className="mntOpsLaneBoard">
                <div className="mntOpsPanelHead">
                  <h2>Workstream Lanes</h2>
                  <span>Live Queue</span>
                </div>
                <div className="mntOpsLanes">
                  {Object.entries(maintenanceLanes).map(([lane, cards]) => (
                    <section className="mntOpsLane" key={lane}>
                      <h3>{lane}</h3>
                      <div className="mntOpsCards">
                        {cards.map((card) => (
                          <article className="mntOpsCard" key={card.ticket}>
                            <div className="mntOpsCardTop">
                              <p>{card.ticket}</p>
                              <span>{card.eta}</span>
                            </div>
                            <h4>{card.asset}</h4>
                            <p className="mntOpsTask">{card.task}</p>
                            <p className="mntOpsOwner">Owner: {card.owner}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </article>

              <aside className="mntOpsTimeline">
                <div className="mntOpsPanelHead">
                  <h2>Execution Timeline</h2>
                </div>
                <ul>
                  {maintenanceTimeline.map((entry) => (
                    <li key={`${entry.time}-${entry.event}`}>
                      <div>
                        <strong>{entry.time}</strong>
                        <p>{entry.event}</p>
                      </div>
                      <span className={`mntOpsTag mntOpsTag${entry.level}`}>{entry.level}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
