import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const { finishOAuthLoginFromCallback } = useAuth()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const session = await finishOAuthLoginFromCallback()

        if (!session.token) {
          setNotice('OAuth session is active on the backend, but no JWT was returned for API calls. Please sign in with email/password to establish JWT API auth.')
          return
        }

        if (session.role === 'shelter_admin' || session.role === 'super_admin') {
          navigate('/dashboard', { replace: true })
          return
        }

        navigate('/pets', { replace: true })
      } catch (err) {
        setError(err.message || 'Could not complete OAuth sign-in.')
      }
    }

    run()
  }, [finishOAuthLoginFromCallback, navigate])

  return (
    <section className="w-[min(520px,calc(100%-32px))] mx-auto py-12">
      <div className="rounded-[16px] border border-[#d7d7d9] bg-white p-6 sm:p-8">
        <h1 className="m-0 font-serif text-[36px] leading-[1.1] text-[#0F2A44]">Signing you in...</h1>
        <p className="mt-3 mb-0 text-[#55585f] text-[16px] leading-[1.6]">
          Completing your login. You will be redirected automatically.
        </p>

        {error && (
          <p className="mt-4 mb-0 rounded-lg border border-[#f0b8b8] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
            {error}
          </p>
        )}

        {notice && (
          <p className="mt-4 mb-0 rounded-lg border border-[#f3d3a6] bg-[#fff7eb] p-3 text-sm text-[#7a5208]">
            {notice}
          </p>
        )}
      </div>
    </section>
  )
}

export default OAuthCallback
