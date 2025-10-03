import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

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
    setLoading(true); setError('')
    try {
      await login(identifier, password)
      nav('/dashboard')
    } catch (e) {
      setError('Invalid credentials')
    } finally { setLoading(false) }
  }

  function google() {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="container" style={{maxWidth: 420}}>
      <h2>Login</h2>
      <div style={{display:'flex', gap:12, marginBottom: 12}}>
        <button className="btn btn-primary" onClick={google} disabled={loading}>Sign in with Google</button>
      </div>
      <form onSubmit={submit}>
        <label className="form-field">
          <span>Email or Username</span>
          <input value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="you@example.com or username" required />
        </label>
        <label className="form-field">
          <span>Password</span>
          <div style={{display:'flex', gap:8}}>
            <input type={show? 'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required style={{flex:1}} />
            <button type="button" className="btn btn-secondary" onClick={()=>setShow(s=>!s)}>{show?'Hide':'Show'}</button>
          </div>
        </label>
        {error && <p style={{color:'crimson'}}>{error}</p>}
        <button className="btn btn-primary" disabled={loading} type="submit">{loading?'Signing in...':'Login'}</button>
      </form>
    </div>
  )
}



