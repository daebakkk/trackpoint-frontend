export default function Signup() {
    return (
        <main className="suPage">
            <div className="suCard">
                <p className="suHeading">Create your TrackPoint account</p>
                <p className="suSubtitle">Track all inventory items in one place</p>
                <form className="suForm">
                    <input type="text" placeholder="First name" required />
                    <input type="text" placeholder="Last name" required />
                    <input type="email" placeholder="Work email" required />
                    <input type="number" placeholder="Employee ID" required />
                    <input type="password" placeholder="Password" required />
                    <select required>
                        <option>Admin</option>
                        <option>IT Support Staff</option>
                    </select>
                    <button className="suButton" type="submit">Sign Up</button>
                </form>
            </div>
        </main>
    )
}
