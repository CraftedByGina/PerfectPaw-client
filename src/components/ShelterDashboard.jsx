import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import {
  LayoutDashboard,
  PawPrint,
  Mail,
  ClipboardList,
  LogOut,
  Bell,
  Plus,
  Eye,
  Heart,
  HouseHeartIcon,
  Syringe,
} from 'lucide-react'


const readApiError = async (response) => {
  try {
    const body = await response.json()
    return body?.message || `Request failed (${response.status})`
  } catch (error) {
    console.error(error)
    return `Request failed (${response.status})`
  }
}

const ShelterDashboard = () => {
  const navigate = useNavigate()
  const { token, user, shelterId, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applications, setApplications] = useState([])
  const [pets, setPets] = useState([])
  const [processingApplicationId, setProcessingApplicationId] = useState('')
  const [shelter, setShelter] = useState(null)
  const [activeNavItem, setActiveNavItem] = useState('dashboard')





  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError('Please log in as a shelter admin.')
        setLoading(false)
        return
      }

      try {
        setError('')

        const shelterRes = await fetch('/api/shelters/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!shelterRes.ok) {
          throw new Error(await readApiError(shelterRes))
        }

        const shelterJson = await shelterRes.json()
        const myShelter = shelterJson.data;

        setShelter(myShelter);

        if (myShelter.approvalStatus !== 'approved') {
          setLoading(false)
          return;
        }

        const appRes = await fetch('/api/applications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!appRes.ok) {
          throw new Error(await readApiError(appRes))
        }

        const appJson = await appRes.json()
        setApplications(appJson.data || [])

        const statuses = ['available', 'pending', 'adopted']
        let allPets = []

        for (const status of statuses) {
          const url = `/api/pets?status=${status}&shelterId=${myShelter._id}`

          const petRes = await fetch(url)

          if (!petRes.ok) {
            throw new Error(await readApiError(petRes))
          }

          const petJson = await petRes.json()
          allPets.push(...(petJson.data || []))
        }

        setPets(allPets)
      } catch (err) {
        setError(err.message || 'Could not load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, shelterId])

  const totalApplications = applications.length
  const approvedApplications = applications.filter((application) => application.status === 'approved').length
  const availablePets = pets.filter((pet) => pet.status === 'available').length
  const totalPets = pets.length
  const newApplications = applications.filter((application) => (
    application.status === 'submitted' || application.status === 'pending'
  )).length
  const activeApplications = applications.filter((application) => (
    application.status !== 'approved' && application.status !== 'rejected' && application.status !== 'withdrawn'
  )).length
  const pendingAdoptions = applications.filter((application) => (
    application.status === 'reviewing' || application.status === 'pending'
  )).length
  const recentApplications = applications.slice(0, 3)
  const inventoryPets = pets.slice(0, 4)

  const getApplicationPetName = (application) => application.petId?.name || 'Unknown Pet'
  const getApplicationApplicantName = (application) => application.adopterId?.fullName || 'Unknown Applicant'
  const getPetInitial = (name) => (name || '?').charAt(0).toUpperCase()
  const getPetImage = (pet) => pet.imageUrl || '/images/dog.png'
  const getStatusLabel = (status) => {
    if (status === 'submitted' || status === 'pending') return 'New'
    if (status === 'reviewing') return 'In Review'
    if (status === 'approved') return 'Approved'
    if (status === 'rejected') return 'Rejected'
    return status || 'Unknown'
  }
  const getStatusClass = (status) => {
    if (status === 'submitted' || status === 'pending') return 'bg-[#cfe5ff] text-[#0F2A44]'
    if (status === 'reviewing') return 'bg-[#fff7eb] text-[#9a5b00]'
    if (status === 'approved') return 'bg-[#dff2df] text-[#274c2b]'
    if (status === 'rejected') return 'bg-[#ffdad9] text-[#a23b42]'
    return 'bg-[#ededee] text-[#6c6d72]'
  }
  const sidebarName = user?.fullName || user?.email || shelter?.name || 'Shelter account'
  const sidebarDetail = shelter?.name || ''
  const sidebarNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '#dashboard-summary',
      Icon: LayoutDashboard,
    },
    {
      id: 'pets',
      label: 'Pet Listings',
      href: '#pet-listings',
      Icon: PawPrint,
    },
    {
      id: 'applications',
      label: 'Applications',
      href: '#applications',
      Icon: Mail,
    },
    {
      id: 'medical',
      label: 'Medical Logs',
      href: '#staff-notes',
      Icon: Syringe,
    },
    {
      id: 'tasks',
      label: 'Daily Tasks',
      href: '#staff-notes',
      Icon: ClipboardList,
    },
  ]




  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  if (loading) {
    return (
      <section className="min-h-screen bg-[#EDECEA] px-6 py-8">
        <div className="mx-auto max-w-7xl"></div>
        <h1 className="text-2xl font-bold">Loading dashboard...</h1>
      </section>
    )
  }

  if (shelter && shelter.approvalStatus === 'pending') {
    return (
      <section className="container mx-auto px-4">
        <h1 className="text-2xl font-bold">Shelter Approval Pending</h1>
        <p>Your shelter application is waiting for super admin approval.</p>
      </section>
    )
  }

  if (shelter && shelter.approvalStatus === 'rejected') {
    return (
      <section className="container mx-auto px-4">
        <h1 className="text-2xl font-bold">Shelter Application Rejected</h1>
        <p>{shelter.reviewNotes || 'Please contact PerfectPaw support for more information.'}</p>
      </section>
    )
  }
  return (
    <section className="min-h-screen bg-[#f5f3f0] pb-20">
      <aside className="fixed left-0 top-0 z-20 hidden h-full w-72 flex-col border-r border-[#d7d7d9] bg-[#f6f6f7] md:flex">
        <div className="px-6 py-8">
          <h1 className="m-0 font-serif text-[30px] font-bold leading-tight text-[#0F2A44]">
            Perfect Paw
          </h1>
        </div>

        <div className="mb-8 flex items-center gap-4 px-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#2e5f8a] bg-[#cfe5ff] font-bold text-[#0F2A44]">
            {getPetInitial(sidebarName)}
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-[#2f3034]">{sidebarName}</p>
            {sidebarDetail && <p className="m-0 text-xs text-[#67686d]">{sidebarDetail}</p>}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Shelter dashboard navigation">
          {sidebarNavItems.map(({ id, label, href, Icon }) => (
            <a
              key={id}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold no-underline transition-colors ${activeNavItem === id
                  ? 'bg-[#ef767a] text-white'
                  : 'text-[#55585f] hover:bg-[#ededee]'
                }`}
              href={href}
              onClick={() => setActiveNavItem(id)}
            >
              <Icon className="h-5 w-5" />
              {label}
            </a>
          ))}
        </nav>

        <div className="p-6">
          <button
            className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent p-2 text-sm font-semibold text-[#ba1a1a] cursor-pointer hover:bg-[#ffdad9]"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:ml-72">
        <header className="bg-[#f2f2f2] pt-10 pb-7">
          <div className="w-[min(1500px,calc(100%-96px))] mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
                  Shelter staff
                </p>
                <h1 className="animate-fade-up m-0 mt-3 font-serif text-[clamp(46px,4.5vw,66px)] leading-[1] tracking-[-0.02em] text-[#0F2A44]">
                  {shelter?.name || 'Shelter Dashboard'}
                </h1>
                <p className="animate-fade-up-delay-1 mt-[18px] max-w-[780px] text-[#67686d] text-[20px] leading-[1.55]">
                  Review applications, track pets, and keep your shelter listings ready for adoptions.
                </p>
              </div>

              <button
                className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="w-[min(1500px,calc(100%-96px))] mx-auto pt-7">
          {error && (
            <p className="mb-5 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
              {error}
            </p>
          )}

          <section id="dashboard-summary" className="flex flex-wrap gap-[22px] scroll-mt-8" aria-label="Dashboard summary">
            {[
              { label: 'Total Pets', value: totalPets, tone: 'bg-[#cfe5ff] text-[#0F2A44]' },
              { label: 'Active Applications', value: activeApplications, tone: 'bg-[#dff2df] text-[#274c2b]' },
              { label: 'Pending Adoptions', value: pendingAdoptions, tone: 'bg-[#ffdad9] text-[#a23b42]' },
              { label: 'New Applications', value: newApplications, tone: 'bg-[#fff7eb] text-[#9a5b00]' },
            ].map((stat) => (
              <article key={stat.label} className="flex flex-[1_1_240px] items-center gap-4 rounded-[20px] border border-[rgba(15,42,68,0.10)] bg-white p-5 shadow-[0_2px_12px_rgba(15,42,68,0.07)]">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-sm font-bold ${stat.tone}`}>
                  {stat.label === 'Total Pets' && <PawPrint className="w-6 h-6" />}
                  {stat.label === 'Active Applications' && <Mail className="w-6 h-6" />}
                  {stat.label === 'Pending Adoptions' && <HouseHeartIcon className="w-6 h-6" />}
                  {stat.label === 'New Applications' && <ClipboardList className="w-6 h-6" />}
                </div>
                <div>
                  <p className="m-0 text-[#67686d] text-sm font-semibold">{stat.label}</p>
                  <p className="m-0 mt-1 text-[32px] font-extrabold leading-none tracking-[-0.02em] text-[#0F2A44]">{stat.value}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-10 flex items-start gap-[38px] max-lg:flex-col">
            <aside id="staff-notes" className="flex-[0_0_360px] scroll-mt-8 rounded-[20px] border border-[rgba(15,42,68,0.12)] bg-[#f9fbfc] p-6 max-lg:w-full max-lg:max-w-none">
              <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Today</p>
              <h2 className="mt-3 mb-0 font-serif text-[34px] text-[#0F2A44]">Staff Notes</h2>

              <div className="mt-5 flex flex-col gap-4">
                <article className="rounded-[18px] border-l-4 border-[#ef767a] bg-white p-4 shadow-[0_2px_12px_rgba(15,42,68,0.07)]">
                  <p className="m-0 text-[#0F2A44] font-bold">New applications to review</p>
                  <p className="mt-1 mb-0 text-sm leading-6 text-[#67686d]">
                    {newApplications} adopter {newApplications === 1 ? 'message needs' : 'messages need'} a response.
                  </p>
                </article>

                <article className="rounded-[18px] border-l-4 border-[#2e5f8a] bg-white p-4 shadow-[0_2px_12px_rgba(15,42,68,0.07)]">
                  <p className="m-0 text-[#0F2A44] font-bold">Approved applications</p>
                  <p className="mt-1 mb-0 text-sm leading-6 text-[#67686d]">
                    {approvedApplications} adoption {approvedApplications === 1 ? 'is' : 'are'} ready for the next step.
                  </p>
                </article>
              </div>
            </aside>

            <section id="applications" className="flex-1 scroll-mt-8" aria-label="Recent applications">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Applications</p>
                  <h2 className="mt-3 mb-0 font-serif text-[clamp(34px,3.2vw,52px)] text-[#0F2A44]">Recent Applications</h2>
                </div>
                <p className="m-0 text-[#67686d] text-sm">
                  Showing {recentApplications.length} of {totalApplications}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {recentApplications.length === 0 && (
                  <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
                    No recent applications yet.
                  </p>
                )}

                {recentApplications.map((application) => {
                  const petName = getApplicationPetName(application)

                  return (
                    <article key={application._id} className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 shadow-[0_2px_12px_rgba(15,42,68,0.07)]">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#ededee] text-sm font-bold text-[#0F2A44]">
                            {getPetInitial(petName)}
                          </div>
                          <div>
                            <h3 className="m-0 font-serif text-[28px] text-[#0F2A44]">{petName}</h3>
                            <p className="mt-1 mb-0 text-sm text-[#67686d]">
                              {getApplicationApplicantName(application)}
                              {application.adopterId?.email ? ` - ${application.adopterId.email}` : ''}
                            </p>
                          </div>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusClass(application.status)}`}>
                          {getStatusLabel(application.status)}
                        </span>
                      </div>

                      {(application.reasonForAdoption || application.message) && (
                        <p className="mt-4 mb-0 rounded-[14px] bg-[#f6f6f7] p-3 text-sm leading-6 text-[#55585f]">
                          {application.reasonForAdoption || application.message}
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          </section>

          <section id="pet-listings" className="mt-11 scroll-mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="m-0 font-serif text-[clamp(34px,3.2vw,52px)] text-[#0F2A44]">Shelter Inventory</h2>
              <button className="rounded-lg border-2 border-transparent bg-[#ef767a] px-[18px] py-[10px] text-base font-semibold text-[#f6f6f6] cursor-pointer">
                Add New Pet
              </button>
            </div>

            <div className="mt-[22px] flex flex-wrap gap-[22px]">
              {inventoryPets.length === 0 && (
                <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
                  No pets in inventory yet.
                </p>
              )}

              {inventoryPets.map((pet, index) => (
                <article
                  key={pet._id}
                  className="pet-card flex-[1_1_300px] max-w-[420px] rounded-[20px] bg-white overflow-hidden flex flex-col shadow-[0_2px_12px_rgba(15,42,68,0.07)]"
                  style={{ animation: `fadeUp 0.5s ${index * 0.08}s ease both` }}
                >
                  <div className="relative h-[220px] overflow-hidden bg-[#efeff0]">
                    <img
                      className="pet-card-img h-full w-full object-cover block"
                      src={getPetImage(pet)}
                      alt={`Photo of ${pet.name}`}
                    />
                    <span className="absolute right-4 top-4 rounded-full bg-[#7DA67D] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      {pet.status || 'available'}
                    </span>
                  </div>
                  <div className="p-[18px_18px_20px]">
                    <h3 className="m-0 font-serif text-[28px] text-[#0F2A44]">{pet.name}</h3>
                    <p className="mt-[6px] mb-1 text-[#67686d] text-sm italic leading-snug">
                      {pet.blurb || `${pet.species} ready for the right family.`}
                    </p>
                    <p className="mt-[6px] mb-4 text-[#6c6d72] text-base">
                      {pet.age} yr{pet.age === 1 ? '' : 's'} old - {pet.species}
                    </p>
                    <button className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[14px] py-[9px] text-[14px] font-semibold text-[#333439] cursor-pointer">
                      Edit Listing
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </section>
  )
}
export default ShelterDashboard
