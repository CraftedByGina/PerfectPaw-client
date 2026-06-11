import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Eye, EyeOff } from 'lucide-react'


const Signup = () => {
  const navigate = useNavigate()
  const { signup, startOAuthLogin } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shelterName, setShelterName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const[licenseNumber, setLicenseNumber] = useState('')
  const [missionStatement, setMissionStatement] = useState('')


  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)

    try {
      const session = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
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
    <section className="w-[min(760px,calc(100%-32px))] mx-auto py-12">
      <div className="rounded-[16px] border border-[#d7d7d9] bg-white p-6 sm:p-8">
        <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Account Setup</p>
        <h1 className="mt-3 mb-0 font-serif text-[42px] leading-[1.1] text-[#0F2A44]">Create Your Account</h1>
        <p className="mt-3 mb-0 text-[#55585f] text-[16px] leading-[1.7]">
          You can create an account with Google or using the form below.
        </p>

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

        <p className="mt-6 mb-0 text-sm text-[#67686d]">
          Already have an account? <Link to="/login" className="text-red-500 font-bold">Sign In</Link>
        </p>
      </div>
    </section >
  )
}

export default Signup
