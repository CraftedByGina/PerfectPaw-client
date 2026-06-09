import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'


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
          const url = shelterId
            ? `/api/pets?status=${status}&shelterId=${shelterId}`
            : `/api/pets?status=${status}`

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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  if (loading) {
    return (
      <section className="container mx-auto px-4">
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
    <section className="container mx-auto px-4">
      <h1 className="text-2xl font-bold">Shelter Dashboard</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleLogout}>Logout</button>
    </section>
  )
}

export default ShelterDashboard
