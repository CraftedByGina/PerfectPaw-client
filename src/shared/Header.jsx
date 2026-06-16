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
    <header className="min-h-[82px] flex items-center justify-between gap-5 px-12 bg-[#f6f6f7] max-lg:flex-wrap max-lg:py-4 max-sm:px-4 max-sm:gap-4">
      <Link to="/" className="flex items-center gap-2.5 font-serif text-[34px] leading-none font-bold text-[#0F2A44] no-underline max-sm:text-[26px]">
        <img className="w-[34px]" src="/icons/paw.svg" alt="" />
        <span>The Perfect Paw</span>
      </Link>
      <nav className="flex items-center gap-10 max-md:order-3 max-md:w-full max-md:flex-wrap max-md:gap-x-5 max-md:gap-y-3" aria-label="Primary">
        <Link to="/pets" className="nav-link text-[#0F2A44] text-lg font-medium">Adoptable Pets</Link>
        {!isShelterAdmin && <Link to="/course" className="nav-link text-[#0F2A44] text-lg font-medium">Course Preview</Link>}
        {isAuthenticated && !isShelterAdmin && <Link to="/applications" className="nav-link text-[#0F2A44] text-lg font-medium">Applications</Link>}
        {isShelterAdmin && <Link to="/dashboard" className="nav-link text-[#0F2A44] text-lg font-medium">Dashboard</Link>}
        <a href="#" className="nav-link text-[#0F2A44] text-lg font-medium">Donate</a>
      </nav>
      {!isAuthenticated ? (
        <Link to="/login" className="rounded-lg border-2 border-[#45464a] px-[18px] py-[10px] text-base font-semibold cursor-pointer bg-[#f6f6f7] text-[#333439] no-underline max-sm:px-4 max-sm:py-2 max-sm:text-sm">
          Sign In
        </Link>
      ) : (
        <div className="flex items-center gap-3 max-sm:ml-auto">
          <span className="text-sm text-[#55585f] capitalize">{role || 'signed in'}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border-2 border-[#45464a] px-[18px] py-[10px] text-base font-semibold cursor-pointer bg-[#f6f6f7] text-[#333439] max-sm:px-4 max-sm:py-2 max-sm:text-sm"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  )
}

export default Header

