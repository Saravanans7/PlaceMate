import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/login.css'  // Make sure to import the CSS we defined

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(identifier, password)
      nav('/dashboard')
    } catch (e) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  function google() {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="login-container">
      <h2>Login</h2>

      {/* Google Sign-In */}
      <div className="login-google-wrapper">
        
      </div>

      {/* Login Form */}
      <form className="login-form" onSubmit={submit}>

        {/* Email / Username */}
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

        {/* Password */}
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

        {/* Error Message */}
        {error && <p className="login-error">{error}</p>}

        {/* Submit Button */}
        <button
          className="login-btn login-btn-primary"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
