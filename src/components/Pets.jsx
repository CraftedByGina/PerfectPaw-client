import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router'
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
const getPetBreed = (pet) => pet.breed || ''
const getPetTraits = (pet) => pet.traits || pet.tags || []
const getFirstThreeTraits = (pet) => {
  const traits = getPetTraits(pet)
  return traits.slice(0, 3)
}
const getPetSex = (pet) => pet.sex || pet.gender || 'Unknown'
const getPetAgeMonths = (pet) => Number(pet.ageMonths || (pet.age ? pet.age * 12 : 0))
const getPetAgeGroup = (pet) => pet.ageGroup || 'Adult'
const getPetSize = (pet) => pet.size || 'Medium'

const formatPetAge = (pet) => {
  const ageMonths = getPetAgeMonths(pet)

  if (!ageMonths) return 'Age unknown'

  if (ageMonths < 12) {
    return `${ageMonths} month${ageMonths === 1 ? '' : 's'}`
  }

  const years = Math.floor(ageMonths / 12)
  return `${years} year${years === 1 ? '' : 's'}`
}

const AGE_GROUP_ORDER = ['Puppy', 'Young', 'Adult', 'Senior']
const AGE_GROUP_LABELS = {
  Puppy: 'Puppy/Kitten (< 1 yr)',
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

const getAgeFilterLabel = (group, selectedSpecies) => {
  if (group !== 'Puppy') return AGE_GROUP_LABELS[group]
  if (selectedSpecies.length === 1 && selectedSpecies[0] === 'Cat') return 'Kitten (< 1 yr)'
  if (selectedSpecies.length === 1 && selectedSpecies[0] === 'Dog') return 'Puppy (< 1 yr)'
  return AGE_GROUP_LABELS.Puppy
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
  const ageMonths = getPetAgeMonths(pet)

  if (rawAgeGroup === 'puppy' || rawAgeGroup === 'young' || rawAgeGroup === 'adult' || rawAgeGroup === 'senior') {
    return rawAgeGroup.charAt(0).toUpperCase() + rawAgeGroup.slice(1)
  }

  if (!Number.isNaN(ageMonths) && ageMonths > 0) {
    if (ageMonths < 12) return 'Puppy'
    if (ageMonths < 36) return 'Young'
    if (ageMonths < 96) return 'Adult'
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
  const [breed, setBreed] = useState('')
  const [gender, setGender] = useState('Any')
  const [sortBy, setSortBy] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(9)
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedPet, setSelectedPet] = useState(null)

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
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value))
      return
    }

    setList([...list, value])
  }

  const resetFilters = () => {
    setAges([])
    setSizes([])
    setSpecies([])
    setBreed('')
    setGender('Any')
    setSearch('')
    setSortBy('newest')
  }

  const handleSpeciesClick = (kind) => {
    const isAlreadySelected = species.length === 1 && species[0] === kind

    if (isAlreadySelected) {
      setSpecies([])
    } else {
      setSpecies([kind])
    }

    setBreed('')
  }

  const availableAgeGroups = new Set()
  pets.forEach((pet) => {
    availableAgeGroups.add(getNormalizedPetAgeGroup(pet))
  })

  const ageFilterOptions = AGE_GROUP_ORDER
    .filter((group) => availableAgeGroups.has(group))
    .map((group) => getAgeFilterLabel(group, species))

  const availableSizes = new Set()
  pets.forEach((pet) => {
    availableSizes.add(getPetSize(pet))
  })

  const knownSizes = SIZE_ORDER.filter((size) => availableSizes.has(size))
  const otherSizes = [...availableSizes].filter((size) => !SIZE_ORDER.includes(size)).sort()
  const sizeFilterOptions = [...knownSizes, ...otherSizes]

  const breedSet = new Set()
  pets.forEach((pet) => {
    const petSpecies = getPetSpecies(pet)
    const petBreed = getPetBreed(pet)
    const speciesMatches = species.length === 0 || species.includes(petSpecies)

    if (speciesMatches && petBreed) {
      breedSet.add(petBreed)
    }
  })
  const breedFilterOptions = [...breedSet].sort()

  const filteredPets = pets.filter((pet) => {
    const name = getPetName(pet)
    const petBreed = getPetBreed(pet)
    const ageGroup = getNormalizedPetAgeGroup(pet)
    const size = getPetSize(pet)
    const petSpecies = getPetSpecies(pet)
    const petSex = getPetSex(pet)
    const searchText = search.toLowerCase()

    const matchesSearch = name.toLowerCase().includes(searchText) || petBreed.toLowerCase().includes(searchText)
    const matchesAge = ages.length === 0 || ages.some((age) => getFilterAgeGroup(age) === ageGroup)
    const matchesSize = sizes.length === 0 || sizes.includes(size)
    const matchesSpecies = species.length === 0 || species.includes(petSpecies)
    const matchesBreed = !breed || breed === petBreed
    const matchesGender = gender === 'Any' || petSex === gender

    return matchesSearch && matchesAge && matchesSize && matchesSpecies && matchesBreed && matchesGender
  })

  const sortedPets = [...filteredPets]

  if (sortBy === 'name') {
    sortedPets.sort((firstPet, secondPet) => getPetName(firstPet).localeCompare(getPetName(secondPet)))
  }

  if (sortBy === 'age-low') {
    sortedPets.sort((firstPet, secondPet) => getPetAgeMonths(firstPet) - getPetAgeMonths(secondPet))
  }

  if (sortBy === 'age-high') {
    sortedPets.sort((firstPet, secondPet) => getPetAgeMonths(secondPet) - getPetAgeMonths(firstPet))
  }

  const visiblePets = sortedPets.slice(0, visibleCount)

  useEffect(() => {
    setVisibleCount(9)
  }, [search, ages, sizes, species, breed, gender, sortBy])

  const handleApply = async (pet) => {
    if (!isAuthenticated) {
      setNotice('Please sign in as an adopter before submitting an application.')
      return
    }

    if (isShelterAdmin) {
      setNotice('Shelter accounts cannot submit adoption applications. Use an adopter account.')
      return
    }

    if (!pet._id && !pet.id && !pet.petId) {
      setNotice('These starter pets are available for browsing. Seed the backend database before accepting applications for them.')
      return
    }

    setNotice('')
    setSelectedPet(pet)

  }

  return (
    <>



      <section className="bg-[#f2f2f2] pt-12 pb-9 max-sm:pt-8">
        <div className="w-[min(1200px,calc(100%-96px))] mx-auto flex items-center justify-center gap-4 text-center max-md:flex-col max-sm:w-[calc(100%-32px)]">
          <div className="mx-auto">
            <h1 className="animate-fade-up m-0 font-serif text-[clamp(36px,5vw,66px)] tracking-[-0.02em] text-[#0F2A44]">
              Meet Your Best{' '}
              Frien
              <span className="relative inline-block">
                d
                <span className="pointer-events-none absolute left-full bottom-[-0.12em] h-[1.75em] w-[1.75em] -translate-x-[28%] rotate-[8deg]" aria-hidden="true">
                  <DotLottieReact
                    className="h-full w-full"
                    src="https://lottie.host/90089628-88b1-48ca-a160-5d9e0630a2e5/xKtbeouK7G.lottie"
                    loop
                    autoplay
                  />
                </span>
              </span>
            </h1>

            <p className="animate-fade-up-delay-1 mx-auto mt-[18px] max-w-[760px] text-[#67686d] text-[20px] leading-[1.55] max-sm:text-[17px]">
              Discover lovable dogs and cats waiting for their forever homes. Use the filters to find a pet that fits your life.
            </p>
            <Link
              to="/pet-match"
              className="mt-6 inline-flex rounded-full bg-[#ef767a] px-6 py-3 font-semibold text-white transition-all hover:brightness-110"
            >
              Take the PerfectPaw Match Quiz
            </Link>
          </div>

        </div>
      </section>

      {/* Body */}
      <section className="pb-20 pt-7">
        <div className="w-[min(1200px,calc(100%-96px))] mx-auto flex items-start gap-6 max-lg:flex-col max-sm:w-[calc(100%-32px)]">

          {/* Sidebar */}
          <aside className="animate-slide-left sticky top-24 max-h-[calc(100vh-120px)] flex-[0_0_300px] self-start overflow-y-auto rounded-3xl border border-[#d7d7d9] bg-white p-6 shadow-[0_4px_20px_rgba(15,42,68,0.05)] max-lg:static max-lg:max-h-none max-lg:w-full max-lg:max-w-none max-lg:overflow-visible max-sm:p-4" aria-label="Filters">
            {/* Search */}
            <label className="relative block">
              <svg className="absolute top-1/2 left-3.5 -translate-y-1/2 w-[18px] h-[18px] opacity-60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search names or breeds..."
                aria-label="Search names or breeds"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border-2 border-[#e2e2e3] bg-white py-[12px] pr-[14px] pl-11 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] outline-none focus:border-[#2e5f8a]"
              />
            </label>

            {/* Filters header */}
            <div className="mt-[26px] flex items-baseline justify-between gap-2.5">
              <h2 className="m-0 font-serif text-[26px] text-[#0F2A44]">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-[#cfe5ff] bg-white px-3 py-1 text-sm font-semibold text-[#2e5f8a] cursor-pointer transition-colors hover:bg-[#cfe5ff]"
              >
                Reset
              </button>
            </div>
            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />

            <div>
              <h3 className="m-0 mb-3 text-sm uppercase tracking-wider text-[#0F2A44] font-bold">I'm looking for</h3>
              <div className="flex rounded-full bg-[#f3f3f4] p-1">
                {['Dog', 'Cat'].map((kind) => {
                  const isActive = species.length === 1 && species[0] === kind

                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => handleSpeciesClick(kind)}
                      className={`flex-1 rounded-full border-0 px-4 py-2 text-sm font-bold cursor-pointer transition-all ${isActive
                        ? 'bg-[#2e5f8a] text-white shadow-sm'
                        : 'text-[#67686d] hover:bg-white'
                        }`}
                    >
                      {kind}s
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />

            <div>
              <h3 className="m-0 mb-3 text-sm uppercase tracking-wider text-[#0F2A44] font-bold">Breed</h3>
              <select
                value={breed}
                onChange={(event) => setBreed(event.target.value)}
                className="w-full rounded-xl border border-[#d7d7d9] bg-white px-3 py-2 text-base text-[#2f3034] outline-none focus:border-[#2e5f8a]"
              >
                <option value="">All breeds</option>
                {breedFilterOptions.map((breedName) => (
                  <option key={breedName} value={breedName}>
                    {breedName}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />

            {/* Age filter */}
            <div>
              <h3 className="m-0 mb-3 text-sm uppercase tracking-wider text-[#0F2A44] font-bold">Age</h3>
              {ageFilterOptions.map(group => (
                <label key={group} className="group flex items-center gap-3 my-2.5 text-base text-[#2f3034] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ages.includes(group)}
                    onChange={() => toggleFilter(ages, setAges, group)}
                    className="w-5 h-5 rounded accent-[#2e5f8a]"
                  />
                  <span className="group-hover:text-[#2e5f8a]">{group}</span>
                </label>
              ))}
            </div>

            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />

            {/* Size filter */}
            <div>
              <h3 className="m-0 mb-3 text-sm uppercase tracking-wider text-[#0F2A44] font-bold">Size</h3>
              {sizeFilterOptions.map(size => (
                <label key={size} className="group flex items-center gap-3 my-2.5 text-base text-[#2f3034] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sizes.includes(size)}
                    onChange={() => toggleFilter(sizes, setSizes, size)}
                    className="w-5 h-5 rounded accent-[#2e5f8a]"
                  />
                  <span className="group-hover:text-[#2e5f8a]">{size}</span>
                </label>
              ))}
            </div>

            <div className="h-px bg-[#d7d7d9] my-3.5" aria-hidden="true" />

            <div>
              <h3 className="m-0 mb-3 text-sm uppercase tracking-wider text-[#0F2A44] font-bold">Gender</h3>
              {['Any', 'Male', 'Female'].map((option) => (
                <label key={option} className="group flex items-center gap-3 my-2.5 text-base text-[#2f3034] cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === option}
                    onChange={() => setGender(option)}
                    className="w-5 h-5 accent-[#2e5f8a]"
                  />
                  <span className="group-hover:text-[#2e5f8a]">{option}</span>
                </label>
              ))}
            </div>
          </aside>
          {/* Pet cards */}
          <section className="flex-1 pt-1 max-lg:w-full" aria-label="Pets list">
            {loading && <p className="text-[#67686d] text-lg">Loading pets...</p>}
            {!loading && error && <p className="text-[#b42318] text-lg">{error}</p>}
            {!isAuthenticated && !loading && !error && (
              <p className="mb-5 rounded-xl border border-[#f3d3a6] bg-[#fff7eb] p-3 text-[#7a5208] text-sm">
                Sign in as an adopter to submit an application.
              </p>
            )}
            {notice && (
              <p className="mb-5 rounded-xl border border-[#d7d7d9] bg-white p-3 text-[#2f3034] text-sm">
                {notice}
              </p>
            )}

            {!loading && !error && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4 shadow-[0_4px_20px_rgba(15,42,68,0.04)]">
                <p className="m-0 text-sm font-semibold uppercase tracking-wider text-[#67686d]">
                  Showing {visiblePets.length} of {sortedPets.length} pets available for adoption
                </p>

                <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#67686d]">
                  Sort by:
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#2e5f8a] outline-none focus:border-[#2e5f8a]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="age-low">Age: Youngest First</option>
                    <option value="age-high">Age: Oldest First</option>
                  </select>
                </label>
              </div>
            )}

            {!loading && !error && sortedPets.length === 0 && (
              <p className="rounded-2xl border border-[#d7d7d9] bg-white p-5 text-[#67686d] text-lg">No pets match your filters.</p>
            )}

            <div className="flex flex-wrap gap-6">
              {visiblePets.map((pet, i) => {
                const firstThreeTraits = getFirstThreeTraits(pet)

                return (
                  <article
                    key={getPetId(pet)}
                    className="pet-card group flex-[1_1_300px] max-w-[calc(33.333%-16px)] overflow-hidden rounded-3xl border border-[#d7d7d9] bg-white shadow-[0_4px_20px_rgba(15,42,68,0.05)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_12px_30px_rgba(15,42,68,0.08)] max-xl:max-w-[calc(50%-12px)] max-md:max-w-none max-md:flex-[1_1_100%]"
                    style={{ animation: `fadeUp 0.5s ${i * 0.08}s ease both` }}
                  >
                    <div className="relative aspect-[18/13] overflow-hidden bg-[#efeff0]">
                      <img className="pet-card-img h-full w-full object-cover object-center block transition-transform duration-500 group-hover:scale-105" src={getPetImage(pet)} alt={`Photo of ${getPetName(pet)}`} />
                    </div>

                    <div className="flex min-h-[260px] flex-col p-5">
                      <div className="mb-2">
                        <h3 className="m-0 font-serif text-[32px] leading-tight tracking-[-0.01em] text-[#0F2A44]">{getPetName(pet)}</h3>
                      </div>

                      <p className="m-0 text-[#6c6d72] text-base">
                        {getPetSex(pet)}, {formatPetAge(pet)}
                      </p>

                      {getPetBreed(pet) && (
                        <p className="mt-1 mb-0 text-[#2e5f8a] text-sm font-semibold">
                          {getPetBreed(pet)}
                        </p>
                      )}

                      {pet.blurb && <p className="mt-3 mb-0 text-[#67686d] text-sm italic leading-6">{pet.blurb}</p>}

                      <div className="mt-4 flex flex-wrap gap-2" aria-label="Traits">
                        {firstThreeTraits.map((trait, traitIndex) => (
                          <span key={trait} className="animate-tag-pop rounded-lg bg-[#ededee] px-2.5 py-[7px] text-xs font-semibold text-[#6c6d72]" style={{ animationDelay: `${0.1 + traitIndex * 0.07}s` }}>{trait}</span>
                        ))}
                      </div>

                      <div className="mt-auto pt-6">
                        <button
                          type="button"
                          onClick={() => handleApply(pet)}
                          disabled={selectedPet && getPetId(selectedPet) === getPetId(pet)}
                          className="block w-full rounded-full border-2 border-transparent bg-[#ef767a] px-4 py-3 text-center text-base font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                        >
                          {`I'm interested in ${getPetName(pet)}!`}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {!loading && !error && visiblePets.length < sortedPets.length && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((currentCount) => currentCount + 9)}
                  className="rounded-full border-2 border-[#cfe5ff] px-8 py-4 text-base font-semibold text-[#2e5f8a] transition-all hover:bg-[#cfe5ff] active:scale-95"
                >
                  Show More Animals
                </button>
              </div>
            )}
          </section>

        </div>
      </section>
      {selectedPet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 max-sm:items-end max-sm:px-0 max-sm:py-0"
          aria-modal="true"
          aria-label={`Application for ${getPetName(selectedPet)}`}
        >
          <div className="max-h-[calc(100vh-64px)] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[#d7d7d9] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8 max-sm:max-h-[92vh] max-sm:rounded-b-none max-sm:p-4">
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
