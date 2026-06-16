import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL || ''

const readApiError = async (response) => {
  try {
    const body = await response.json()
    return body?.message || `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

const getStatusLabel = (status) => {
  if (status === 'submitted') return 'Submitted'
  if (status === 'reviewing') return 'In Review'
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'withdrawn') return 'Withdrawn'
  return status || 'Unknown'
}

const getStatusClass = (status) => {
  if (status === 'submitted') return 'bg-[#cfe5ff] text-[#0F2A44]'
  if (status === 'reviewing') return 'bg-[#fff7eb] text-[#9a5b00]'
  if (status === 'approved') return 'bg-[#dff2df] text-[#274c2b]'
  if (status === 'rejected') return 'bg-[#ffdad9] text-[#a23b42]'
  return 'bg-[#ededee] text-[#6c6d72]'
}

const getCourseStatusLabel = (courseStatus) => {
  if (courseStatus === 'pending') return 'Course Pending'
  if (courseStatus === 'passed') return 'Course Passed'
  if (courseStatus === 'failed') return 'Course Failed'
  return 'Course Unknown'
}

const getCourseStatusClass = (courseStatus) => {
  if (courseStatus === 'pending') return 'bg-[#fff7eb] text-[#9a5b00]'
  if (courseStatus === 'passed') return 'bg-[#dff2df] text-[#274c2b]'
  if (courseStatus === 'failed') return 'bg-[#ffdad9] text-[#a23b42]'
  return 'bg-[#ededee] text-[#6c6d72]'
}

const getPetImage = (application) => application.petId?.imageUrl || '/images/dog.png'
const getPetName = (application) => application.petId?.name || 'Unknown pet'
const getShelterName = (application) => application.shelterId?.name || 'Shelter review team'

const Applications = () => {
  const { token } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setError('')
        setLoading(true)

        const response = await fetch(`${API_BASE_URL}/api/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(await readApiError(response))
        }

        const data = await response.json()
        setApplications(data.data || [])
      } catch (err) {
        setError(err.message || 'Could not load your applications.')
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [token])

  return (
    <section className="w-[min(1100px,calc(100%-96px))] mx-auto py-12 max-sm:w-[calc(100%-32px)] max-sm:py-8">
      <header className="mb-8">
        <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Adoption applications</p>
        <h1 className="mt-3 mb-0 font-serif text-[clamp(36px,4vw,58px)] leading-[1.1] text-[#0F2A44]">
          My Applications
        </h1>
        <p className="mt-4 mb-0 max-w-[720px] text-[#55585f] text-[18px] leading-[1.6] max-sm:text-[16px]">
          Track each pet you applied for, check your course status, and see where the shelter is in the review process.
        </p>
      </header>

      {loading && (
        <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
          Loading your applications...
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
          {error}
        </p>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="rounded-[20px] border border-[#d7d7d9] bg-white p-6">
          <h2 className="m-0 font-serif text-[30px] text-[#0F2A44]">No applications yet</h2>
          <p className="mt-3 mb-0 text-[#67686d] leading-7">
            When you apply for a pet, your application status will show here.
          </p>
          <Link
            to="/pets"
            className="mt-5 inline-flex rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] no-underline"
          >
            Browse Adoptable Pets
          </Link>
        </div>
      )}

      <div className="grid gap-5">
        {applications.map((application) => {
          const courseNeedsAttention = application.courseStatus === 'pending' || application.courseStatus === 'failed'

          return (
            <article key={application._id} className="overflow-hidden rounded-[20px] border border-[#d7d7d9] bg-white shadow-[0_2px_12px_rgba(15,42,68,0.07)]">
              <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                <img
                  src={getPetImage(application)}
                  alt={`Photo of ${getPetName(application)}`}
                  className="h-full min-h-[220px] w-full object-cover"
                />

                <div className="p-5 max-sm:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
                        {getShelterName(application)}
                      </p>
                      <h2 className="mt-2 mb-0 font-serif text-[34px] text-[#0F2A44] max-sm:text-[28px]">
                        {getPetName(application)}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusClass(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getCourseStatusClass(application.courseStatus)}`}>
                        {getCourseStatusLabel(application.courseStatus)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 mb-0 rounded-[14px] bg-[#f6f6f7] p-3 text-sm leading-6 text-[#55585f]">
                    {application.status === 'approved'
                      ? 'Good news. The shelter approved your application and should contact you with next steps.'
                      : 'The shelter can review your application after your course is passed.'}
                  </p>

                  {courseNeedsAttention && (
                    <Link
                      to={`/course?applicationId=${application._id}`}
                      className="mt-5 inline-flex rounded-lg border-2 border-transparent bg-[#ef767a] px-[18px] py-[10px] text-base font-semibold text-white no-underline max-sm:w-full max-sm:justify-center"
                    >
                      {application.courseStatus === 'failed' ? 'Retake Course' : 'Complete Course'}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Applications
