import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE_URL = (import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '')).replace(/\/$/, '')

const readApiError = async (response) => {
	try {
		const data = await response.json()
		return data?.message || `Request failed with status ${response.status}`
	} catch {
		return `Request failed with status ${response.status}`
	}
}

const submitCourseQuiz = async ({ applicationId, token, courseStatus }) => {
	const headers = {
		'Content-Type': 'application/json',
	}

	if (token) {
		headers.Authorization = `Bearer ${token}`
	}

	const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/course`, {
		method: 'PATCH',
		headers,
		body: JSON.stringify({ courseStatus }),
	})

	if (!response.ok) {
		throw new Error(await readApiError(response))
	}

	return response.json()
}

const COURSE_PAGES = [
	{
		title: 'Page 1: Welcome and first 7 days',
		paragraphs: [
			'The first week sets the tone for your pet. Most newly adopted pets are excited but also stressed, so your job is to make life predictable. Keep the home calm, keep voices gentle, and avoid introducing too many new people right away. Let your pet observe the home at their own pace while you reward calm behavior with praise and treats.',
			'Create a simple daily rhythm from day one: wake up, bathroom break or litter check, meals at regular times, short play or walk sessions, rest periods, and bedtime. Pets often feel safer when they can predict what comes next. A routine also helps you notice early warning signs like appetite changes, low energy, or trouble sleeping.',
			'Prepare a comfort zone such as a crate with an open door, a quiet corner bed, or a separate room with food, water, and toys. This safe space helps your pet decompress when they feel overwhelmed. Family members should know this is a no-disturb area, especially for children.',
			'As you start this week, set feeding times and a potty or litter schedule, build a quiet safe zone for rest, and keep social introductions slow so your pet can gain confidence without pressure.',
		],
	},
	{
		title: 'Page 2: Nutrition, hydration, and healthy body care',
		paragraphs: [
			'Good nutrition is one of the most important daily decisions you make. Choose complete and balanced food that matches your pet life stage. Sudden food changes can cause upset stomach, so if you switch food, do it gradually over weeks by mixing old and new portions.',
			'Fresh water should always be available. Clean bowls daily, and more often in warm weather. If you have multiple pets, provide multiple water stations to reduce guarding behavior. Tracking water intake can help you identify changes that may be helpful for your veterinarian to know.',
			'Body care includes brushing, nail trims, ear checks, dental care, and weight tracking. Short, regular grooming sessions are easier than occasional long ones and help your pet get comfortable being handled. If your pet is fearful, break care tasks into tiny steps and reward after each step.',
			'For everyday success, feed age-appropriate complete food, keep fresh water available all day, and build small weekly grooming and dental habits into your routine.',
		],
	},
	{
		title: 'Page 3: Vet care, prevention, and safety planning',
		paragraphs: [
			'Schedule a wellness exam within a couple days after adoption. Your vet can review vaccine history, parasite prevention, dental health, and any breed-specific concerns. Preventive care is often less stressful and less expensive than waiting for problems to become emergencies.',
			'Identification is essential. Use both a collar tag and a registered microchip. Tags can fall off and microchips can only help if contact details are current, so update records whenever your phone number or address changes. This simple step dramatically improves the chances of reuniting with your pet if they get lost.',
			'Home safety planning matters every day. Store cleaners and medications securely, keep unsafe foods out of reach, and supervise access to balconies, fences, and open doors. Build an emergency kit for your pet, also include a copy of medical records, and a backup caregiver contact.',
			'At minimum, book the first veterinary wellness visit, confirm that microchip and ID tag details are current.',
		],
	},
	{
		title: 'Page 4: Behavior, training, and lifelong support',
		paragraphs: [
			'Behavior is communication. Common issues like jumping, barking, scratching, or house accidents usually improve with consistent routines and clear teaching. Reward-based training is recommended because it teaches what to do instead of punishing mistakes. Keep sessions short, frequent, and positive.',
			'Exercise needs vary by age, breed, and health. Many pets need both physical activity and mental activity each day. Walks, sniffing games, puzzle feeders, and short training sessions help prevent boredom behaviors. If behavior suddenly changes, consider making an appointment with your vet.',
			'Pet care is a long-term relationship, not a one-time checklist. Revisit routines as your pet grows and ages. Senior pets may need different food, shorter but more frequent exercise, and regular comfort checks. Staying observant is the key to a happy and healthy home.',
			'Going forward, use reward-based training consistently, include both mental and physical enrichment every day, and review your care plan as your pet moves through different life stages.',
		],
	},
]

const QUIZ = [
	{
		question: 'What is the best first step after bringing a new pet home?',
		options: [
			'Wait a year before seeing a vet',
			'Schedule an early wellness exam with a veterinarian',
			'Change foods every day',
			'Skip parasite prevention',
		],
		answer: 1,
		explanation: 'An early checkup helps catch health needs and sets up preventive care.',
	},
	{
		question: 'What training approach is recommended for most pets?',
		options: [
			'Reward-based training',
			'Punishment for every mistake',
			'No structure at all',
			'Only train once a month',
		],
		answer: 0,
		explanation: 'Reward-based training builds trust and creates better long-term behavior.',
	},
	{
		question: 'Which statement about water is correct?',
		options: [
			'Fresh water should always be available',
			'Water is only needed after exercise',
			'Pets can share one bowl cleaned monthly',
			'Water can be replaced with milk',
		],
		answer: 0,
		explanation: 'Constant access to clean water is a daily health requirement.',
	},
	{
		question: 'Why are ID tags and microchips important?',
		options: [
			'They replace vet visits',
			'They make pets run faster',
			'They increase the chance of reunion if a pet gets lost',
			'They are only decorative',
		],
		answer: 2,
		explanation: 'Identification is one of the most effective lost-pet safety tools.',
	},
	{
		question: 'Which home setup is best for a newly adopted pet?',
		options: [
			'A chaotic space with no routine',
			'A safe, quiet area and a simple daily routine',
			'Unlimited unsupervised outdoor time on day one',
			'No exercise until next month',
		],
		answer: 1,
		explanation: 'Structure and a calm area help reduce stress during transition.',
	},
	{
		question: 'Which change should trigger closer attention and possible vet contact?',
		options: [
			'Skipping one toy',
			'Normal nap times',
			'Sudden appetite or behavior changes',
			'Wanting to play',
		],
		answer: 2,
		explanation: 'Sudden changes can be early signs of illness or discomfort.',
	},
]

const Course = () => {
	const { token, isAuthenticated } = useAuth()
	const [searchParams] = useSearchParams()
	const [pageIndex, setPageIndex] = useState(0)
	const [answers, setAnswers] = useState({})
	const [submitted, setSubmitted] = useState(false)
	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState('')
	const [saveMessage, setSaveMessage] = useState('')

	const lessonCount = COURSE_PAGES.length
	const isQuizPage = pageIndex === lessonCount
	const activePage = COURSE_PAGES[pageIndex]
	const applicationId = searchParams.get('applicationId') || ''
	const hasApplicationContext = Boolean(applicationId)

	const score = useMemo(() => {
		return QUIZ.reduce((total, item, index) => {
			return total + (answers[index] === item.answer ? 1 : 0)
		}, 0)
	}, [answers])

	const isComplete = Object.keys(answers).length === QUIZ.length
	const passed = score >= 4
	const canSubmitForApplication = isComplete && isAuthenticated && hasApplicationContext && !saving

	const setAnswer = (questionIndex, optionIndex) => {
		setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))
	}

	const resetQuiz = () => {
		setAnswers({})
		setSubmitted(false)
		setSaveError('')
		setSaveMessage('')
	}

	const handleSubmit = async () => {
		setSaveError('')
		setSaveMessage('')

		if (!hasApplicationContext) {
			setSaveError('This preview is not attached to an animal. Apply for a specific pet first so your course result can be saved.')
			return
		}

		if (!isAuthenticated) {
			setSaveError('Sign in before sending course results for this application.')
			return
		}

		setSubmitted(true)
		setSaving(true)
		const courseStatus = passed ? 'passed' : 'failed'

		try {
			const response = await submitCourseQuiz({
				applicationId,
				token,
				courseStatus,
			})

			const savedCourseStatus = response?.data?.courseStatus
			if (savedCourseStatus) {
				setSaveMessage(`Course result saved: ${savedCourseStatus}.`)
			} else {
				setSaveMessage('Course result saved.')
			}
		} catch (error) {
			setSaveError(error.message || 'Could not save course results.')
		} finally {
			setSaving(false)
		}
	}

	const goNext = () => {
		if (pageIndex < lessonCount) {
			setPageIndex((prev) => prev + 1)
		}
	}

	const goBack = () => {
		if (pageIndex > 0) {
			setPageIndex((prev) => prev - 1)
		}
	}

	return (
		<section className="w-[min(1200px,calc(100%-96px))] mx-auto py-12 max-sm:w-[calc(100%-32px)] max-sm:py-8">
			<header className="mb-8">
				<p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Adoption course</p>
				<h1 className="mt-3 mb-0 font-serif text-[clamp(36px,4vw,62px)] leading-[1.1] text-[#0F2A44]">
					Pet Care Basics
				</h1>
				<p className="mt-4 mb-0 max-w-[760px] text-[#55585f] text-[18px] leading-[1.6] max-sm:text-[16px]">
					This guided course is open for learning at any time. To record completion for an adoption, start from a specific pet application so the result attaches to that animal.
				</p>
			</header>

			{!hasApplicationContext && (
				<div className="mb-6 rounded-[16px] border border-[#f3d3a6] bg-[#fff7eb] p-4 text-[#7a5208]">
					<p className="m-0 text-sm font-semibold uppercase tracking-wider">Preview mode</p>
					<p className="mt-2 mb-0 text-[16px] leading-6">
						You can read the course here, but quiz completion will not count toward an adoption until you apply for a specific pet.
					</p>
					<Link
						to="/pets"
						className="mt-3 inline-flex rounded-lg border-2 border-[#7a5208] px-4 py-2 text-sm font-semibold text-[#7a5208] no-underline"
					>
						Choose a pet to apply
					</Link>
				</div>
			)}

			<div className="mb-5 text-sm text-[#67686d]">
				<p className="m-0">Step {Math.min(pageIndex + 1, lessonCount + 1)} of {lessonCount + 1}</p>
			</div>

			{!isQuizPage && (
				<article className="rounded-[16px] border border-[#d7d7d9] bg-white p-6 max-sm:p-4">
					<h2 className="m-0 font-serif text-[32px] text-[#0F2A44] max-sm:text-[26px]">{activePage.title}</h2>
					<div className="mt-5 grid gap-4">
						{activePage.paragraphs.map((paragraph) => (
							<p key={paragraph} className="m-0 text-[#55585f] text-[17px] leading-[1.8] max-sm:text-[16px]">
								{paragraph}
							</p>
						))}
					</div>
				</article>
			)}

			{isQuizPage && (
				<section className="rounded-[16px] border border-[#d7d7d9] bg-[#f9fbfc] p-6 max-sm:p-4">
					<h2 className="m-0 font-serif text-[34px] text-[#0F2A44] max-sm:text-[28px]">Final knowledge check</h2>
					<p className="mt-2 mb-0 text-[#67686d] text-[16px]">Answer all questions. Passing score: 4 out of 6.</p>
					{applicationId && (
						<p className="mt-2 mb-0 text-[#67686d] text-[14px]">Application: {applicationId}</p>
					)}
					{!hasApplicationContext && (
						<p className="mt-3 mb-0 rounded-lg border border-[#f3d3a6] bg-[#fff7eb] p-3 text-sm text-[#7a5208]">
							This quiz is disabled in preview mode. Apply for a pet first to save a course result for that animal.
						</p>
					)}
					{hasApplicationContext && !isAuthenticated && (
						<p className="mt-3 mb-0 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
							Sign in to submit this course result for the application.
						</p>
					)}

					<div className="mt-6 grid gap-5">
						{QUIZ.map((item, questionIndex) => (
							<article key={item.question} className="rounded-xl border border-[#d7d7d9] bg-white p-4 max-sm:p-3">
								<h3 className="m-0 text-[#0F2A44] text-[19px] font-semibold max-sm:text-[17px]">{questionIndex + 1}. {item.question}</h3>
								<div className="mt-3 grid gap-2">
									{item.options.map((option, optionIndex) => (
										<label key={option} className="flex items-center gap-3 text-[#2f3034] cursor-pointer max-sm:items-start">
											<input
												type="radio"
												name={`question-${questionIndex}`}
												checked={answers[questionIndex] === optionIndex}
												onChange={() => setAnswer(questionIndex, optionIndex)}
												className="w-4 h-4 accent-[#2e5f8a]"
											/>
											<span>{option}</span>
										</label>
									))}
								</div>
								{submitted && (
									<p className="mt-3 mb-0 text-sm text-[#55585f]">
										{answers[questionIndex] === item.answer ? 'Correct.' : 'Not quite.'} {item.explanation}
									</p>
								)}
							</article>
						))}
					</div>

					<div className="mt-6 flex flex-wrap items-center gap-3 max-sm:flex-col max-sm:items-stretch">
						<button
							type="button"
							onClick={handleSubmit}
							disabled={!canSubmitForApplication}
							className="rounded-lg border-2 border-[#45464a] bg-white px-5 py-2.5 text-base font-semibold text-[#2f3034] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{saving ? 'Saving...' : 'Submit for application'}
						</button>
						<button
							type="button"
							onClick={resetQuiz}
							className="rounded-lg border border-[#c5c6cb] bg-transparent px-5 py-2.5 text-base text-[#2f3034]"
						>
							Reset quiz
						</button>
					</div>

					{saveError && (
						<p className="mt-4 mb-0 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
							{saveError}
						</p>
					)}

					{saveMessage && (
						<p className="mt-4 mb-0 rounded-lg border border-[#d7d7d9] bg-white p-3 text-sm text-[#2f3034]">
							{saveMessage}
						</p>
					)}

					{submitted && (
						<div className="mt-5 rounded-lg border border-[#d7d7d9] bg-white p-4">
							<p className="m-0 text-[#0F2A44] text-lg font-semibold">Your score: {score} / {QUIZ.length}</p>
							<p className="mt-2 mb-0 text-[#55585f]">
								{passed
									? 'Great job. You passed this course section and are ready for the next adoption step.'
									: 'Please review the lesson pages and try again. You are close.'}
							</p>
							<Link
								to="/pets"
								className="inline-flex mt-4 rounded-lg border-2 border-[#0F2A44] px-5 py-2.5 text-[#0F2A44] no-underline font-semibold"
							>
								Continue to pets
							</Link>
						</div>
					)}
				</section>
			)}

			<div className="mt-6 flex items-center justify-between gap-3 max-sm:flex-col-reverse max-sm:items-stretch">
				<button
					type="button"
					onClick={goBack}
					disabled={pageIndex === 0}
					className="rounded-lg border border-[#c5c6cb] bg-white px-5 py-2.5 text-base text-[#2f3034] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>
				<button
					type="button"
					onClick={goNext}
					disabled={isQuizPage}
					className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-5 py-2.5 text-base font-semibold text-[#2f3034] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{pageIndex === lessonCount - 1 ? 'Go to quiz' : 'Next page'}
				</button>
			</div>

			<p className="mt-6 mb-0 text-sm text-[#7a7c84]">
				Course topics and quiz themes were based on commonly recommended pet-care practices from veterinary and animal welfare guidance.
			</p>
		</section>
	)
}

export default Course
