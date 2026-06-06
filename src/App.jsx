
import { BrowserRouter, Navigate, Route, Routes,useLocation } from 'react-router'
import Header from './shared/Header.jsx'
import Footer from './shared/Footer.jsx'
import Home from './components/Home.jsx'
import Pets from './components/Pets.jsx'
import Course from './components/Course.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import ShelterDashboard from './components/ShelterDashboard.jsx'
import OAuthCallback from './components/OAuthCallback.jsx'
import { useAuth } from './context/AuthContext.jsx'

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


const AppContent = () => {
  const location = useLocation()
  const hideSharedLayout = location.pathname.startsWith('/dashboard')
  return (
    <>
      {!hideSharedLayout && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
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
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
export default App