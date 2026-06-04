import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useAuth } from '../context/AuthContext.jsx'
import ApplicationForm from './ApplicationForm.jsx'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = import.meta.env.DEV ? '' : RAW_API_BASE_URL

const joinUrl = (base, path) => {
  const cleanBase = String(base || '').replace(/\/+$/, '')
  const cleanPath = String(path || '').replace(/^\/+/, '')
  return `${cleanBase}/${cleanPath}`
}

const readApiError = async (response) => {
  try {
    const data = await response.json()
    return data?.message || `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

const fetchPets = async () => {
  const response = await fetch(joinUrl(API_BASE_URL, '/api/pets'))
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  const data = await response.json()
  return Array.isArray(data) ? data : data?.pets || data?.data || []
}

const getPetId = (pet) => pet.id || pet._id || pet.petId || pet.name
const getPetName = (pet) => pet.name || 'Unnamed Pet'
const getPetImage = (pet) => pet.img || pet.image || pet.imageUrl || '/images/dog.png'
const getPetTraits = (pet) => pet.traits || pet.tags || []
const getPetSex = (pet) => pet.sex || pet.gender || 'Unknown'
const getPetAge = (pet) => Number(pet.age || 0)
const getPetAgeGroup = (pet) => pet.ageGroup || 'Adult'
const getPetSize = (pet) => pet.size || 'Medium'

const AGE_GROUP_ORDER = ['Puppy', 'Young', 'Adult', 'Senior']
const AGE_GROUP_LABELS = {
  Puppy: 'Puppy (< 1 yr)',
  Young: 'Young (1-3 yrs)',
  Adult: 'Adult (3-7 yrs)',
  Senior: 'Senior (7+ yrs)',
}
const SIZE_ORDER = ['Small', 'Medium', 'Large']

const getFilterAgeGroup = (label) => {
  const normalized = String(label || '').trim().toLowerCase()
  if (normalized.startsWith('puppy')) return 'Puppy'
  if (normalized.startsWith('young')) return 'Young'
  if (normalized.startsWith('adult')) return 'Adult'
  if (normalized.startsWith('senior')) return 'Senior'
  return ''
}

const getPetSpecies = (pet) => {
  const rawSpecies = String(pet.species || pet.type || '').trim().toLowerCase()
  if (rawSpecies === 'dog') return 'Dog'
  if (rawSpecies === 'cat') return 'Cat'

  const image = String(getPetImage(pet)).toLowerCase()
  if (image.includes('cat')) return 'Cat'
  return 'Dog'
}

const getNormalizedPetAgeGroup = (pet) => {
  const rawAgeGroup = String(getPetAgeGroup(pet) || '').trim().toLowerCase()
  const age = getPetAge(pet)

  if (rawAgeGroup === 'puppy' || rawAgeGroup === 'young' || rawAgeGroup === 'adult' || rawAgeGroup === 'senior') {
    return rawAgeGroup.charAt(0).toUpperCase() + rawAgeGroup.slice(1)
  }

  if (!Number.isNaN(age)) {
    if (age < 1) return 'Puppy'
    if (age < 3) return 'Young'
    if (age < 8) return 'Adult'
    return 'Senior'
  }

  return 'Adult'
}

const Pets = () => {
  const { token, isAuthenticated, isShelterAdmin } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [ages, setAges] = useState([])
  const [sizes, setSizes] = useState([])
  const [species, setSpecies] = useState([])
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedPet, setSelectedPet] = useState(null)


  const ageFilterOptions = useMemo(() => {
    const available = new Set(pets.map(getNormalizedPetAgeGroup))
    return AGE_GROUP_ORDER.filter(group => available.has(group)).map(group => AGE_GROUP_LABELS[group])
  }, [pets])

  const sizeFilterOptions = useMemo(() => {
    const available = new Set(pets.map(pet => getPetSize(pet)))
    const knownSizes = SIZE_ORDER.filter(size => available.has(size))
    const otherSizes = [...available].filter(size => !SIZE_ORDER.includes(size)).sort()
    return [...knownSizes, ...otherSizes]
  }, [pets])

  const speciesFilterOptions = useMemo(() => {
    const available = new Set(pets.map(getPetSpecies))
    return ['Dog', 'Cat'].filter(kind => available.has(kind))
  }, [pets])

  useEffect(() => {
    const loadPets = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await fetchPets()
        setPets(data)
      } catch (err) {
        setError(err.message || 'Could not load pets right now.')
      } finally {
        setLoading(false)
      }
    }

    loadPets()
  }, [])

  const toggleFilter = (list, setList, value) => {
    setList(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  const filtered = useMemo(() => pets.filter(pet => {
    const name = getPetName(pet)
    const ageGroup = getNormalizedPetAgeGroup(pet)
    const size = getPetSize(pet)
    const petSpecies = getPetSpecies(pet)

    const matchesSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchesAge = ages.length === 0 || ages.some(a => getFilterAgeGroup(a) === ageGroup)
    const matchesSize = sizes.length === 0 || sizes.includes(size)
    const matchesSpecies = species.length === 0 || species.includes(petSpecies)
    return matchesSearch && matchesAge && matchesSize && matchesSpecies
  }), [pets, search, ages, sizes, species])

  const handleApply = async (pet) => {
    if (!isAuthenticated) {
      setNotice('Please sign in as an adopter before submitting an application.')
      return
    }

    if (isShelterAdmin) {
      setNotice('Shelter accounts cannot submit adoption applications. Use an adopter account.')
      return
    }
    setNotice('')
    setSelectedPet(pet)

  }

  return (
    <>
      <div className="fixed right-4 bottom-4 z-20 w-[min(300px,32vw)] min-w-[300px] origin-bottom-right scale-[2] max-sm:right-2 max-sm:bottom-2 max-sm:w-[300px] pointer-events-none" aria-hidden="true">
        <DotLottieReact
          src="https://lottie.host/22ad055c-6095-4895-b8c0-62282cf7b04a/NOyZGDRUA7.lottie"
          loop
          autoplay
        />
      </div>

      {/* Top Section */}
      <section className="bg-[#f2f2f2] pt-10 pb-7">
        <div className="w-[min(1500px,calc(100%-96px))] mx-auto">
          <h1 className="animate-fade-up m-0 font-serif text-[clamp(46px,5vw,86px)] tracking-[-0.02em] text-[#0F2A44]">
            Adoptable Pets
          </h1>
          <p className="animate-fade-up-delay-1 mt-[18px] max-w-[900px] text-[#67686d] text-[20px] leading-[1.55]">
            Meet our wonderful dogs and cats waiting for their forever homes. Use the filters to match your pet.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="pb-20 pt-7">
        <div className="w-[min(1500px,calc(100%-96px))] mx-auto flex items-start gap-[38px] max-lg:flex-col">

          {/* Sidebar */}
          <aside className="animate-slide-left flex-[0_0_360px] pt-1.5 max-lg:w-full max-lg:max-w-[520px] max-sm:max-w-none" aria-label="Filters">
            {/* Search */}
            <label className="relative block">
              <svg className="absolute top-1/2 left-3.5 -translate-y-1/2 w-[18px] h-[18px] opacity-60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search by name..."
                aria-label="Search by name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-[#d7d7d9] rounded-lg py-[14px] pr-[14px] pl-11 text-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] outline-none"
              />
            </label>

            {/* Filters header */}
            <div className="mt-[26px] flex items-baseline justify-between gap-2.5">
              <h2 className="m-0 font-serif text-[26px] text-[#0F2A44]">Filters</h2>
              <button
                onClick={() => { setAges([]); setSizes([]); setSpecies([]) }}
                className="border-0 bg-transparent text-[#6c6d72] text-base cursor-pointer"
              >
                Reset
              </button>
            </div>
            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />

            {/* Age filter */}
            <div>
              <h3 className="m-0 mb-3 text-lg text-[#0F2A44] font-bold">Age</h3>
              {ageFilterOptions.map(group => (
                <label key={group} className="flex items-center gap-3 my-2.5 text-lg text-[#2f3034] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ages.includes(group)}
                    onChange={() => toggleFilter(ages, setAges, group)}
                    className="w-5 h-5 accent-[#2f3034]"
                  />
                  <span>{group}</span>
                </label>
              ))}
            </div>

            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />


            <div>
              <h3 className="m-0 mb-3 text-lg text-[#0F2A44] font-bold">Species</h3>
              {speciesFilterOptions.map(kind => (
                <label key={kind} className="flex items-center gap-3 my-2.5 text-lg text-[#2f3034] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={species.includes(kind)}
                    onChange={() => toggleFilter(species, setSpecies, kind)}
                    className="w-5 h-5 accent-[#2f3034]"
                  />
                  <span>{kind}</span>
                </label>
              ))}
            </div>

            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />

            {/* Size filter */}
            <div>
              <h3 className="m-0 mb-3 text-lg text-[#0F2A44] font-bold">Size</h3>
              {sizeFilterOptions.map(size => (
                <label key={size} className="flex items-center gap-3 my-2.5 text-lg text-[#2f3034] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sizes.includes(size)}
                    onChange={() => toggleFilter(sizes, setSizes, size)}
                    className="w-5 h-5 accent-[#2f3034]"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </aside>
          {/* Pet cards */}
          <section className="flex-1 flex flex-wrap gap-7 pt-1" aria-label="Pets list">
            {loading && <p className="text-[#67686d] text-lg">Loading pets...</p>}
            {!loading && error && <p className="text-[#b42318] text-lg">{error}</p>}
            {!isAuthenticated && !loading && !error && (
              <p className="w-full rounded-lg border border-[#f3d3a6] bg-[#fff7eb] p-3 text-[#7a5208] text-sm">
                Sign in as an adopter to submit an application.
              </p>
            )}
            {notice && (
              <p className="w-full rounded-lg border border-[#d7d7d9] bg-white p-3 text-[#2f3034] text-sm">
                {notice}
              </p>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-[#67686d] text-lg">No pets match your filters.</p>
            )}
            {filtered.map((pet, i) => (
              <article
                key={getPetId(pet)}
                className="pet-card flex-[1_1_320px] max-w-[420px] bg-[#f6f6f7] border border-[#d7d7d9] rounded-[14px] overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
                style={{ animation: `fadeUp 0.5s ${i * 0.1}s ease both` }}
              >
                <div className="h-[260px] overflow-hidden">
                  <img className="pet-card-img w-full h-full object-cover block" src={getPetImage(pet)} alt={`Photo of ${getPetName(pet)}`} />
                </div>
                <div className="p-[18px_18px_20px] bg-[#f6f6f7]">
                  <div className="flex items-baseline justify-between gap-3.5">
                    <h3 className="m-0 font-serif text-[34px] tracking-[-0.01em] text-[#0F2A44]">{getPetName(pet)}</h3>
                    <p className="m-0 text-[#6c6d72] text-lg">
                      {getPetSex(pet)}, {getPetAge(pet)} yr{getPetAge(pet) !== 1 ? 's' : ''}
                    </p>
                    {pet.blurb && <p className="mt-2 mb-0 text-[#888] text-sm italic leading-snug">{pet.blurb}</p>}
                  </div>
                  <div className="flex gap-2.5 flex-wrap mt-3.5 mb-[18px]" aria-label="Traits">
                    {getPetTraits(pet).map((t, ti) => (
                      <span key={t} className="animate-tag-pop px-2.5 py-[7px] rounded-lg bg-[#ededee] text-[#6c6d72] text-sm" style={{ animationDelay: `${0.1 + ti * 0.07}s` }}>{t}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApply(pet)}
                    disabled={selectedPet && getPetId(selectedPet) === getPetId(pet)}
                    className="block w-full text-center rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] text-[#2f3034] py-[10px] text-base font-semibold no-underline"
                  >
                    {`I'm interested in ${getPetName(pet)}!`}
                  </button>
                </div>
              </article>
            ))}
          </section>

        </div>
      </section>
      {selectedPet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8"
          aria-modal="true"
          aria-label={`Application for ${getPetName(selectedPet)}`}
        >
          <div className="max-h-[calc(100vh-64px)] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[#d7d7d9] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
            <ApplicationForm
              pet={selectedPet}
              token={token}
              onCancel={() => setSelectedPet(null)}
              onSubmitted={(applicationId) => {
                setSelectedPet(null)
                navigate(`/course?applicationId=${applicationId}`)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default Pets
