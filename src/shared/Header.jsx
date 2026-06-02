import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isShelterAdmin, role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="min-h-[82px] flex items-center justify-between gap-5 px-12 bg-[#f6f6f7] max-lg:flex-wrap max-lg:py-4">
      <Link to="/" className="flex items-center gap-2.5 font-serif text-[34px] leading-none font-bold text-[#0F2A44] no-underline">
        <img className="w-[34px]" src="/icons/paw.svg" alt="" />
        <span>The Perfect Paw</span>
      </Link>
      <nav className="flex items-center gap-10" aria-label="Primary">
        <Link to="/pets" className="nav-link text-[#0F2A44] text-lg font-medium">Adoptable Pets</Link>
        {!isShelterAdmin && <Link to="/course" className="nav-link text-[#0F2A44] text-lg font-medium">Adoption Course</Link>}
        {isShelterAdmin && <Link to="/dashboard" className="nav-link text-[#0F2A44] text-lg font-medium">Dashboard</Link>}
        <a href="#" className="nav-link text-[#0F2A44] text-lg font-medium">Donate</a>
      </nav>
      {!isAuthenticated ? (
        <Link to="/login" className="rounded-lg border-2 border-[#45464a] px-[18px] py-[10px] text-base font-semibold cursor-pointer bg-[#f6f6f7] text-[#333439] no-underline">
          Sign In
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#55585f] capitalize">{role || 'signed in'}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border-2 border-[#45464a] px-[18px] py-[10px] text-base font-semibold cursor-pointer bg-[#f6f6f7] text-[#333439]"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  )
}

export default Header

