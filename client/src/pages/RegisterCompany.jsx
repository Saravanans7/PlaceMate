import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Button } from '../components/UI.jsx'

export default function RegisterCompany() {
  const { companyName } = useParams()
  const [registration, setRegistration] = useState(null)
  const [resumeIndex, setResumeIndex] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Simplified: pick first open registration matching name
    fetch('/api/registrations?status=open').then(r=>r.json()).then(d=>{
      const match = (d.data||[]).find(r => (r.company?.name||r.companyNameCached) === companyName)
      setRegistration(match||null)
    })
  }, [companyName])

  async function submit() {
    if (!registration) return
    const r = await fetch(`/api/registrations/${registration._id}/apply`, { method:'POST', headers: { 'Content-Type':'application/json' }, credentials: 'include', body: JSON.stringify({ resumeIndex, answers: [] }) })
    const d = await r.json(); setMessage(r.ok ? 'Registered successfully' : d.message)
  }

  if (!registration) return <div className="container"><p>No open registration found for {companyName}.</p></div>
  return (
    <div className="container">
      <Card title={`Register — ${companyName}`}>
        <p><b>Drive Date:</b> {new Date(registration.driveDate).toLocaleString()}</p>
        <label className="form-field">
          <span>Resume Index</span>
          <select value={resumeIndex} onChange={e=>setResumeIndex(Number(e.target.value))}>
            <option value={0}>Default</option>
            <option value={1}>Resume 2</option>
            <option value={2}>Resume 3</option>
          </select>
        </label>
        <Button onClick={submit}>Apply</Button>
        {message && <p>{message}</p>}
      </Card>
    </div>
  )
}



