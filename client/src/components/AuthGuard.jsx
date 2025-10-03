import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!user) return <Navigate to="/login" />
  return children
}



