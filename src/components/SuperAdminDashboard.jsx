import { useEffect, useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
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
        return (
            <section className="min-h-screen bg-[#f5f3f0] px-6 py-10 max-sm:px-4">
                <div className="w-[min(1500px,calc(100%-96px))] mx-auto max-sm:w-full">
                    <h1 className="m-0 font-serif text-[clamp(34px,5vw,72px)] text-[#0F2A44]">
                        Loading super admin dashboard...
                    </h1>
                </div>
            </section>
        )
    }

    return (
        <section className="min-h-screen bg-[#f5f3f0] pb-20">
            <header className="bg-[#f2f2f2] pt-10 pb-7 max-sm:pt-8">
                <div className="w-[min(1500px,calc(100%-96px))] mx-auto max-sm:w-[calc(100%-32px)]">
                    <div className="flex flex-wrap items-start justify-between gap-5 max-sm:flex-col">
                        <div>
                            <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
                                Super admin
                            </p>
                            <h1 className="animate-fade-up m-0 mt-3 font-serif text-[clamp(38px,5vw,86px)] leading-[1] tracking-[-0.02em] text-[#0F2A44]">
                                Shelter Reviews
                            </h1>
                            <p className="animate-fade-up-delay-1 mt-[18px] max-w-[780px] text-[#67686d] text-[20px] leading-[1.55] max-sm:text-[17px]">
                                Review pending shelter registrations and approve trusted partners for Perfect Paw.
                            </p>
                        </div>

                        <div className="flex items-start gap-4 max-sm:w-full max-sm:flex-col">
                            <div className="w-[340px] max-md:w-[260px] max-sm:mx-auto max-sm:w-[min(320px,82vw)]" aria-hidden="true">
                                <DotLottieReact
                                    className="h-auto w-full"
                                    src="https://lottie.host/adf9b492-5df8-4620-8d77-0d6130e8748d/HchvF1OlTo.lottie"
                                    loop
                                    autoplay
                                />
                            </div>

                            <button
                                className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer max-sm:w-full"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-[min(1500px,calc(100%-96px))] mx-auto pt-7 max-sm:w-[calc(100%-32px)]">
                {error && (
                    <p className="mb-5 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
                        {error}
                    </p>
                )}

                <section>
                    <div className="flex flex-wrap items-end justify-between gap-3 max-sm:flex-col max-sm:items-start">
                        <div>
                            <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
                                Pending requests
                            </p>
                            <h2 className="mt-3 mb-0 font-serif text-[clamp(34px,3.2vw,52px)] text-[#0F2A44]">
                                Shelter Applications
                            </h2>
                        </div>
                        <p className="m-0 text-[#67686d] text-sm">
                            {shelters.length} pending
                        </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-4">
                        {shelters.length === 0 && (
                            <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
                                No pending shelters.
                            </p>
                        )}

                        {shelters.map((shelter) => (
                            <article
                                key={shelter._id}
                                className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 shadow-[0_2px_12px_rgba(15,42,68,0.07)] max-sm:p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 max-sm:flex-col">
                                    <div>
                                        <h3 className="m-0 font-serif text-[32px] text-[#0F2A44] max-sm:text-[26px]">{shelter.name}</h3>
                                        <p className="mt-1 mb-0 text-sm text-[#67686d]">
                                            {shelter.city || 'City not provided'}{shelter.state ? `, ${shelter.state}` : ''}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-[#fff7eb] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#9a5b00]">
                                        {shelter.approvalStatus}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#55585f] max-sm:flex-col max-sm:gap-3">
                                    <p className="m-0 flex-[1_1_240px] break-words max-sm:flex-auto">
                                        <strong className="text-[#0F2A44]">Admin:</strong>{' '}
                                        {shelter.adminUserId?.fullName || 'Not provided'}
                                        {shelter.adminUserId?.email ? ` - ${shelter.adminUserId.email}` : ''}
                                    </p>
                                    <p className="m-0 flex-[1_1_240px] break-words max-sm:flex-auto">
                                        <strong className="text-[#0F2A44]">Contact:</strong>{' '}
                                        {shelter.contactEmail || 'No email'}{shelter.contactPhone ? ` - ${shelter.contactPhone}` : ''}
                                    </p>
                                    <p className="m-0 flex-[1_1_240px] break-words max-sm:flex-auto">
                                        <strong className="text-[#0F2A44]">License:</strong>{' '}
                                        {shelter.licenseNumber || 'Not provided'}
                                    </p>
                                </div>

                                {shelter.missionStatement && (
                                    <p className="mt-4 mb-0 rounded-[14px] bg-[#f6f6f7] p-3 text-sm leading-6 text-[#55585f]">
                                        {shelter.missionStatement}
                                    </p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-3 max-sm:flex-col">
                                    <button
                                        className="rounded-lg border-2 border-transparent bg-[#ef767a] px-[18px] py-[10px] text-base font-semibold text-[#f6f6f6] cursor-pointer"
                                        onClick={() => approveShelter(shelter._id)}
                                    >
                                        Approve
                                    </button>

                                    <button
                                        className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer"
                                        onClick={() => rejectShelter(shelter._id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </section>
    )
}

export default SuperAdminDashboard