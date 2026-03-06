import { useState } from 'react';

export default function Signup() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsSubmitting(false);
    }

    return (
        <main className="suPage">
            <div className="suCard">
                <p className="suHeading">Create your TrackPoint account</p>
                <p className="suSubtitle">Track all inventory items in one place</p>
                <form className="suForm" onSubmit={handleSubmit}>
                    <input type="text" placeholder="First name" required />
                    <input type="text" placeholder="Last name" required />
                    <input type="email" placeholder="Work email" required />
                    <input type="number" placeholder="Employee ID" required />
                    <input type="password" placeholder="Password" required />
                    <select required>
                        <option>Admin</option>
                        <option>IT Support Staff</option>
                    </select>
                    <button className="suButton" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </main>
    )
}
