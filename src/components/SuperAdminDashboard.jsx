import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE_URL = import.meta.env.DEV
    ? ''
    : import.meta.env.VITE_API_BASE_URL || ''

const SuperAdminDashboard = () => {
    const { token, logout } = useAuth()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [shelters, setShelters] = useState([])

    useEffect(() => {
        const loadShelters = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/shelters/pending`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Could not load shelters')
                }

                setShelters(data.data || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadShelters()
    }, [token])

    const approveShelter = async (shelterId) => {
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/shelters/${shelterId}/approve`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Could not approve shelter')
            }

            setShelters(shelters.filter((shelter) => shelter._id !== shelterId))
        } catch (err) {
            setError(err.message || 'Could not approve shelter')
        }
    }

    const rejectShelter = async (shelterId) => {
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/shelters/${shelterId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reviewNotes: 'Rejected by super admin.',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Could not reject shelter')
            }

            setShelters(shelters.filter((shelter) => shelter._id !== shelterId))
        } catch (err) {
            setError(err.message || 'Could not reject shelter')
        }
    }

    if (loading) {
        return <h1>Loading super admin dashboard...</h1>
    }

    return (
        <section style={{ padding: '24px' }}>
            <h1>Super Admin Dashboard</h1>

            <button onClick={logout}>Logout</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Pending Shelter Requests</h2>

            {shelters.length === 0 && <p>No pending shelters.</p>}

            {shelters.map((shelter) => (
                <div
                    key={shelter._id}
                    style={{
                        border: '1px solid #ccc',
                        padding: '16px',
                        marginBottom: '12px',
                    }}
                >
                    <h3>{shelter.name}</h3>
                    <p>Email: {shelter.contactEmail}</p>
                    <p>Phone: {shelter.contactPhone}</p>
                    <p>City: {shelter.city}, {shelter.state}</p>
                    <p>Status: {shelter.approvalStatus}</p>

                    <button onClick={() => approveShelter(shelter._id)}>
                        Approve
                    </button>

                    <button onClick={() => rejectShelter(shelter._id)}>
                        Reject
                    </button>
                </div>
            ))}
        </section>
    )
}

export default SuperAdminDashboard