import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Signup() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        employeeId: '',
        password: '',
        role: 'Admin',
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try {
            const payload = {
                username: form.employeeId.trim(),
                email: form.email.trim(),
                password: form.password,
                first_name: form.firstName.trim(),
                last_name: form.lastName.trim(),
            };

            const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || JSON.stringify(data) || 'Signup failed.');
            }

            setSuccess('Account created successfully. You can log in now.');
            setTimeout(() => navigate('/'), 800);
        } catch (err) {
            setError(err.message || 'Unable to sign up.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="suPage">
            <div className="suCard">
                <p className="suHeading">Create your TrackPoint account</p>
                <p className="suSubtitle">Track all inventory items in one place</p>
                <form className="suForm" onSubmit={handleSubmit}>
                    <input name="firstName" type="text" placeholder="First name" value={form.firstName} onChange={handleChange} required />
                    <input name="lastName" type="text" placeholder="Last name" value={form.lastName} onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Work email" value={form.email} onChange={handleChange} required />
                    <input name="employeeId" type="text" placeholder="Employee ID (for login)" value={form.employeeId} onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                    <select name="role" value={form.role} onChange={handleChange} required>
                        <option>Admin</option>
                        <option>IT Support Staff</option>
                    </select>
                    {error && <p className="formError">{error}</p>}
                    {success && <p className="formSuccess">{success}</p>}
                    <button className="suButton" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </main>
    )
}
