import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Eye, EyeOff } from 'lucide-react'

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value)
const isValidUrl = (value) => {
  if (!value) return true

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const formatPhoneNumber = (value) => {
  let phoneNumber = value.replace(/[^0-9]/g, '')
  phoneNumber = phoneNumber.slice(0, 10)

  if (phoneNumber.length <= 3) {
    return phoneNumber
  }

  if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  }

  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
}

const Signup = () => {
  const navigate = useNavigate()
  const { signup, startOAuthLogin } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('adopter')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shelterName, setShelterName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [website, setWebsite] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [yearsOperating, setYearsOperating] = useState('')
  const [missionStatement, setMissionStatement] = useState('')



  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedShelterName = shelterName.trim()
    const trimmedPhone = contactPhone.trim()
    const trimmedCity = city.trim()
    const trimmedState = state.trim()
    const trimmedWebsite = website.trim()
    const trimmedLicenseNumber = licenseNumber.trim()
    const trimmedMissionStatement = missionStatement.trim()

    if (!trimmedName) {
      setError('Name is required.')
      return
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (isShelterSignup) {
      if (!trimmedShelterName) {
        setError('Shelter name is required.')
        return
      }

      if (!trimmedPhone) {
        setError('Contact phone is required for shelter registration.')
        return
      }

      const phoneDigits = trimmedPhone.replace(/[^0-9]/g, '')

      if (phoneDigits.length !== 10) {
        setError('Enter a 10-digit shelter phone number.')
        return
      }

      if (!trimmedCity || !trimmedState) {
        setError('City and state are required for shelter registration.')
        return
      }

      if (!trimmedLicenseNumber) {
        setError('License number is required for shelter registration.')
        return
      }

      if (!trimmedMissionStatement) {
        setError('Mission statement is required for shelter registration.')
        return
      }

      if (trimmedWebsite && !isValidUrl(trimmedWebsite)) {
        setError('Website must be a full URL, like https://example.org.')
        return
      }

      if (yearsOperating && Number(yearsOperating) < 0) {
        setError('Years operating cannot be negative.')
        return
      }
    }

    setSaving(true)

    try {
      const session = await signup({
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        role,
        shelterName: trimmedShelterName,
        contactPhone: trimmedPhone,
        address: address.trim(),
        city: trimmedCity,
        state: trimmedState,
        zipCode: zipCode.trim(),
        website: trimmedWebsite,
        licenseNumber: trimmedLicenseNumber,
        yearsOperating: yearsOperating ? Number(yearsOperating) : 0,
        missionStatement: trimmedMissionStatement,
      })

      if (session?.token) {
        const isShelterRole = ['shelter_admin', 'super_admin'].includes(session.role)
        navigate(isShelterRole ? '/dashboard' : '/pets', { replace: true })
        return
      }

      setNotice('Account created. Please sign in to continue.')
    } catch (err) {
      setError(err.message || 'Could not create account right now.')
    } finally {
      setSaving(false)
    }
  }
  const isShelterSignup = role === 'shelter_admin'


  const handleOAuthLogin = () => {
    setError('')

    try {
      startOAuthLogin('signup')
    } catch (err) {
      setError(err.message || 'Could not start OAuth sign up.')
    }
  }

  return (
    <section className="w-[min(760px,calc(100%-32px))] mx-auto py-12 max-sm:py-8">
      <div className="rounded-[16px] border border-[#d7d7d9] bg-white p-6 sm:p-8 max-sm:p-4">
        <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Account Setup</p>
        <h1 className="mt-3 mb-0 font-serif text-[42px] leading-[1.1] text-[#0F2A44] max-sm:text-[34px]">Create Your Account</h1>
        <p className="mt-3 mb-0 text-[#55585f] text-[16px] leading-[1.7]">
          {isShelterSignup
            ? 'Complete the verification form so Perfect Paw can review your organization.'
            : 'You can create an account with Google or using the form below.'}
        </p>

        {!isShelterSignup ? (
          <>
            <button
              type="button"
              onClick={handleOAuthLogin}
              className="mt-6 w-full rounded-lg border-2 border-[#0F2A44] bg-[#0F2A44] px-5 py-2.5 text-base font-semibold text-white"
            >
              Continue with Google
            </button>

            <p className="mt-3 mb-0 text-center text-xs text-[#67686d]">
              or create an account with the form below
            </p>
          </>
        ) : (
          <p className="mt-6 mb-0 rounded-lg border border-[#f3d3a6] bg-[#fff7eb] p-3 text-sm text-[#7a5208]">
            Shelter registration requires the verification form below so we can review your organization.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm text-[#2f3034]">Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
              className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm text-[#2f3034]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm text-[#2f3034]">Password</span>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 pr-10"
              />

              <button
                type='button'
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67686d] hover:text-[#2f3034]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm text-[#2f3034]">Account type</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
            >
              <option value="adopter">Adopter</option>
              <option value="shelter_admin">Shelter Manager</option>
            </select>

          </label>
          {isShelterSignup && (
            <div className="grid gap-3 rounded-lg border border-[#d7d7d9] bg-[#f9fbfc] p-4">
              <h2 className="m-0 font-serif text-[26px] text-[#0F2A44]">
                Shelter Information
              </h2>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">Shelter name</span>
                <input
                  type="text"
                  value={shelterName}
                  onChange={(event) => setShelterName(event.target.value)}
                  required={isShelterSignup}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">Contact phone</span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(formatPhoneNumber(event.target.value))}
                  placeholder="(555) 123-4567"
                  maxLength="14"
                  required={isShelterSignup}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">Address</span>
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required={isShelterSignup}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">State</span>
                <input
                  type="text"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  required={isShelterSignup}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">Zip code</span>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">Website</span>
                <input
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  required={false}
                  placeholder="https://www.example.com"
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">License number</span>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(event) => setLicenseNumber(event.target.value)}
                  required={isShelterSignup}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">Years operating</span>
                <input
                  type="number"
                  value={yearsOperating}
                  onChange={(event) => setYearsOperating(event.target.value)}
                  required={false}
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-[#2f3034]">Mission statement</span>
                <textarea
                  value={missionStatement}
                  onChange={(event) => setMissionStatement(event.target.value)}
                  required={isShelterSignup}
                  rows={4}
                  placeholder="Tell us about your mission and how you help pets in need."
                  className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
                />
              </label>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-5 py-2.5 text-base font-semibold text-[#2f3034]"
          >
            {saving ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {error && (
          <p className="mt-4 mb-0 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
            {error}
          </p>
        )}

        {notice && (
          <p className="mt-4 mb-0 rounded-lg border border-[#d7d7d9] bg-white p-3 text-sm text-[#2f3034]">
            {notice}
          </p>
        )}

        <p className="mt-6 mb-0 text-med text-[#67686d]">
          Already have an account? <Link to="/login" className="text-red-500 font-bold">Sign In</Link>
        </p>
      </div>
    </section >
  )
}

export default Signup
