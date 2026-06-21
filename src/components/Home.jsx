import { Link } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

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

const getPetImage = (pet) => pet.imageUrl

const getPetId = (pet) => pet._id

const formatPetAge = (pet) => {
  const ageMonths = Number(pet.ageMonths || 0)

  if (!ageMonths) return 'Age unknown'

  if (ageMonths < 12) {
    return `${ageMonths} month${ageMonths === 1 ? '' : 's'}`
  }

  const years = Math.floor(ageMonths / 12)
  return `${years} year${years === 1 ? '' : 's'}`
}

const getRandomPets = (pets) => {
  const shuffledPets = [...pets].sort(() => Math.random() - 0.5)
  return shuffledPets.slice(0, 6)
}

const Home = () => {
  const [pets, setPets] = useState([])
  const [loadingPets, setLoadingPets] = useState(true)
  const [petError, setPetError] = useState('')
  const petsOfTheWeek = useMemo(() => getRandomPets(pets), [pets])
  const [activePetIndex, setActivePetIndex] = useState(0)
  const activePet = petsOfTheWeek[activePetIndex]

  useEffect(() => {
    setActivePetIndex(0)
  }, [petsOfTheWeek.length])

  const showPreviousPet = () => {
    setActivePetIndex((currentIndex) => {
      if (currentIndex === 0) return petsOfTheWeek.length - 1
      return currentIndex - 1
    })
  }

  const showNextPet = () => {
    setActivePetIndex((currentIndex) => {
      if (currentIndex === petsOfTheWeek.length - 1) return 0
      return currentIndex + 1
    })
  }




  useEffect(() => {
    const loadPets = async () => {
      try {
        setPetError('')
        setLoadingPets(true)

        const data = await fetchPets()
        setPets(data)
      } catch (err) {
        setPetError(err.message || 'Could not load pets of the week.')
      } finally {
        setLoadingPets(false)
      }
    }

    loadPets()
  }, [])

  return (
    <>
      {/* Top section */}

      <section className="w-[min(1500px,calc(100%-96px))] mx-auto flex items-stretch gap-[72px] pt-[82px] pb-[44px] max-lg:flex-col max-lg:gap-12 max-sm:w-[calc(100%-32px)] max-sm:pt-7">
        <div className="flex-[1_1_560px]">
          <h1 className="animate-fade-up m-0 font-serif text-[clamp(56px,6vw,104px)] leading-[0.95] tracking-[-0.02em] text-[#0F2A44]">
            Find Your New Best Friend
          </h1>
          <p className="animate-fade-up-delay-1 mt-[26px] max-w-[540px] text-[#67686d] text-[20px] leading-[1.55] font-light max-lg:text-[18px] max-sm:mt-4">
            We connect adopters with trusted shelters and rescue partners to help dogs and cats find loving homes.
            Start your adoption journey with confidence.
          </p>
          <div className="animate-fade-up-delay-2 mt-7 flex flex-wrap gap-4 max-sm:flex-col">
            <Link to="/pets" className="animate-heartbeat flex items-center justify-center gap-[14px] rounded-lg border-2 border-transparent bg-[#ef767a] px-[18px] py-[10px] text-base font-semibold text-[#f6f6f6] cursor-pointer no-underline max-lg:text-[16px] max-sm:w-full max-sm:text-[15px]">
              Adopt a Pet
              <img className="w-5" src="/icons/heart.svg" alt="" aria-hidden="true" />
            </Link>
            <a href="#how-adoption-works" className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer no-underline max-lg:text-[16px] max-sm:w-full max-sm:text-[15px]">
              See How Adoption Works
            </a>
          </div>
          <div className="mt-5 w-[min(500px,100%)] max-lg:w-[min(420px,100%)] max-sm:mx-auto max-sm:w-[min(360px,92vw)]" aria-hidden="true">
            <DotLottieReact
              src="https://lottie.host/c1525885-a3f4-47a0-bc60-6c1641bad5dd/PyArX2iabK.lottie"
              loop
              autoplay
              style={{ backgroundColor: 'transparent', mixBlendMode: 'multiply' }}
            />
          </div>
        </div>
        <div className="flex-[0_1_48%] min-w-[360px] max-lg:min-w-0" aria-hidden="true">
          <div className="relative h-[560px] max-lg:h-[440px] max-sm:h-[420px]">
            <div className="absolute top-0 right-0 w-[min(520px,92%)] h-[220px] rounded-[32px] overflow-hidden shadow-[0_18px_40px_rgba(15,42,68,0.12)] border border-[rgba(46,95,138,0.22)] bg-gradient-to-br from-[rgba(118,183,197,0.45)] to-[rgba(76,162,181,0.10)] max-lg:h-[190px] max-lg:w-[min(520px,100%)] max-sm:h-[175px] max-sm:w-[82%] max-sm:rounded-[24px]">
              <img className="w-full h-full object-cover block" src="/images/woman.png" alt="" aria-hidden="true" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[320px] rounded-[36px] overflow-hidden shadow-[0_18px_40px_rgba(15,42,68,0.12)] border border-[rgba(46,95,138,0.22)] bg-gradient-to-br from-[rgba(245,224,183,0.42)] to-[rgba(239,118,122,0.10)] max-lg:h-[260px] max-sm:h-[220px] max-sm:rounded-[28px]">
              <img className="w-full h-full object-cover block" src="/images/family.png" alt="" aria-hidden="true" />
            </div>
            <div className="animate-float absolute top-[18px] left-[18px] px-4 py-[14px] rounded-[18px] bg-[rgba(237,227,228,0.62)] border border-[rgba(239,118,122,0.18)] backdrop-blur-[10px] max-sm:top-4 max-sm:left-4 max-sm:px-3 max-sm:py-2 max-sm:rounded-[14px]">
              <span className="block text-[40px] font-extrabold tracking-[-0.02em] text-[#0F2A44] max-sm:text-[30px]">10k+</span>
              <span className="block mt-1 text-base text-[rgba(15,42,68,0.72)] max-sm:text-[13px]">Happy Adoptions</span>
            </div>
          </div>
        </div>
      </section>


      <section className="w-[min(1500px,calc(100%-96px))] mx-auto mt-11 max-sm:w-[calc(100%-32px)]">

        {loadingPets && (
          <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
            Loading pets of the week...
          </p>
        )}
        {!loadingPets && petError && (
          <p className="rounded-[20px] border border-[#f0b8b8] bg-[#fff4f4] p-5 text-[#9b1c1c]">
            {petError}
          </p>
        )}
        {!loadingPets && !petError && petsOfTheWeek.length === 0 && (
          <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
            No pets are available yet. Seed the backend database to show pets here.
          </p>
        )}
        {!loadingPets && !petError && activePet && (
          <div className="mt-6 flex items-center gap-8 max-lg:flex-col">
            <div className="relative mx-auto h-[500px] w-full max-w-[500px] max-sm:h-[500px]">
              {petsOfTheWeek.map((pet, index) => {
                const offset = index - activePetIndex
                const isActive = index === activePetIndex

                return (
                  <article
                    key={getPetId(pet)}
                    className={`absolute inset-0 overflow-hidden rounded-[28px] bg-white shadow-[0_22px_50px_rgba(15,42,68,0.16)] transition-all duration-500 ${isActive ? 'z-20 opacity-100' : 'z-10 opacity-70'
                      }`}
                    style={{
                      transform: `translateX(${offset * 18}px) rotate(${offset * 4}deg) scale(${isActive ? 1 : 0.92})`,
                    }}
                  >
                    <img
                      className="h-full w-full object-cover"
                      src={getPetImage(pet)}
                      alt={`Photo of ${pet.name}`}
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-white/65 p-5 backdrop-blur-sm max-sm:p-4">
                      <h3 className="m-0 font-serif text-[30px] text-[#0F2A44] max-sm:text-[30px]">
                        {pet.name}
                      </h3>
                      <p className="mt-1 mb-0 text-sm font-semibold text-[#2e5f8a]">
                        {pet.breed}
                      </p>
                      <p className="mt-3 mb-0 text-sm italic leading-6 text-[#67686d]">
                        {pet.blurb}
                      </p>
                      <p className="mt-3 mb-0 text-base text-[#6c6d72]">
                        Age: {formatPetAge(pet)}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            <div>
              <h2 className="m-0 font-serif text-[clamp(38px,4vw,58px)] leading-tight text-[#0F2A44]">
                Pets of the Week
              </h2>
              <h3 className="mt-3 mb-0 text-[22px] font-semibold leading-tight text-[#2e5f8a] max-sm:text-[20px]">
                Meet {activePet.name}
              </h3>

              <p className="mt-4 mb-0 text-[18px] leading-8 text-[#55585f] max-sm:text-base">
                Swipe through the pets of the week and choose who's story you'd like to see!
              </p>

              <div className="mt-6 flex flex-wrap gap-3 max-sm:flex-col">
                <button
                  type="button"
                  onClick={showPreviousPet}
                  className="rounded-full border-2 border-[#0F2A44] px-5 py-2.5 text-base font-semibold text-[#0F2A44]"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={showNextPet}
                  className="rounded-full border-2 border-[#0F2A44] px-5 py-2.5 text-base font-semibold text-[#0F2A44]"
                >
                  Next
                </button>

                <Link
                  to="/pets"
                  className="rounded-full border-2 border-transparent bg-[#ef767a] px-5 py-2.5 text-center text-base font-semibold text-white no-underline"
                >
                  I want to meet {activePet.name}!
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Link
            to="/pets"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F2A44] px-7 py-3 text-base font-semibold text-[#0F2A44] no-underline hover:bg-[#0F2A44] hover:text-white transition-colors"
          >
            View all pets <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>


      <section className="w-[min(1500px,calc(100%-96px))] mx-auto mt-10 rounded-[24px] border border-[rgba(15,42,68,0.12)] bg-[#f9fbfc] px-8 py-7 max-sm:w-[calc(100%-32px)] max-sm:px-5 max-sm:py-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Rescue partnerships</p>
            <h2 className="mt-3 mb-0 font-serif text-[clamp(30px,2.8vw,42px)] text-[#0F2A44]">Helping More Pets Find Homes</h2>
            <p className="mt-4 mb-0 max-w-[900px] text-[#55585f] text-[17px] leading-[1.65]">
              We bring adoptable pets from trusted local rescues like <strong>Lucky Dog Refuge </strong> and <strong>Muddy Paws Rescue</strong> into one easy-to-browse platform, making it simpler to find your match and connect directly with the rescue caring for them.         </p>
          </div>

          <div className="flex items-center justify-center gap-6 rounded-[20px] bg-white/70 p-5 max-sm:flex-col" aria-label="Rescue partner links">
            <a
              href="https://www.luckydogrefuge.com/"
              target="_blank"
              rel="noreferrer"
              className="flex h-[130px] w-[130px] items-center justify-center rounded-2xl border border-[#e3e4e7] bg-white p-3 transition-transform hover:-translate-y-1"
              aria-label="Visit Lucky Dog Refuge"
            >
              <img
                className="h-full w-full object-contain"
                src="/images/LDR.png"
                alt="Lucky Dog Refuge logo"
              />
            </a>
            <a
              href="https://www.muddypawsrescue.org/"
              target="_blank"
              rel="noreferrer"
              className="flex h-[130px] w-[130px] items-center justify-center rounded-2xl border border-[#e3e4e7] bg-white p-3 transition-transform hover:-translate-y-1"
              aria-label="Visit Muddy Paws Rescue"
            >
              <img
                className="h-full w-full object-contain"
                src="/images/MPR.png"
                alt="Muddy Paws Rescue logo"
              />
            </a>
          </div>
        </div>
      </section>


      <section id="how-adoption-works" className="mt-[48px] scroll-mt-8 pb-20">
        <div className="w-[min(1500px,calc(100%-96px))] mx-auto max-sm:w-[calc(100%-32px)]">
          <h2 className="mt-[120px] mb-[72px] text-center font-serif text-[clamp(46px,4.4vw,78px)] text-[#0F2A44] max-lg:mt-[72px]">
            How Adoption Works
          </h2>
          <div className="grid grid-cols-5 gap-6 text-center max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {[
              { num: '01', title: 'Find a Match', desc: 'Browse pets or take the quiz to find a good fit.' },
              { num: '02', title: 'View Profile', desc: 'Learn about their personality, needs, and shelter.' },
              { num: '03', title: 'Apply Online', desc: 'Share your home, experience, and adoption goals.' },
              { num: '04', title: 'Take Course', desc: 'Complete a short lesson before shelter review.' },
              { num: '05', title: 'Meet & Greet', desc: 'If approved, connect with the shelter to meet.' },
            ].map((step) => (
              <article key={step.num} className="flex flex-col items-center">
                <span className="step-badge-anim w-[68px] aspect-square rounded-[20px] mx-auto flex items-center justify-center bg-[#0F2A44] bg-opacity-90 text-[#f2f2f2] text-lg font-semibold shadow-[0_4px_14px_rgba(15,42,68,0.18)]">
                  {step.num}
                </span>
                <h3 className="mt-[18px] mb-0 min-h-[72px] font-serif text-[30px] leading-tight text-[#0F2A44] max-sm:min-h-0">{step.title}</h3>
                <p className="mt-[14px] mx-auto max-w-[235px] text-[#67686d] text-base leading-[1.45]">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


      <section className="w-[min(1500px,calc(100%-96px))] mx-auto mt-[34px] bg-[#2e5f8a] rounded-[24px] overflow-hidden flex items-stretch max-lg:flex-col max-sm:w-[calc(100%-32px)] max-sm:mt-5 max-sm:rounded-[20px]">
        <div className="text-[#f4f4f4] flex-[1_1_560px] flex flex-col justify-center px-[58px] py-[58px] max-sm:px-[22px] max-sm:py-[32px]">
          <p className="m-0 text-[#ef767a] text-sm font-semibold uppercase tracking-widest">
            Before you apply
          </p>
          <h2 className="mt-4 mb-0 font-serif text-[clamp(36px,3.6vw,62px)] leading-[1.12]">Adoption Education Course</h2>
          <p className="mt-5 text-[#cbcdd1] text-[18px] leading-[1.6] max-w-[540px]">
            Preview our free 15-minute course on responsible pet ownership. Once you apply for a pet and pass the quiz, the shelter will be able to review your results with your application
          </p>
          <Link
            to="/course"
            className="mt-7 self-start rounded-lg border-2 border-[rgba(255,255,255,0.5)] bg-transparent px-[22px] py-[9px] text-base font-semibold text-white cursor-pointer hover:bg-white hover:text-[#2e5f8a] transition-colors no-underline"
          >
            Preview Course
          </Link>
        </div>
        <div className="flex-[0_1_40%] min-h-[320px] max-lg:min-h-[240px] max-sm:flex max-sm:h-[190px] max-sm:min-h-0 max-sm:items-center max-sm:justify-center max-sm:overflow-hidden" aria-hidden="true">
          <DotLottieReact
            className="h-full w-full max-sm:h-[190px] max-sm:w-[min(360px,92vw)] max-sm:scale-125"
            src="https://lottie.host/3ecaa3bc-dc2a-461f-987a-c57f926c363b/oOrzY3DWX9.lottie"
            loop
            autoplay
          />
        </div>
      </section>

      <section className="w-[min(1500px,calc(100%-96px))] mx-auto mt-7 mb-6 overflow-hidden rounded-[28px] border border-[rgba(15,42,68,0.12)] bg-[#f9fbfc] max-sm:w-[calc(100%-32px)]">
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-white/70 px-8 py-8 max-sm:px-5 max-sm:py-6">
            <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Adoption prep</p>
            <h3 className="mt-3 mb-0 font-serif text-[clamp(30px,3vw,46px)] leading-tight text-[#0F2A44]">Prepare Your Home </h3>
            <p className="mt-4 mb-0 text-[#55585f] text-[17px] leading-[1.65]">
              A little preparation goes a long way. These tips can help you create a safe, comfortable, and welcoming space for your new pet.
            </p>
          </div>

          <div className="px-8 py-7 max-sm:px-5 max-sm:py-6">
            <div className="grid gap-5">
              {[
                { num: '01', title: 'Find a Veterinarian', desc: 'Choose a trusted veterinarian and schedule a wellness visit shortly after adoption.' },
                { num: '02', title: 'Create a Comfortable Space', desc: 'Set up food and water bowls, bedding, toys, and a quiet place where your pet can feel safe.' },
                { num: '03', title: 'Budget for Pet Care', desc: 'Consider pet insurance or an emergency fund before bills are urgent.' },
              ].map((item, index) => (
                <article key={item.title} className="relative flex gap-4">
                  {index < 2 && (
                    <span className="absolute left-6 top-12 h-[calc(100%+20px)] w-px bg-[#d7d7d9]" aria-hidden="true" />
                  )}
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F2A44] text-sm font-bold text-white">
                    {item.num}
                  </span>
                  <div className="rounded-[22px] bg-white p-4 shadow-[0_4px_18px_rgba(15,42,68,0.06)]">
                    <h4 className="m-0 font-serif text-[24px] leading-tight text-[#0F2A44]">{item.title}</h4>
                    <p className="mt-2 mb-0 text-sm leading-6 text-[#67686d]">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
