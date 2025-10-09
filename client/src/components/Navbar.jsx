import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useMemo } from 'react'
import { FiHome, FiBriefcase, FiBookOpen, FiUser, FiLogOut } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
      if (location.pathname !== '/login') navigate('/login')
    } catch {}
  }

  const isHome = location.pathname === '/'

  const items = useMemo(() => ([
    { to: '/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/company', label: 'Company', icon: FiBriefcase },
    { to: '/company/:companyName/interview-experience', label: 'Interview Experience', icon: FiBookOpen, isPattern: true },
    { to: '/student/profile', label: 'Profile', icon: FiUser }
  ]), [])

  if (isHome) {
    return (
      <nav className="top-nav">
        <div className="top-nav-brand">PLACEMATE</div>
      </nav>
    )
  }

  const matchActive = (to, isPattern) => {
    if (isPattern) {
      return location.pathname.includes('/interview-experience')
    }
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <span className="brand-compact">PM</span>
          <span className="brand-full">PLACEMATE</span>
        </div>
        <nav className="sidebar-nav">
          {items.map(({ to, label, icon: Icon, isPattern }) => (
            <NavLink
              key={label}
              to={isPattern ? '/company' : to}
              className={matchActive(to, isPattern) ? 'nav-item active' : 'nav-item'}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="nav-item logout" onClick={handleLogout}>
          <FiLogOut className="nav-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}


