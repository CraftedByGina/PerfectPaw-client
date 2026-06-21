import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isShelterAdmin, shelterName, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const accountLabel = shelterName || user?.fullName || user?.email || 'signed in'

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMobileMenu()
    navigate('/login')
  }

  const navLinks = [
    { to: '/pets', label: 'Adoptable Pets', show: true },
    { to: '/course', label: 'Course Preview', show: !isShelterAdmin },
    { to: '/applications', label: 'Applications', show: isAuthenticated && !isShelterAdmin },
    { to: '/dashboard', label: 'Dashboard', show: isShelterAdmin },
  ]

  return (
    <header className="relative bg-[#f6f6f7]">
      <div className="min-h-[82px] flex items-center justify-between gap-5 px-12 max-lg:px-6 max-sm:px-4">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2.5 font-serif text-[34px] leading-none font-bold text-[#0F2A44] no-underline max-lg:text-[28px] max-sm:text-[22px]"
        >
          <img className="w-[34px] max-sm:w-[26px]" src="/icons/paw.svg" alt="" />
          <span>The Perfect Paw</span>
        </Link>

        <nav className="flex items-center gap-10 max-lg:gap-6 max-md:hidden" aria-label="Primary">
          {navLinks.filter((link) => link.show).map((link) => (
            <Link key={link.to} to={link.to} className="nav-link text-[#0F2A44] text-lg font-medium">
              {link.label}
            </Link>
          ))}
        </nav>

  
        <div className="flex items-center gap-3 max-md:hidden">
          {!isAuthenticated ? (
            <Link to="/login" className="rounded-lg border-2 border-[#45464a] px-[18px] py-[10px] text-base font-semibold cursor-pointer bg-[#f6f6f7] text-[#333439] no-underline">
              Sign In
            </Link>
          ) : (
            <>
              <span className="text-sm font-semibold text-[#55585f]">{accountLabel}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border-2 border-[#45464a] px-[18px] py-[10px] text-base font-semibold cursor-pointer bg-[#f6f6f7] text-[#333439]"
              >
                Sign Out
              </button>
            </>
          )}
        </div>

    
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="hidden max-md:inline-flex items-center justify-center rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] p-2 text-[#333439]"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-primary-nav"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

  
      {mobileMenuOpen && (
        <nav
          id="mobile-primary-nav"
          className="hidden max-md:flex flex-col gap-1 border-t border-[#e0e0e2] bg-[#f6f6f7] px-4 pb-4 pt-2 shadow-[0_12px_24px_rgba(15,42,68,0.08)]"
          aria-label="Primary"
        >
          {navLinks.filter((link) => link.show).map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={`rounded-lg px-4 py-3 text-lg font-medium no-underline ${isActive ? 'bg-[#ef767a] text-white' : 'text-[#0F2A44] hover:bg-[#ededee]'}`}
              >
                {link.label}
              </Link>
            )
          })}

          <div className="mt-3 border-t border-[#e0e0e2] pt-3">
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block w-full rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-4 py-3 text-center text-base font-semibold text-[#333439] no-underline"
              >
                Sign In
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#55585f]"> {accountLabel}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-4 py-2.5 text-base font-semibold text-[#333439]"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
