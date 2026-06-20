import { useEffect, useState } from 'react'
import { Link } from 'react-router'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = import.meta.env.DEV ? '' : RAW_API_BASE_URL

const joinUrl = (base, path) => {
    const cleanBase = String(base || '').replace(/\/+$/, '')
    const cleanPath = String(path || '').replace(/^\/+/, '')
    return `${cleanBase}/${cleanPath}`
}

const defaultAnswers = {
    homeVibe: '',
    weekendStyle: '',
    hobbies: [],
    energyMatch: '',
    homeType: '',
    hasKids: false,
    hasOtherPets: false,
    preferredSpecies: '',
    preferredSize: '',
    hoursAwayFromHome: '',
}

const quizSteps = [
    'Your Home',
    'Your Lifestyle',
    'Your Hobbies',
    'Pet Energy',
    'Preferences',
]

const PetMatch = () => {
    const [stepIndex, setStepIndex] = useState(0)
    const [answers, setAnswers] = useState(defaultAnswers)
    const [pets, setPets] = useState([])
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadPets = async () => {
            try {
                const response = await fetch(joinUrl(API_BASE_URL, '/api/pets'))
                const data = await response.json()
                setPets(Array.isArray(data) ? data : data?.pets || data?.data || [])
            } catch {
                setPets([])
            }
        }

        loadPets()
    }, [])

    const updateAnswer = (name, value) => {
        setAnswers((currentAnswers) => ({
            ...currentAnswers,
            [name]: value,
        }))
    }

    const toggleArrayAnswer = (name, value) => {
        setAnswers((currentAnswers) => {
            const currentList = currentAnswers[name]

            if (currentList.includes(value)) {
                return {
                    ...currentAnswers,
                    [name]: currentList.filter((item) => item !== value),
                }
            }

            return {
                ...currentAnswers,
                [name]: [...currentList, value],
            }
        })
    }

    const goNext = () => {
        if (stepIndex < quizSteps.length - 1) {
            setStepIndex(stepIndex + 1)
        }
    }

    const goBack = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1)
        }
    }
    const resetQuiz = () => {
        setStepIndex(0)
        setAnswers(defaultAnswers)
        setResult(null)
        setError('')
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const response = await fetch(joinUrl(API_BASE_URL, '/api/agent/match'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answers),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.message || 'Could not find matches right now.')
            }

            setResult(data)
        } catch (err) {
            setError(err.message || 'Could not find matches right now.')
        } finally {
            setLoading(false)
        }
    }

    const matchedPets = (result?.matches || [])
        .map((match) => {
            const foundPet = pets.find((pet) => String(pet._id || pet.id) === String(match.petId))

            if (!foundPet) {
                return null
            }

            return {
                petId: match.petId,
                pet: foundPet,
                matchScore: match.matchScore,
                reason: match.reason,
                idealHome: match.idealHome,
            }
        })
        .filter(Boolean)

    const currentStepName = quizSteps[stepIndex]
    const progressPercent = ((stepIndex + 1) / quizSteps.length) * 100

    return (
        <section className="min-h-screen bg-[#f2f2f2] px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <Link to="/pets" className="text-sm font-semibold text-[#2e5f8a]">
                    Back to all pets
                </Link>

                <div className="mt-6 rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(15,42,68,0.06)]">
                    <p className="text-sm font-bold uppercase tracking-wider text-[#ef767a]">
                        PerfectPaw Match Quiz
                    </p>

                    <h1 className="mt-2 font-serif text-[clamp(36px,6vw,64px)] leading-tight text-[#0F2A44]">
                        Find a pet that fits your real life.
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg leading-8 text-[#67686d]">
                        Answer a few questions and our matchmaking assistant will suggest pets based on your home, hobbies, and personality.
                    </p>

                    <div className="mt-8">
                        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#67686d]">
                            <span>{currentStepName}</span>
                            <span>Step {stepIndex + 1} of {quizSteps.length}</span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-[#ededee]">
                            <div
                                className="h-full rounded-full bg-[#2e5f8a] transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        {stepIndex === 0 && (
                            <div>
                                <h2 className="font-serif text-3xl text-[#0F2A44]">What is your home like?</h2>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {['quiet and cozy', 'busy and social', 'relaxed family home', 'outdoorsy and active', 'apartment life'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => updateAnswer('homeVibe', option)}
                                            className={`rounded-2xl border p-4 text-left font-semibold ${answers.homeVibe === option
                                                ? 'border-[#2e5f8a] bg-[#cfe5ff] text-[#0F2A44]'
                                                : 'border-[#d7d7d9] bg-white text-[#67686d]'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <label className="flex items-center gap-3 rounded-2xl border border-[#d7d7d9] p-4 font-semibold text-[#0F2A44]">
                                        <input
                                            type="checkbox"
                                            checked={answers.hasKids}
                                            onChange={(event) => updateAnswer('hasKids', event.target.checked)}
                                        />
                                        I have kids at home
                                    </label>

                                    <label className="flex items-center gap-3 rounded-2xl border border-[#d7d7d9] p-4 font-semibold text-[#0F2A44]">
                                        <input
                                            type="checkbox"
                                            checked={answers.hasOtherPets}
                                            onChange={(event) => updateAnswer('hasOtherPets', event.target.checked)}
                                        />
                                        I have other pets
                                    </label>
                                </div>
                            </div>
                        )}

                        {stepIndex === 1 && (
                            <div>
                                <h2 className="font-serif text-3xl text-[#0F2A44]">What does your ideal weekend look like?</h2>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {['hiking or long walks', 'coffee shop and couch', 'hosting friends', 'reading or gaming indoors', 'park days', 'road trips'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => updateAnswer('weekendStyle', option)}
                                            className={`rounded-2xl border p-4 text-left font-semibold ${answers.weekendStyle === option
                                                ? 'border-[#2e5f8a] bg-[#cfe5ff] text-[#0F2A44]'
                                                : 'border-[#d7d7d9] bg-white text-[#67686d]'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stepIndex === 2 && (
                            <div>
                                <h2 className="font-serif text-3xl text-[#0F2A44]">Pick a few things you enjoy.</h2>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    {['walking', 'hiking', 'running', 'gardening', 'reading', 'gaming', 'watching movies', 'working from home', 'traveling'].map((hobby) => (
                                        <button
                                            key={hobby}
                                            type="button"
                                            onClick={() => toggleArrayAnswer('hobbies', hobby)}
                                            className={`rounded-full border px-4 py-3 text-sm font-semibold ${answers.hobbies.includes(hobby)
                                                ? 'border-[#2e5f8a] bg-[#2e5f8a] text-white'
                                                : 'border-[#d7d7d9] bg-white text-[#67686d]'
                                                }`}
                                        >
                                            {hobby}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stepIndex === 3 && (
                            <div>
                                <h2 className="font-serif text-3xl text-[#0F2A44]">What kind of pet energy feels right?</h2>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {['couch buddy', 'playful but manageable', 'adventure partner', 'independent roommate', 'high-energy athlete'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => updateAnswer('energyMatch', option)}
                                            className={`rounded-2xl border p-4 text-left font-semibold ${answers.energyMatch === option
                                                ? 'border-[#2e5f8a] bg-[#cfe5ff] text-[#0F2A44]'
                                                : 'border-[#d7d7d9] bg-white text-[#67686d]'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stepIndex === 4 && (
                            <div>
                                <h2 className="font-serif text-3xl text-[#0F2A44]">Any preferences?</h2>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-2 font-semibold text-[#0F2A44]">
                                        Home type
                                        <select
                                            value={answers.homeType}
                                            onChange={(event) => updateAnswer('homeType', event.target.value)}
                                            className="rounded-xl border border-[#d7d7d9] px-3 py-3"
                                        >
                                            <option value="">No preference</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="house">House</option>
                                            <option value="house with yard">House with yard</option>
                                        </select>
                                    </label>

                                    <label className="grid gap-2 font-semibold text-[#0F2A44]">
                                        Preferred species
                                        <select
                                            value={answers.preferredSpecies}
                                            onChange={(event) => updateAnswer('preferredSpecies', event.target.value)}
                                            className="rounded-xl border border-[#d7d7d9] px-3 py-3"
                                        >
                                            <option value="">Either</option>
                                            <option value="Dog">Dog</option>
                                            <option value="Cat">Cat</option>
                                        </select>
                                    </label>

                                    <label className="grid gap-2 font-semibold text-[#0F2A44]">
                                        Preferred size
                                        <select
                                            value={answers.preferredSize}
                                            onChange={(event) => updateAnswer('preferredSize', event.target.value)}
                                            className="rounded-xl border border-[#d7d7d9] px-3 py-3"
                                        >
                                            <option value="">Any size</option>
                                            <option value="Small">Small</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Large">Large</option>
                                        </select>
                                    </label>

                                    <label className="grid gap-2 font-semibold text-[#0F2A44]">
                                        Hours away from home
                                        <select
                                            value={answers.hoursAwayFromHome}
                                            onChange={(event) => updateAnswer('hoursAwayFromHome', event.target.value)}
                                            className="rounded-xl border border-[#d7d7d9] px-3 py-3"
                                        >
                                            <option value="">Not sure</option>
                                            <option value="0-2 hours">0-2 hours</option>
                                            <option value="3-5 hours">3-5 hours</option>
                                            <option value="6-8 hours">6-8 hours</option>
                                            <option value="8+ hours">8+ hours</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        )}
                        {!result && (
                            <div className="mt-8 flex flex-wrap justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    disabled={stepIndex === 0 || result}
                                    className="rounded-full border border-[#d7d7d9] px-6 py-3 font-semibold text-[#67686d] disabled:opacity-40"
                                >
                                    Back
                                </button>


                                {stepIndex < quizSteps.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        className="rounded-full bg-[#2e5f8a] px-6 py-3 font-semibold text-white"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="rounded-full bg-[#ef767a] px-6 py-3 font-semibold text-white disabled:opacity-60"
                                    >
                                        {loading ? 'Finding matches...' : 'Find my matches'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                            {error}
                        </p>
                    )}
                    {result && (
                        <button
                            type="button"
                            onClick={resetQuiz}
                            className="mt-6 rounded-full border border-[#d7d7d9] px-6 py-3 font-semibold text-[#67686d]"
                        >
                            Reset quiz
                        </button>
                    )}

                    {result?.quizSummary && (
                        <div className="mt-8 rounded-3xl bg-[#f2f2f2] p-6">
                            <p className="text-sm font-bold uppercase tracking-wider text-[#ef767a]">
                                Based on your answers
                            </p>

                            <p className="mt-2 text-lg font-semibold text-[#0F2A44]">
                                {result.quizSummary}
                            </p>
                        </div>
                    )}

                    {matchedPets.length > 0 && (
                        <div className="mt-6 grid gap-5">
                            {matchedPets.map((match) => (
                                <article key={match.petId} className="overflow-hidden rounded-3xl border border-[#d7d7d9] bg-white shadow-sm sm:flex">
                                    <img
                                        src={match.pet.imageUrl || '/images/dog.png'}
                                        alt={`Photo of ${match.pet.name}`}
                                        className="h-56 w-full object-cover sm:h-auto sm:w-56"
                                    />

                                    <div className="p-5">
                                        <h3 className="font-serif text-3xl text-[#0F2A44]">
                                            {match.pet.name} - {match.matchScore}% match
                                        </h3>

                                        <p className="mt-3 text-[#67686d]">
                                            {match.reason}
                                        </p>

                                        <p className="mt-3 font-semibold text-[#2e5f8a]">
                                            Ideal home: {match.idealHome}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default PetMatch