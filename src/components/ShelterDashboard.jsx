import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
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
  Menu,
  X,
  Syringe,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL || ''

const readApiError = async (response) => {
  try {
    const body = await response.json()
    return body?.message || `Request failed (${response.status})`
  } catch (error) {
    console.error(error)
    return `Request failed (${response.status})`
  }
}

const readSavePetError = async (response) => {
  const message = await readApiError(response)

  if (response.status === 500) {
    return `${message}. Check Render logs and Cloudinary upload configuration.`
  }

  return message
}

const MAX_PET_IMAGE_SIZE_MB = 10
const MAX_PET_IMAGE_SIZE_BYTES = MAX_PET_IMAGE_SIZE_MB * 1024 * 1024

const getAgeGroupFromMonths = (ageMonths) => {
  if (ageMonths < 12) return 'Puppy'
  if (ageMonths < 36) return 'Young'
  if (ageMonths < 96) return 'Adult'
  return 'Senior'
}

const formatPetAge = (pet) => {
  const ageMonths = Number(pet.ageMonths || (pet.age ? pet.age * 12 : 0))

  if (!ageMonths) return 'Age unknown'

  if (ageMonths < 12) {
    return `${ageMonths} month${ageMonths === 1 ? '' : 's'}`
  }

  const years = Math.floor(ageMonths / 12)
  return `${years} year${years === 1 ? '' : 's'}`
}

const getPetFormDefaults = () => ({
  name: '',
  breed: '',
  species: 'Dog',
  sex: 'Male',
  ageAmount: '',
  ageUnit: 'months',
  size: 'Medium',
  energyLevel: 'Medium',
  goodForApartments: 'unknown',
  goodWithKids: 'unknown',
  goodWithOtherPets: 'unknown',
  exerciseNeeds: 'Moderate',
  imageFile: null,
  traits: '',
  blurb: '',
})

const getAgeFormValues = (pet) => {
  const ageMonths = Number(pet.ageMonths || (pet.age ? pet.age * 12 : 0))

  if (!ageMonths) {
    return {
      ageAmount: '',
      ageUnit: 'months',
    }
  }

  if (ageMonths < 12 || ageMonths % 12 !== 0) {
    return {
      ageAmount: String(ageMonths),
      ageUnit: 'months',
    }
  }

  return {
    ageAmount: String(Math.floor(ageMonths / 12)),
    ageUnit: 'years',
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
  const [showPetForm, setShowPetForm] = useState(false)
  const [creatingPet, setCreatingPet] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [deletingPetId, setDeletingPetId] = useState('')
  const [petFormError, setPetFormError] = useState('')
  const [petFormData, setPetFormData] = useState(getPetFormDefaults)
  const [petImagePreviewUrl, setPetImagePreviewUrl] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    if (!petFormData.imageFile) {
      setPetImagePreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(petFormData.imageFile)
    setPetImagePreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [petFormData.imageFile])

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError('Please log in as a shelter admin.')
        setLoading(false)
        return
      }

      try {
        setError('')

        const shelterRes = await fetch(`${API_BASE_URL}/api/shelters/me`, {
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

        const appRes = await fetch(`${API_BASE_URL}/api/applications`, {
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
          const url = `${API_BASE_URL}/api/pets?status=${status}&shelterId=${myShelter._id}`

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
  const applicationsToShow = activeNavItem === 'applications' ? applications : recentApplications
  const previewPets = pets.slice(0, 3)
  const petsToShow = activeNavItem === 'pets' ? pets : previewPets
  const showDashboard = activeNavItem === 'dashboard'
  const showApplications = activeNavItem === 'dashboard' || activeNavItem === 'applications'
  const showPetListings = activeNavItem === 'dashboard' || activeNavItem === 'pets'
  const isEditingPet = Boolean(editingPet)
  let petSubmitLabel = 'Create Pet'

  if (creatingPet) {
    petSubmitLabel = isEditingPet ? 'Saving...' : 'Creating...'
  } else if (isEditingPet) {
    petSubmitLabel = 'Save Changes'
  }
  const petImagePreviewSrc = petImagePreviewUrl || (isEditingPet ? editingPet?.imageUrl || '' : '')

  const getApplicationPetName = (application) => application.petId?.name || 'Unknown Pet'
  const getApplicationApplicantName = (application) => application.adopterId?.fullName || 'Unknown Applicant'
  const getPetInitial = (name) => (name || '?').charAt(0).toUpperCase()
  const getPetImage = (pet) => pet.imageUrl || '/images/dog.png'
  const getPetTraits = (pet) => (Array.isArray(pet.traits) ? pet.traits.filter(Boolean).slice(0, 3) : [])
  const formatYesNo = (value) => (value ? 'Yes' : 'No')
  const getApplicationAddress = (application) => (
    [
      application.address,
      application.city,
      application.state,
      application.zipCode,
    ].filter(Boolean).join(', ') || 'Not provided'
  )
  const getStatusLabel = (status) => {
    if (status === 'submitted') return 'New'
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
    if (status === 'withdrawn') return 'bg-[#ededee] text-[#6c6d72]'
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

  const handleReviewApplication = async (applicationId, nextStatus) => {
    try {
      setError('')
      setProcessingApplicationId(applicationId)

      const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not update application status ')
      }

      const updatedApplication = data.data

      setApplications((currentApplications) =>
        currentApplications.map((application) => {
          if (application._id !== applicationId) {
            return application
          }
          return {
            ...application,
            status: updatedApplication.status,
            courseStatus: updatedApplication.courseStatus,
          }
        })
      )
      setSelectedApplication((currentApplication) => {
        if (!currentApplication || currentApplication._id !== applicationId) {
          return currentApplication
        }

        return {
          ...currentApplication,
          status: updatedApplication.status,
          courseStatus: updatedApplication.courseStatus,
        }
      })
    } catch (err) {
      setError(err.message || 'Could not update application.')
    } finally {
      setProcessingApplicationId('')
    }
  }

  const handleSavePet = async (event) => {
    event.preventDefault()
    setPetFormError('')

    try {
      setError('')
      setCreatingPet(true)

      const ageMonths = petFormData.ageUnit === 'years'
        ? Number(petFormData.ageAmount) * 12
        : Number(petFormData.ageAmount)

      if (!petFormData.name.trim()) {
        setPetFormError('Pet name is required.')
        setCreatingPet(false)
        return
      }

      if (!petFormData.ageAmount || Number.isNaN(ageMonths)) {
        setPetFormError('Enter the pet age.')
        setCreatingPet(false)
        return
      }

      if (petFormData.ageUnit === 'months' && (ageMonths < 1 || ageMonths > 12)) {
        setPetFormError('Age in months must be between 1 and 12.')
        setCreatingPet(false)
        return
      }

      if (petFormData.ageUnit === 'years' && (Number(petFormData.ageAmount) < 1 || Number(petFormData.ageAmount) > 20)) {
        setPetFormError('Age in years must be between 1 and 20.')
        setCreatingPet(false)
        return
      }

      if (!isEditingPet && !petFormData.imageFile) {
        setPetFormError('Upload a pet photo before creating the listing.')
        setCreatingPet(false)
        return
      }

      if (petFormData.imageFile && !petFormData.imageFile.type.startsWith('image/')) {
        setPetFormError('Uploaded pet photo must be an image file.')
        setCreatingPet(false)
        return
      }

      if (petFormData.imageFile && petFormData.imageFile.size > MAX_PET_IMAGE_SIZE_BYTES) {
        setPetFormError(`Uploaded pet photo must be smaller than ${MAX_PET_IMAGE_SIZE_MB} MB.`)
        setCreatingPet(false)
        return
      }

      if (petFormData.blurb.trim() && petFormData.blurb.trim().length < 10) {
        setPetFormError('Short blurb should be at least 10 characters, or leave it blank.')
        setCreatingPet(false)
        return
      }

      const requestBody = {
        name: petFormData.name.trim(),
        breed: petFormData.breed.trim(),
        species: petFormData.species,
        sex: petFormData.sex,
        ageMonths,
        ageGroup: getAgeGroupFromMonths(ageMonths),
        size: petFormData.size,
        energyLevel: petFormData.energyLevel,
        goodForApartments: petFormData.goodForApartments,
        goodWithKids: petFormData.goodWithKids,
        goodWithOtherPets: petFormData.goodWithOtherPets,
        exerciseNeeds: petFormData.exerciseNeeds,
        traits: petFormData.traits
          .split(',')
          .map((trait) => trait.trim())
          .filter(Boolean),
        blurb: petFormData.blurb.trim(),
        status: isEditingPet ? editingPet.status || 'available' : 'available',
      }

      const formData = new FormData()
      Object.entries(requestBody).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
          return
        }

        formData.append(key, value)
      })

      if (petFormData.imageFile) {
        formData.append('image', petFormData.imageFile)
      }

      const url = isEditingPet ? `${API_BASE_URL}/api/pets/${editingPet._id}` : `${API_BASE_URL}/api/pets`
      const method = isEditingPet ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await readSavePetError(response))
      }

      const data = await response.json()

      if (isEditingPet) {
        setPets((currentPets) =>
          currentPets.map((pet) => (pet._id === data.data._id ? data.data : pet))
        )
      } else {
        setPets((currentPets) => [data.data, ...currentPets])
      }

      setPetFormData(getPetFormDefaults())
      setEditingPet(null)
      setShowPetForm(false)
    } catch (err) {
      setError(err.message || 'Could not save pet.')
    } finally {
      setCreatingPet(false)
    }
  }

  const openCreatePetForm = () => {
    setEditingPet(null)
    setPetFormData(getPetFormDefaults())
    setPetFormError('')
    setShowPetForm(true)
  }

  const openEditPetForm = (pet) => {
    const ageValues = getAgeFormValues(pet)

    setEditingPet(pet)
    setPetFormError('')
    setPetFormData({
      name: pet.name || '',
      breed: pet.breed || '',
      species: pet.species || 'Dog',
      sex: pet.sex || 'Male',
      ageAmount: ageValues.ageAmount,
      ageUnit: ageValues.ageUnit,
      size: pet.size || 'Medium',
      energyLevel: pet.energyLevel || 'Medium',
      goodForApartments: pet.goodForApartments || 'unknown',
      goodWithKids: pet.goodWithKids || 'unknown',
      goodWithOtherPets: pet.goodWithOtherPets || 'unknown',
      exerciseNeeds: pet.exerciseNeeds || 'Moderate',
      imageFile: null,
      traits: Array.isArray(pet.traits) ? pet.traits.join(', ') : '',
      blurb: pet.blurb || '',
    })
    setShowPetForm(true)
  }

  const closePetForm = () => {
    if (creatingPet) return

    setShowPetForm(false)
    setEditingPet(null)
    setPetFormData(getPetFormDefaults())
    setPetFormError('')
  }

  const handleDeletePet = async (pet) => {
    const confirmed = window.confirm(`Delete ${pet.name}? This cannot be undone.`)

    if (!confirmed) return

    try {
      setError('')
      setDeletingPetId(pet._id)

      const response = await fetch(`${API_BASE_URL}/api/pets/${pet._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      setPets((currentPets) => currentPets.filter((currentPet) => currentPet._id !== pet._id))
    } catch (err) {
      setError(err.message || 'Could not delete pet.')
    } finally {
      setDeletingPetId('')
    }
  }

  const handlePetFormChange = (event) => {
    const { files, name, type, value } = event.target

    setPetFormData((currentData) => ({
      ...currentData,
      [name]: type === 'file' ? files?.[0] || null : value,
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const selectedApplicationIsProcessing = selectedApplication && processingApplicationId === selectedApplication._id
  const selectedApplicationIsFinal = selectedApplication && ['approved', 'rejected', 'withdrawn'].includes(selectedApplication.status)
  const selectedApplicationCanStartReview = selectedApplication?.status === 'submitted'
  const selectedApplicationCanApprove = selectedApplication && !selectedApplicationIsFinal && selectedApplication.courseStatus === 'passed'
  const selectedApplicationCanReject = selectedApplication && !selectedApplicationIsFinal

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#f5f3f0] px-6 py-12">
        <div className="w-[min(340px,76vw)] text-center">
          <DotLottieReact
            src="https://lottie.host/800b5304-413b-4ae4-bd51-4d057ec4e6e0/WmITjU5Fgi.lottie"
            loop
            autoplay
          />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5f8a]">
            Loading your dashboard
          </p>
        </div>
      </section>
    )
  }

  if (shelter && shelter.approvalStatus === 'pending') {
    return (
      <section className="min-h-screen bg-[#f5f3f0] px-6 py-12 max-sm:px-4 max-sm:py-8">
        <div className="mx-auto max-w-3xl rounded-[20px] border border-[#d7d7d9] bg-white p-8 shadow-[0_2px_12px_rgba(15,42,68,0.07)] max-sm:p-5">
          <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
            Shelter application
          </p>
          <h1 className="mt-3 mb-0 font-serif text-[42px] text-[#0F2A44] max-sm:text-[34px]">
            Your application is pending review
          </h1>
          <p className="mt-4 text-[#67686d] text-lg leading-7 max-sm:text-base">
            Thanks for registering {shelter.name}. A Perfect Paw Administrator needs to approve your shelter before you have access to this platform.
          </p>
          <div className="mt-6 rounded-lg bg-[#fff7eb] border border-[#f3d3a6] p-4 text-[#7a5208]">
            <p className="m-0 font-semibold">What happens next?</p>
            <p className="mt-2 mb-0">
               You will receive an email once your shelter is approved. Once approved, signing in will take you to your shelter dashboard.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 max-sm:flex-col">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer"
            >
              Go to home
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#ffdad9] bg-[#fff4f4] px-[18px] py-[10px] text-base font-semibold text-[#ba1a1a] cursor-pointer hover:bg-[#ffdad9]"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (shelter && shelter.approvalStatus === 'rejected') {
    return (
      <section className="min-h-screen bg-[#f5f3f0] px-6 py-12 max-sm:px-4 max-sm:py-8">
        <div className="mx-auto max-w-3xl rounded-[20px] border border-[#d7d7d9] bg-white p-8 shadow-[0_2px_12px_rgba(15,42,68,0.07)] max-sm:p-5">
          <h1 className="m-0 font-serif text-[42px] text-[#0F2A44] max-sm:text-[34px]">Shelter Application Rejected</h1>
          <p className="mt-4 text-[#67686d] text-lg leading-7 max-sm:text-base">{shelter.reviewNotes || 'Please contact PerfectPaw support for more information.'}</p>
          <div className="mt-6 flex flex-wrap gap-3 max-sm:flex-col">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer"
            >
              Go to home
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#ffdad9] bg-[#fff4f4] px-[18px] py-[10px] text-base font-semibold text-[#ba1a1a] cursor-pointer hover:bg-[#ffdad9]"
            >
              Sign out
            </button>
          </div>
        </div>
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
              onClick={(event) => {
                event.preventDefault()
                setActiveNavItem(id)
              }}
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
        <div className="sticky top-0 z-20 border-b border-[#d7d7d9] bg-[#f6f6f7] px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-4">
            <p className="m-0 font-serif text-[24px] font-bold text-[#0F2A44]">Perfect Paw</p>
            <button
              type="button"
              onClick={() => setMobileNavOpen((currentValue) => !currentValue)}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-3 py-2 text-sm font-semibold text-[#333439]"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-shelter-nav"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Menu
            </button>
          </div>

          {mobileNavOpen && (
            <nav id="mobile-shelter-nav" className="mt-3 grid gap-2" aria-label="Mobile shelter dashboard navigation">
              {sidebarNavItems.map(({ id, label, href, Icon }) => (
                <a
                  key={id}
                  href={href}
                  onClick={(event) => {
                    event.preventDefault()
                    setActiveNavItem(id)
                    setMobileNavOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold no-underline ${activeNavItem === id
                    ? 'bg-[#ef767a] text-white'
                    : 'bg-white text-[#55585f]'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </a>
              ))}
            </nav>
          )}
        </div>
        <header className="bg-[#f2f2f2] pt-6 pb-5">
          <div className="w-[min(1500px,calc(100%-96px))] mx-auto max-sm:w-[calc(100%-32px)]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
                  Shelter staff
                </p>
                <div className="mt-3 flex items-center gap-4 max-sm:flex-col max-sm:items-start">
                  <h1 className="animate-fade-up m-0 mt-3 font-serif text-[clamp(36px,4vw,56px)] leading-[1] tracking-[-0.02em] text-[#0F2A44]">
                    {shelter?.name || 'Shelter Dashboard'}
                  </h1>
                  <DotLottieReact
                    className="w-[220px] shrink-0 max-md:w-[180px] max-sm:w-[150px]"
                    aria-hidden="true"
                    src="https://lottie.host/86f8e64d-015f-433b-ba95-2618029fec3c/h5hRcSCc4s.lottie"
                    loop
                    autoplay
                  />
                </div>
                <p className="animate-fade-up-delay-1 mt-[18px] max-w-[780px] text-[#67686d] text-[20px] leading-[1.55] max-sm:text-[17px]">
                  Review applications, track pets, and keep your shelter listings ready for adoptions.
                </p>
              </div>

              <button
                className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer max-sm:w-full"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="w-[min(1500px,calc(100%-96px))] mx-auto pt-7 max-sm:w-[calc(100%-32px)]">
          {error && (
            <p className="mb-5 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
              {error}
            </p>
          )}

          {showDashboard && (
            <section id="dashboard-summary" className="flex flex-wrap gap-[22px] scroll-mt-8" aria-label="Dashboard summary">
              {[
                { label: 'Total Pets', value: totalPets, tone: 'bg-[#cfe5ff] text-[#0F2A44]' },
                { label: 'Active Applications', value: activeApplications, tone: 'bg-[#dff2df] text-[#274c2b]' },
                { label: 'Pending Adoptions', value: pendingAdoptions, tone: 'bg-[#ffdad9] text-[#a23b42]' },
                { label: 'New Applications', value: newApplications, tone: 'bg-[#fff7eb] text-[#9a5b00]' },
              ].map((stat) => (
                <article key={stat.label} className="flex flex-[1_1_240px] items-center gap-4 rounded-[20px] border border-[rgba(15,42,68,0.10)] bg-white p-5 shadow-[0_2px_12px_rgba(15,42,68,0.07)] max-sm:flex-[1_1_100%]">
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
          )}

          {showApplications && (
            <section className="mt-10 flex items-start gap-[38px] max-lg:flex-col">
              {showDashboard && (
                <aside id="staff-notes" className="flex-[0_0_360px] scroll-mt-8 rounded-[20px] border border-[rgba(15,42,68,0.12)] bg-[#f9fbfc] p-6 max-lg:w-full max-lg:max-w-none max-sm:p-5">
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
              )}

              <section id="applications" className="flex-1 scroll-mt-8" aria-label="Recent applications">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Applications</p>
                  <h2 className="mt-3 mb-0 font-serif text-[clamp(34px,3.2vw,52px)] text-[#0F2A44]">
                    {activeNavItem === 'applications' ? 'All Applications' : 'Applications Preview'}
                  </h2>
                </div>
                <p className="m-0 text-[#67686d] text-sm">
                  Showing {applicationsToShow.length} of {totalApplications}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {applicationsToShow.length === 0 && (
                  <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
                    No recent applications yet.
                  </p>
                )}

                {applicationsToShow.map((application) => {
                  const isProcessing = processingApplicationId === application._id
                  const isFinalStatus = ['approved', 'rejected', 'withdrawn'].includes(application.status)
                  const canStartReview = application.status === 'submitted'
                  const canApprove = !isFinalStatus && application.courseStatus === 'passed'
                  const canReject = !isFinalStatus

                  const petName = getApplicationPetName(application)

                  return (
                    <article key={application._id} className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 shadow-[0_2px_12px_rgba(15,42,68,0.07)] max-sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3 max-sm:items-start">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#ededee] text-sm font-bold text-[#0F2A44]">
                            {getPetInitial(petName)}
                          </div>
                          <div>
                            <h3 className="m-0 font-serif text-[28px] text-[#0F2A44] max-sm:text-[24px]">{petName}</h3>
                            <p className="mt-1 mb-0 text-sm text-[#67686d]">
                              {getApplicationApplicantName(application)}
                              {application.adopterId?.email ? ` - ${application.adopterId.email}` : ''}
                            </p>
                          </div>
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

                      {(application.reasonForAdoption || application.message) && (
                        <p className="mt-4 mb-0 rounded-[14px] bg-[#f6f6f7] p-3 text-sm leading-6 text-[#55585f]">
                          {application.reasonForAdoption || application.message}
                        </p>
                      )}
                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(application)}
                          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#45464a] bg-white px-[14px] py-[9px] text-[14px] font-semibold text-[#333439] cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                          View Application
                        </button>
                      </div>
                      {!isFinalStatus && (
                        <div className="mt-5 flex flex-wrap gap-3 max-sm:flex-col">
                          {canStartReview && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleReviewApplication(application._id, 'reviewing')}
                              className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[14px] py-[9px] text-[14px] font-semibold text-[#333439] cursor-pointer disabled:opacity-60"
                            >
                              {isProcessing ? 'Updating...' : 'Start Review'}
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isProcessing || !canApprove}
                            onClick={() => handleReviewApplication(application._id, 'approved')}
                            className="rounded-lg border-2 border-transparent bg-[#ef767a] px-[14px] py-[9px] text-[14px] font-semibold text-[#f6f6f6] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>

                          {canReject && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleReviewApplication(application._id, 'rejected')}
                              className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[14px] py-[9px] text-[14px] font-semibold text-[#333439] cursor-pointer disabled:opacity-60"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>

              </section>
            </section>
          )}

          {showPetListings && (
            <section id="pet-listings" className={showDashboard ? 'mt-11 scroll-mt-8' : 'mt-10 scroll-mt-8'}>
            <div className="flex flex-wrap items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
              <div>
                <h2 className="m-0 font-serif text-[clamp(34px,3.2vw,52px)] text-[#0F2A44]">
                  {activeNavItem === 'pets' ? 'Pet Listings' : 'Pet Listings Preview'}
                </h2>
                <p className="mt-2 mb-0 text-[#67686d] text-sm">
                  Showing {petsToShow.length} of {totalPets}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 max-sm:flex-col">
                <button
                  type="button"
                  onClick={openCreatePetForm}
                  className="rounded-lg border-2 border-transparent bg-[#ef767a] px-[18px] py-[10px] text-base font-semibold text-[#f6f6f6] cursor-pointer max-sm:w-full"
                >
                  Add New Pet
                </button>
              </div>
            </div>

            <div className="mt-[22px] flex flex-wrap gap-[22px]">
              {petsToShow.length === 0 && (
                <p className="rounded-[20px] border border-[#d7d7d9] bg-white p-5 text-[#67686d]">
                  No pets in inventory yet.
                </p>
              )}

              {petsToShow.map((pet, index) => {
                const petTraits = getPetTraits(pet)

                return (
                  <article
                    key={pet._id}
                    className="pet-card flex-[1_1_300px] max-w-[420px] rounded-[20px] bg-white overflow-hidden flex flex-col shadow-[0_2px_12px_rgba(15,42,68,0.07)] max-sm:max-w-none max-sm:flex-[1_1_100%]"
                    style={{ animation: `fadeUp 0.5s ${index * 0.08}s ease both` }}
                  >
                    <div className="relative aspect-[18/13] overflow-hidden bg-[#efeff0]">
                      <img
                        className="pet-card-img h-full w-full object-cover object-center block"
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
                        {formatPetAge(pet)} old - {pet.species}
                      </p>
                      {pet.breed && (
                        <p className="mt-[-10px] mb-4 text-sm font-semibold text-[#2e5f8a]">
                          {pet.breed}
                        </p>
                      )}
                      {petTraits.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2" aria-label="Traits">
                          {petTraits.map((trait) => (
                            <span key={trait} className="rounded-lg bg-[#ededee] px-2.5 py-[7px] text-xs font-semibold text-[#6c6d72]">
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 max-sm:flex-col">
                        <button
                          type="button"
                          onClick={() => openEditPetForm(pet)}
                          className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[14px] py-[9px] text-[14px] font-semibold text-[#333439] cursor-pointer max-sm:w-full"
                        >
                          Edit Listing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePet(pet)}
                          disabled={deletingPetId === pet._id}
                          className="rounded-lg border border-[#ffdad9] bg-[#fff4f4] px-[14px] py-[9px] text-[14px] font-semibold text-[#ba1a1a] cursor-pointer hover:bg-[#ffdad9] disabled:opacity-60 max-sm:w-full"
                        >
                          {deletingPetId === pet._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
            </section>
          )}
        </main>
      </div>
      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 max-sm:items-end max-sm:px-0 max-sm:py-0"
          aria-modal="true"
          aria-label="Application details"
        >
          <div className="max-h-[calc(100vh-64px)] w-full max-w-[860px] overflow-y-auto rounded-2xl border border-[#d7d7d9] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] max-sm:max-h-[92vh] max-sm:rounded-b-none">
            <div className="flex items-start justify-between gap-4 border-b border-[#ececef] p-6 max-sm:p-4">
              <div>
                <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
                  Application Details
                </p>
                <h2 className="mt-2 mb-0 font-serif text-[34px] leading-tight text-[#0F2A44] max-sm:text-[28px]">
                  {getApplicationPetName(selectedApplication)}
                </h2>
                <p className="mt-2 mb-0 text-sm text-[#67686d]">
                  Submitted by {getApplicationApplicantName(selectedApplication)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="rounded-full border border-[#d7d7d9] bg-white px-3 py-1 text-lg leading-none text-[#55585f]"
                aria-label="Close application details"
              >
                x
              </button>
            </div>

            <div className="grid gap-5 p-6 max-sm:p-4">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusClass(selectedApplication.status)}`}>
                  {getStatusLabel(selectedApplication.status)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getCourseStatusClass(selectedApplication.courseStatus)}`}>
                  {getCourseStatusLabel(selectedApplication.courseStatus)}
                </span>
              </div>

              <section className="grid gap-3 rounded-[16px] bg-[#f6f6f7] p-4">
                <h3 className="m-0 font-serif text-[24px] text-[#0F2A44]">Applicant</h3>
                <p className="m-0 text-sm text-[#55585f]"><strong>Name:</strong> {getApplicationApplicantName(selectedApplication)}</p>
                <p className="m-0 text-sm text-[#55585f]"><strong>Email:</strong> {selectedApplication.adopterId?.email || 'Not provided'}</p>
                <p className="m-0 text-sm text-[#55585f]"><strong>Phone:</strong> {selectedApplication.phone || 'Not provided'}</p>
                <p className="m-0 text-sm text-[#55585f]"><strong>Address:</strong> {getApplicationAddress(selectedApplication)}</p>
              </section>

              <section className="grid gap-3 rounded-[16px] bg-[#f6f6f7] p-4">
                <h3 className="m-0 font-serif text-[24px] text-[#0F2A44]">Home Details</h3>
                <p className="m-0 text-sm text-[#55585f]"><strong>Housing:</strong> {selectedApplication.housingType || 'Not provided'}</p>
                <p className="m-0 text-sm text-[#55585f]"><strong>Has yard:</strong> {formatYesNo(selectedApplication.hasYard)}</p>
                <p className="m-0 text-sm text-[#55585f]"><strong>Has other pets:</strong> {formatYesNo(selectedApplication.hasOtherPets)}</p>
              </section>

              <section className="grid gap-3 rounded-[16px] bg-[#f6f6f7] p-4">
                <h3 className="m-0 font-serif text-[24px] text-[#0F2A44]">Application Answers</h3>
                <div>
                  <p className="m-0 text-sm font-semibold text-[#0F2A44]">Pet experience</p>
                  <p className="mt-1 mb-0 text-sm leading-6 text-[#55585f]">{selectedApplication.petExperience || 'Not provided'}</p>
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-[#0F2A44]">Why they want to adopt</p>
                  <p className="mt-1 mb-0 text-sm leading-6 text-[#55585f]">{selectedApplication.reasonForAdoption || 'Not provided'}</p>
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-[#0F2A44]">Message</p>
                  <p className="mt-1 mb-0 text-sm leading-6 text-[#55585f]">{selectedApplication.message || 'No extra message provided.'}</p>
                </div>
              </section>
            </div>

            {!selectedApplicationIsFinal && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-[#ececef] p-6 max-sm:flex-col-reverse max-sm:p-4">
                {selectedApplicationCanStartReview && (
                  <button
                    type="button"
                    disabled={selectedApplicationIsProcessing}
                    onClick={() => handleReviewApplication(selectedApplication._id, 'reviewing')}
                    className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[14px] py-[9px] text-[14px] font-semibold text-[#333439] cursor-pointer disabled:opacity-60"
                  >
                    {selectedApplicationIsProcessing ? 'Updating...' : 'Start Review'}
                  </button>
                )}

                <button
                  type="button"
                  disabled={selectedApplicationIsProcessing || !selectedApplicationCanApprove}
                  onClick={() => handleReviewApplication(selectedApplication._id, 'approved')}
                  className="rounded-lg border-2 border-transparent bg-[#ef767a] px-[14px] py-[9px] text-[14px] font-semibold text-[#f6f6f6] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve
                </button>

                {selectedApplicationCanReject && (
                  <button
                    type="button"
                    disabled={selectedApplicationIsProcessing}
                    onClick={() => handleReviewApplication(selectedApplication._id, 'rejected')}
                    className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[14px] py-[9px] text-[14px] font-semibold text-[#333439] cursor-pointer disabled:opacity-60"
                  >
                    Reject
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {showPetForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 max-sm:items-end max-sm:px-0 max-sm:py-0">
          <form
            onSubmit={handleSavePet}
            className="flex max-h-[calc(100vh-64px)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#d7d7d9] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] max-sm:max-h-[92vh] max-sm:rounded-b-none"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#ececef] p-6 max-sm:p-4">
              <div>
                <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">
                  Pet listing
                </p>
                <h2 className="mt-2 mb-0 font-serif text-[34px] text-[#0F2A44] max-sm:text-[28px]">
                  {isEditingPet ? 'Edit Pet Listing' : 'Add New Pet'}
                </h2>
                <p className="mt-2 mb-0 text-[#67686d] text-sm leading-6">
                  {isEditingPet
                    ? 'Update this listing so adopters see the latest information.'
                    : 'Fill out the form to create a new pet listing for your shelter.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closePetForm}
                disabled={creatingPet}
                className="rounded-full border border-[#d7d7d9] bg-white px-3 py-1 text-lg leading-none text-[#55585f] disabled:opacity-60"
                aria-label="Close pet form"
              >
                x
              </button>
            </div>

            <div className="grid gap-5 overflow-y-auto p-6 max-sm:p-4">
              {petFormError && (
                <p className="m-0 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
                  {petFormError}
                </p>
              )}

              <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                Name
                <input
                  name="name"
                  type="text"
                  value={petFormData.name}
                  onChange={handlePetFormChange}
                  required
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                Breed
                <input
                  name="breed"
                  type="text"
                  value={petFormData.breed}
                  onChange={handlePetFormChange}
                  placeholder="Labrador Retriever, Domestic Shorthair"
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                Upload pet photo
                <input
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handlePetFormChange}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#cfe5ff] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#0F2A44] focus:border-[#0F2A44]"
                />
                <span className="text-xs font-normal text-[#67686d]">
                  {isEditingPet
                    ? 'Choose a new photo to replace the current one.'
                    : 'Choose a photo to upload for this pet.'}
                </span>
              </label>

              {petImagePreviewSrc && (
                <div className="h-[220px] w-full max-w-[420px] overflow-hidden rounded-xl border border-[#d7d7d9] bg-[#efeff0]">
                  <img
                    src={petImagePreviewSrc}
                    alt="Pet preview"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                  Species
                  <select
                    name="species"
                    value={petFormData.species}
                    onChange={handlePetFormChange}
                    required
                    className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                  Sex
                  <select
                    name="sex"
                    value={petFormData.sex}
                    onChange={handlePetFormChange}
                    required
                    className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                  Age
                  <input
                    name="ageAmount"
                    type="number"
                    min="1"
                    max={petFormData.ageUnit === 'months' ? '12' : '20'}
                    step="1"
                    value={petFormData.ageAmount}
                    onChange={handlePetFormChange}
                    required
                    className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                  Age unit
                  <select
                    name="ageUnit"
                    value={petFormData.ageUnit}
                    onChange={handlePetFormChange}
                    required
                    className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                  >
                    <option value="months">months</option>
                    <option value="years">years</option>
                  </select>
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                  Size
                  <select
                    name="size"
                    value={petFormData.size}
                    onChange={handlePetFormChange}
                    required
                    className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 rounded-2xl border border-[#ececef] bg-[#fafafa] p-4">
                <div>
                  <p className="m-0 text-sm font-bold text-[#0F2A44]">Match details</p>
                  <p className="m-0 mt-1 text-sm text-[#67686d]">
                    These help the quiz recommend the right pets to adopters.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                    Energy level
                    <select
                      name="energyLevel"
                      value={petFormData.energyLevel}
                      onChange={handlePetFormChange}
                      required
                      className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                    Exercise needs
                    <select
                      name="exerciseNeeds"
                      value={petFormData.exerciseNeeds}
                      onChange={handlePetFormChange}
                      required
                      className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                    Apartment friendly
                    <select
                      name="goodForApartments"
                      value={petFormData.goodForApartments}
                      onChange={handlePetFormChange}
                      required
                      className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                    Good with kids
                    <select
                      name="goodWithKids"
                      value={petFormData.goodWithKids}
                      onChange={handlePetFormChange}
                      required
                      className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                    Good with other pets
                    <select
                      name="goodWithOtherPets"
                      value={petFormData.goodWithOtherPets}
                      onChange={handlePetFormChange}
                      required
                      className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                </div>
              </div>

              <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                Traits <span className="font-normal text-[#67686d]">(comma separated)</span>
                <input
                  name="traits"
                  type="text"
                  value={petFormData.traits}
                  onChange={handlePetFormChange}
                  placeholder="Friendly, playful, good with cats"
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]">
                Short blurb
                <textarea
                  name="blurb"
                  value={petFormData.blurb}
                  onChange={handlePetFormChange}
                  rows={3}
                  placeholder="Tell adopters what makes this pet special."
                  className="resize-y rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#ececef] p-6 max-sm:flex-col-reverse max-sm:p-4">
              <button
                type="button"
                onClick={closePetForm}
                disabled={creatingPet}
                className="rounded-lg border border-[#c5c6cb] bg-white px-5 py-2.5 text-base font-semibold text-[#2f3034] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creatingPet}
                className="rounded-lg border-2 border-transparent bg-[#ef767a] px-[18px] py-[10px] text-base font-semibold text-[#f6f6f6] cursor-pointer disabled:opacity-60"
              >
                {petSubmitLabel}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
export default ShelterDashboard


