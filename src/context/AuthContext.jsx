import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const STORAGE_KEY = 'perfectpaw_auth_session'
const EMPTY_SESSION = {
  token: '',
  role: '',
  userId: '',
  shelterId: '',
  user: null,
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const LOGIN_PATH = import.meta.env.VITE_AUTH_LOGIN_PATH || '/api/auth/login'
const REGISTER_PATH = import.meta.env.VITE_AUTH_REGISTER_PATH || '/api/auth/register'

const stripTrailingSlashes = (value) => String(value || '').replace(/\/+$/, '')
const stripLeadingSlashes = (value) => String(value || '').replace(/^\/+/, '')

const joinUrl = (base, path) => {
  const normalizedPath = `/${stripLeadingSlashes(path)}`
  if (!base) return normalizedPath
  return `${stripTrailingSlashes(base)}${normalizedPath}`
}

const normalizeRole = (value) => {
  const role = String(value || '').trim().toLowerCase()

  if (role === 'user') return 'adopter'
  if (role === 'admin') return 'super_admin'
  if (role === 'shelter') return 'shelter_admin'
  return role
}

const mapRoleForApi = (value) => {
  const role = normalizeRole(value)
  if (role === 'adopter') return 'adopter'
  if (role === 'shelter_admin') return 'shelter_admin'
  if (role === 'super_admin') return 'super_admin'
  return 'adopter'
}

const readApiError = async (response) => {
  try {
    const data = await response.json()
    return data?.message || data?.error || `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

const getSessionFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SESSION

    const saved = JSON.parse(raw)

    return {
      token: saved?.token || '',
      role: normalizeRole(saved?.role),
      userId: saved?.userId || '',
      shelterId: saved?.shelterId || '',
      user: saved?.user || null,
    }
  } catch {
    return EMPTY_SESSION
  }
}

const mapApiPayloadToSession = (payload) => {
  const root = payload?.data || payload || {}
  const user = root?.user || payload?.user || {}

  return {
    token: root?.token || root?.accessToken || payload?.token || payload?.accessToken || '',
    role: normalizeRole(user?.role || root?.role || payload?.role),
    userId: user?._id || user?.id || root?.userId || payload?.userId || '',
    shelterId: user?.shelterId || user?.shelter?._id || root?.shelterId || payload?.shelterId || '',
    user,
  }
}

export const AuthProvider = ({ children }) => {
  const [initialSession] = useState(() => getSessionFromStorage())
  const [token, setToken] = useState(initialSession.token)
  const [role, setRole] = useState(initialSession.role)
  const [userId, setUserId] = useState(initialSession.userId)
  const [shelterId, setShelterId] = useState(initialSession.shelterId)
  const [user, setUser] = useState(initialSession.user)

  const saveSession = (nextSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
  }

  const setActiveSession = (nextSession) => {
    const safeSession = {
      token: nextSession?.token || '',
      role: normalizeRole(nextSession?.role),
      userId: nextSession?.userId || '',
      shelterId: nextSession?.shelterId || '',
      user: nextSession?.user || null,
    }

    setToken(safeSession.token)
    setRole(safeSession.role)
    setUserId(safeSession.userId)
    setShelterId(safeSession.shelterId)
    setUser(safeSession.user)
    saveSession(safeSession)
  }

  const clearSession = () => {
    setToken(EMPTY_SESSION.token)
    setRole(EMPTY_SESSION.role)
    setUserId(EMPTY_SESSION.userId)
    setShelterId(EMPTY_SESSION.shelterId)
    setUser(EMPTY_SESSION.user)
    localStorage.removeItem(STORAGE_KEY)
  }

  const startOAuthLogin = (intent = 'login') => {
    const path = intent === 'signup' ? '/oauth/signup' : '/oauth/login'
    window.location.href = joinUrl(API_BASE_URL, path)
  }

  const finishOAuthLoginFromCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const googleToken = urlParams.get('token')

    if (!googleToken) {
      if (token) {
        return { token, role, userId, shelterId, user }
      }
      throw new Error('No token was returned from Google sign-in.')
    }

    const middlePart = googleToken.split('.')[1]
    const tokenInfo = JSON.parse(atob(middlePart))

    const nextSession = {
      token: googleToken,
      role: normalizeRole(tokenInfo.role),
      userId: tokenInfo.sub || '',
      shelterId: '',
      user: {
        _id: tokenInfo.sub,
        email: tokenInfo.email,
        role: tokenInfo.role,
      },
    }

    setActiveSession(nextSession)

    window.history.replaceState({}, document.title, window.location.pathname)

    return nextSession
  }

  const login = async ({ email, password }) => {
    const response = await fetch(joinUrl(API_BASE_URL, LOGIN_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(await readApiError(response))
    }

    const payload = await response.json()
    const nextSession = mapApiPayloadToSession(payload)

    if (!nextSession.token) {
      throw new Error('Login succeeded but no token was returned by the server.')
    }

    setActiveSession(nextSession)
    return nextSession
  }

  const signup = async ({ fullName, email, password, role, shelterName, contactPhone, address, city, state, zipCode, website, licenseNumber, yearsOperating, missionStatement }) => {
    const response = await fetch(joinUrl(API_BASE_URL, REGISTER_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        role: mapRoleForApi(role),
        shelterName,
        contactPhone,
        address,
        city,
        state,
        zipCode,
        website,
        licenseNumber,
        yearsOperating,
        missionStatement,
      }),
    })

    if (!response.ok) {
      throw new Error(await readApiError(response))
    }

    const payload = await response.json()
    const nextSession = mapApiPayloadToSession(payload)

    if (nextSession.token) {
      setActiveSession(nextSession)
    }

    return nextSession
  }

  const logout = () => {
    clearSession()
  }

  const isAuthenticated = Boolean(token)
  const isShelterAdmin = role === 'shelter_admin' || role === 'super_admin'
  const isAdopter = role === 'adopter'

  const value = {
    token,
    role,
    userId,
    shelterId,
    user,
    isAuthenticated,
    isShelterAdmin,
    isAdopter,
    login,
    signup,
    startOAuthLogin,
    finishOAuthLoginFromCallback,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
