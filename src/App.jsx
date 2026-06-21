import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import Header from './shared/Header.jsx'
import Footer from './shared/Footer.jsx'
import Home from './components/Home.jsx'
import Pets from './components/Pets.jsx'
import PetMatch from './components/PetMatch.jsx'
import PetProfile from './components/PetProfile.jsx'
import Course from './components/Course.jsx'
import Applications from './components/Applications.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import ShelterDashboard from './components/ShelterDashboard.jsx'
import OAuthCallback from './components/OAuthCallback.jsx'
import { useAuth } from './context/AuthContext.jsx'
import SuperAdminDashboard from './components/SuperAdminDashboard.jsx'
import LoadingPage from './components/LoadingPage.jsx'


const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const RequireAdopter = ({ children }) => {
  const { isAuthenticated, isShelterAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isShelterAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const RequireShelterAdmin = ({ children }) => {
  const { isAuthenticated, isShelterAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isShelterAdmin) {
    return <Navigate to="/pets" replace />
  }

  return children
}

const RequireSuperAdmin = ({ children }) => {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


const AppContent = () => {
  const location = useLocation()
  const hideSharedLayout = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/loading')
  return (
    <>
      {!hideSharedLayout && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:petId" element={<PetProfile />} />
          <Route
            path="/pet-match"
            element={(
              <RequireAdopter>
                <PetMatch />
              </RequireAdopter>
            )}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route
            path="/applications"
            element={(
              <RequireAdopter>
                <Applications />
              </RequireAdopter>
            )}
          />
          <Route
            path="/course"
            element={(
              <RequireAdopter>
                <Course />
              </RequireAdopter>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <RequireShelterAdmin>
                <ShelterDashboard />
              </RequireShelterAdmin>
            )}
          />
          <Route
            path="/super-admin"
            element={(
              <RequireSuperAdmin>
                <SuperAdminDashboard />
              </RequireSuperAdmin>
            )}
          />
          <Route
            path="/rescue"
            element={(
              <RequireAuth>
                <Navigate to="/dashboard" replace />
              </RequireAuth>
            )}

          />

        </Routes>
      </main>
      {!hideSharedLayout && <Footer />}
    </>
  )
}
const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const isDashboardPath = window.location.pathname.startsWith('/dashboard')

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsLoading(false)
    }, 1800)

    return () => window.clearTimeout(timerId)
  }, [])

  if (isLoading && !isDashboardPath) {
    return <LoadingPage />
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
export default App