import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

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

  return (
    <nav className="nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/dashboard" className="logo">PlaceMate</Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/company">Companies</Link>
          <Link to="/student/profile">Profile</Link>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ opacity: .7 }}>{user.name || user.email || 'User'}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}


