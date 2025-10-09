import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingAnimation from '../components/LoadingAnimation.jsx'
import '../styles/login.css'  // Make sure to import the CSS we defined

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState('') // 'student' | 'staff' | ''
  const [error, setError] = useState('')
  const [splash, setSplash] = useState(true)
  const [showPostLoginLoading, setShowPostLoginLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1200)
    return () => clearTimeout(t)
  }, [])

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(identifier, password)
      setShowPostLoginLoading(true)
      // Add random delay between 1.5-3 seconds
      const delay = Math.random() * 1500 + 1500
      setTimeout(() => {
        nav('/dashboard')
      }, delay)
    } catch (e) {
      setError('Invalid credentials')
      setLoading(false)
    }
  }

  function google() {
    // UI only per spec; keep existing behavior if backend is wired
    window.location.href = '/api/auth/google'
  }

  async function loginDemo(role) {
    setError('')
    setDemoLoading(role)
    try {
      if (role === 'student') {
        await login('studentdemo@gmail.com', 'lol')
      } else {
        await login('staffdemo@gmail.com', 'lol')
      }
      setShowPostLoginLoading(true)
      // Add random delay between 1.5-3 seconds
      const delay = Math.random() * 1500 + 1500
      setTimeout(() => {
        nav('/dashboard')
      }, delay)
    } catch (e) {
      setError('Unable to login to demo account')
      setDemoLoading('')
    }
  }

  return (
    <div className="login-page">
      {showPostLoginLoading ? (
        <LoadingAnimation message="Welcome! Setting up your dashboard..." />
      ) : splash ? (
        <div className="login-splash">
          <div className="spinner-lg" />
        </div>
      ) : (
        <div className="login-container">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Welcome back. Please sign in to continue.</p>

          <div className="login-box">
            <form className="login-form" onSubmit={submit}>
              <label className="login-form-field">
                <span>Email or Username</span>
                <input
                  className="login-input"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="you@example.com or username"
                  required
                />
              </label>

              <label className="login-form-field">
                <span>Password</span>
                <div className="login-password-wrapper">
                  <input
                    className="login-input"
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="login-btn login-btn-secondary"
                    onClick={() => setShow(s => !s)}
                  >
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {error && <p className="login-error">{error}</p>}

              <button
                className="login-btn login-btn-primary login-btn-block"
                disabled={loading}
                type="submit"
              >
                {loading ? <span className="btn-content"><span className="spinner" /> Signing in...</span> : 'Login'}
              </button>
            </form>
          </div>

          <button
            type="button"
            className="login-btn login-btn-ghost login-btn-block login-google"
            onClick={google}
          >
            <span className="google-icon" /> Continue with Google
          </button>

          <div className="login-demo-box">
            <p className="login-demo-title">Here is the project demo:</p>
            <div className="login-demo-actions">
              <button
                type="button"
                className="login-btn login-btn-secondary login-btn-block"
                onClick={() => loginDemo('student')}
                disabled={!!demoLoading}
              >
                {demoLoading === 'student' ? <span className="btn-content"><span className="spinner" /> Demo Student...</span> : 'Demo Student'}
              </button>
              <button
                type="button"
                className="login-btn login-btn-secondary login-btn-block"
                onClick={() => loginDemo('staff')}
                disabled={!!demoLoading}
              >
                {demoLoading === 'staff' ? <span className="btn-content"><span className="spinner" /> Demo Staff...</span> : 'Demo Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
