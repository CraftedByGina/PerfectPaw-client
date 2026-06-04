
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const Login = () => {
  const navigate = useNavigate()
  const { login, startOAuthLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const session = await login({ email: email.trim(), password })
      const isShelterRole = ['shelter_admin', 'super_admin'].includes(session.role)
      navigate(isShelterRole ? '/dashboard' : '/pets', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in right now.')
    } finally {
      setSaving(false)
    }
  }

  const handleOAuthLogin = () => {
    setError('')

    try {
      startOAuthLogin('login')
    } catch (err) {
      setError(err.message || 'Could not start OAuth sign in.')
    }
  }

  return (
    <section className="w-[min(520px,calc(100%-32px))] mx-auto py-12">
      <div className="rounded-[16px] border border-[#d7d7d9] bg-white p-6 sm:p-8">
        <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Welcome back</p>
        <h1 className="mt-3 mb-0 font-serif text-[42px] leading-[1.1] text-[#0F2A44]">Sign in</h1>
        <p className="mt-3 mb-0 text-[#55585f] text-[16px] leading-[1.6]">
          Shelter admins will be routed to the dashboard. Adopters will be routed to adoptable pets.
        </p>

        <button
          type="button"
          onClick={handleOAuthLogin}
          className="mt-6 w-full rounded-lg border-2 border-[#0F2A44] bg-[#0F2A44] px-5 py-2.5 text-base font-semibold text-white"
        >
          Continue with Google
        </button>

        <p className="mt-3 mb-0 text-center text-xs text-[#67686d]">
          or sign in with email and password
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm text-[#2f3034]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm text-[#2f3034]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-5 py-2.5 text-base font-semibold text-[#2f3034]"
          >
            {saving ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {error && (
          <p className="mt-4 mb-0 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
            {error}
          </p>
        )}

        <p className="mt-5 mb-0 text-sm text-[#67686d]">
          Need an account? <Link to="/signup" className="text-red-500 font-bold">Register here</Link>
        </p>
      </div>
    </section>
  )
}

export default Login
