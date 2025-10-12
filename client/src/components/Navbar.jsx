import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useMemo } from 'react'
import { FiHome, FiBriefcase, FiBookOpen, FiUser, FiLogOut, FiUserMinus, FiTarget } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const items = useMemo(() => {
    const baseItems = [
      { to: '/dashboard', label: 'Dashboard', icon: FiHome },
      { to: '/company', label: 'Company', icon: FiBriefcase }
    ]

    // Add role-specific Interview Experience link
    if (user?.role === 'staff') {
      baseItems.push({ to: '/staff/experience-approval', label: 'Interview Experience', icon: FiBookOpen })
      baseItems.push({ to: '/staff/placement-drives', label: 'Placement Drives', icon: FiTarget })
      baseItems.push({ to: '/staff/blacklist', label: 'Blacklist', icon: FiUserMinus })
    } else {
      // Students and other roles see approved experiences
      baseItems.push({ to: '/experiences', label: 'Interview Experience', icon: FiBookOpen })
      // Only non-staff users get profile page
      baseItems.push({ to: '/student/profile', label: 'Profile', icon: FiUser })
    }
    
    // Add skeleton demo for development/testing
    // baseItems.push({ to: '/skeleton-demo', label: 'Skeleton Demo', icon: FiBookOpen })

    return baseItems
  }, [user?.role])

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
      if (location.pathname !== '/login') navigate('/login')
    } catch {}
  }

  const isHome = location.pathname === '/'

  if (isHome) {
    return (
      <nav className="top-nav">
        <div className="top-nav-brand">PLACEMATE</div>
      </nav>
    )
  }

  const matchActive = (to) => {
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
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={matchActive(to) ? 'nav-item active' : 'nav-item'}
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


