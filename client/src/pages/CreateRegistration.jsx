import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, FormInput, Button } from '../components/UI.jsx'

export default function CreateRegistration() {
  const nav = useNavigate()
  const params = new URLSearchParams(useLocation().search)
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState({ company: params.get('companyId')||'', batch: '', driveDate: '', eligibility: { minCgpa: '', maxArrears: '', maxHistoryArrears: '', minTenthPercent: '', minTwelfthPercent: '', acceptedBatches: '' }, customFields: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetch('/api/companies').then(r=>r.json()).then(d=>setCompanies(d.data||[])) }, [])

  function setField(path, value) {
    const next = { ...form }
    const keys = path.split('.')
    let o = next
    for (let i=0;i<keys.length-1;i++) o = o[keys[i]]
    o[keys[keys.length-1]] = value
    setForm(next)
  }

  async function submit() {
    setLoading(true)
    const payload = { ...form, batch: Number(form.batch) || undefined, eligibility: { ...form.eligibility, acceptedBatches: form.eligibility.acceptedBatches?.split(',').map(x=>Number(x.trim())).filter(Boolean) } }
    const r = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
    const d = await r.json()
    setLoading(false)
    if (r.ok) nav(`/company`)
    else alert(d.message || 'Failed to create registration')
  }

  return (
    <div className="container">
      <Card title="Create Registration" actions={<Button onClick={submit} disabled={loading}>{loading? 'Creating...':'Create'}</Button>}>
        <label className="form-field">
          <span>Company</span>
          <select value={form.company} onChange={e=>setField('company', e.target.value)} required>
            <option value="">Select company</option>
            {companies.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
        <FormInput label="Batch" value={form.batch} onChange={e=>setField('batch', e.target.value)} />
        <FormInput label="Drive Date" type="datetime-local" value={form.driveDate} onChange={e=>setField('driveDate', e.target.value)} />
        <h4>Eligibility</h4>
        <div className="grid-2">
          <FormInput label="Min CGPA" value={form.eligibility.minCgpa} onChange={e=>setField('eligibility.minCgpa', e.target.value)} />
          <FormInput label="Max Arrears" value={form.eligibility.maxArrears} onChange={e=>setField('eligibility.maxArrears', e.target.value)} />
          <FormInput label="Max History of Arrears" value={form.eligibility.maxHistoryArrears} onChange={e=>setField('eligibility.maxHistoryArrears', e.target.value)} />
          <FormInput label="Min 10th %" value={form.eligibility.minTenthPercent} onChange={e=>setField('eligibility.minTenthPercent', e.target.value)} />
          <FormInput label="Min 12th %" value={form.eligibility.minTwelfthPercent} onChange={e=>setField('eligibility.minTwelfthPercent', e.target.value)} />
          <FormInput label="Accepted Batches (comma)" value={form.eligibility.acceptedBatches} onChange={e=>setField('eligibility.acceptedBatches', e.target.value)} />
        </div>
      </Card>
    </div>
  )
}



