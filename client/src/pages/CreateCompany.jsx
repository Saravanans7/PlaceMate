import { useState } from 'react'
import { Card, FormInput, Button } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function CreateCompany() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [salaryLPA, setSalaryLPA] = useState('')
  const [description, setDescription] = useState('')
  const [rounds, setRounds] = useState([{ name: '', description: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (user?.role !== 'staff') { setError('Only staff can create companies'); return }
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        role: role.trim() || undefined,
        location: location.trim() || undefined,
        salaryLPA: salaryLPA ? Number(salaryLPA) : undefined,
        description: description.trim() || undefined,
        roundsTemplate: rounds.filter(r => r.name.trim())
      }
      const r = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message || 'Failed to create company')
      setSuccess('Company created successfully')
      setTimeout(() => { window.location.href = `/company/${encodeURIComponent(d.data.name)}` }, 1000)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function updateRound(index, key, value) {
    setRounds(prev => prev.map((r, i) => i === index ? { ...r, [key]: value } : r))
  }

  function addRound() {
    setRounds(prev => [...prev, { name: '', description: '' }])
  }

  function removeRound(index) {
    setRounds(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="container">
      <Card title="Create Company" actions={
        <Button onClick={submit} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      }>
        <form onSubmit={submit}>
          <FormInput label="Name" value={name} onChange={e=>setName(e.target.value)} required />
          <FormInput label="Role" value={role} onChange={e=>setRole(e.target.value)} />
          <FormInput label="Location" value={location} onChange={e=>setLocation(e.target.value)} />
          <FormInput label="Salary (LPA)" type="number" value={salaryLPA} onChange={e=>setSalaryLPA(e.target.value)} />
          <label className="form-field">
            <span>Description</span>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} />
          </label>

          <div className="rounds-template">
            <h4>Rounds Template</h4>
            {rounds.map((r, i) => (
              <div key={i} className="round-item">
                <FormInput label={`Round ${i+1} Name`} value={r.name} onChange={e=>updateRound(i, 'name', e.target.value)} />
                <label className="form-field">
                  <span>{`Round ${i+1} Description`}</span>
                  <input value={r.description} onChange={e=>updateRound(i, 'description', e.target.value)} />
                </label>
                {rounds.length > 1 && (
                  <Button variant="secondary" type="button" onClick={()=>removeRound(i)}>Remove</Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={addRound}>Add Round</Button>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Company'}</Button>
        </form>
      </Card>
    </div>
  )
}


