import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import ApplicationForm from './ApplicationForm.jsx'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = import.meta.env.DEV ? '' : RAW_API_BASE_URL

const joinUrl = (base, path) => {
  const cleanBase = String(base || '').replace(/\/+$/, '')
  const cleanPath = String(path || '').replace(/^\/+/, '')
  return `${cleanBase}/${cleanPath}`
}

const PetProfile = () => {
  const { petId } = useParams()
  const navigate = useNavigate()
  const { token, isAuthenticated, isShelterAdmin } = useAuth()

  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showApplication, setShowApplication] = useState(false)

  useEffect(() => {
    const loadPet = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(joinUrl(API_BASE_URL, `/api/pets/${petId}`))
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Could not load this pet.')
        }

        setPet(data?.data || data)
      } catch (err) {
        setError(err.message || 'Could not load this pet.')
      } finally {
        setLoading(false)
      }
    }

    loadPet()
  }, [petId])

  const handleInterested = () => {
    if (!isAuthenticated) {
      setNotice('Please sign in as an adopter before submitting an application.')
      return
    }

    if (isShelterAdmin) {
      setNotice('Shelter accounts cannot submit adoption applications.')
      return
    }

    setNotice('')
    setShowApplication(true)
  }

  return (
    <section className="min-h-screen bg-[#f2f2f2] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link to="/pets" className="text-sm font-semibold text-[#2e5f8a]">
          Back to all pets
        </Link>

        {loading && (
          <p className="mt-8 text-[#67686d]">
            Loading pet profile...
          </p>
        )}

        {error && (
          <p className="mt-8 text-[#b42318]">
            {error}
          </p>
        )}

        {!loading && !error && pet && (
          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgba(15,42,68,0.06)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <img
                src={pet.imageUrl || '/images/dog.png'}
                alt={`Photo of ${pet.name}`}
                className="h-full min-h-[420px] w-full object-cover"
              />

              <div className="p-8">
                <p className="text-sm font-bold uppercase tracking-wider text-[#ef767a]">
                  Get to know 
                </p>

                <h1 className="mt-2 font-serif text-[clamp(42px,6vw,72px)] leading-tight text-[#0F2A44]">
                  {pet.name}
                </h1>

                <p className="mt-3 text-lg text-[#67686d]">
                  {pet.sex}, {pet.ageGroup} · {pet.size}
                </p>

                {pet.breed && (
                  <p className="mt-1 text-base font-semibold text-[#2e5f8a]">
                    {pet.breed}
                  </p>
                )}

                {pet.blurb && (
                  <p className="mt-6 text-lg leading-8 text-[#67686d]">
                    {pet.blurb}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {(pet.traits || []).map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-[#ededee] px-3 py-2 text-sm font-semibold text-[#67686d]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 rounded-2xl bg-[#f2f2f2] p-5 text-sm text-[#2f3034]">
                  <p><strong>Energy:</strong> {pet.energyLevel || 'Unknown'}</p>
                  <p><strong>Exercise needs:</strong> {pet.exerciseNeeds || 'Unknown'}</p>
                  <p><strong>Good for apartments:</strong> {pet.goodForApartments || 'Unknown'}</p>
                  <p><strong>Good with kids:</strong> {pet.goodWithKids || 'Unknown'}</p>
                  <p><strong>Good with other pets:</strong> {pet.goodWithOtherPets || 'Unknown'}</p>
                </div>

                {pet.shelterId && (
                  <div className="mt-6 text-sm text-[#67686d]">
                    <p className="font-semibold text-[#0F2A44]">
                      {pet.shelterId.name}
                    </p>
                    <p>
                      {[pet.shelterId.city, pet.shelterId.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}

                {notice && (
                  <p className="mt-5 rounded-xl border border-[#d7d7d9] bg-white p-3 text-sm text-[#2f3034]">
                    {notice}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleInterested}
                  className="mt-8 w-full rounded-full bg-[#ef767a] px-6 py-4 text-lg font-semibold text-white transition-all hover:brightness-110"
                >
                  I want to adopt {pet.name}
                </button>
              </div>
            </div>
          </div>
        )}

        {showApplication && pet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
            <div className="max-h-[calc(100vh-64px)] w-full max-w-[760px] overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              <ApplicationForm
                pet={pet}
                token={token}
                onCancel={() => setShowApplication(false)}
                onSubmitted={(applicationId) => {
                  setShowApplication(false)
                  navigate(`/course?applicationId=${applicationId}`)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PetProfile
