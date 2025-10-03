import { useEffect, useState } from 'react'
import { Card, FormInput, Button } from '../components/UI.jsx'

export default function Profile() {
  const [me, setMe] = useState(null)
  const [file, setFile] = useState(null)

  useEffect(() => { fetch('/api/users/me', { credentials: 'include' }).then(r=>r.json()).then(d=>setMe(d.data||d.user)) }, [])

  async function save() {
    const r = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(me) })
    const d = await r.json(); setMe(d.data)
  }

  async function upload() {
    if (!file) return
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/users/me/resumes', { method: 'POST', credentials: 'include', body: fd })
    const d = await r.json(); if (r.ok) setMe(d.data); else alert(d.message)
  }

  if (!me) return <div className="container"><p>Loading...</p></div>
  return (
    <div className="container grid">
      <Card title="Profile" actions={<Button onClick={save}>Save</Button>}>
        <div className="grid-2">
          <FormInput label="Name" value={me.name||''} onChange={e=>setMe({...me, name: e.target.value})} />
          <FormInput label="Phone" value={me.phone||''} onChange={e=>setMe({...me, phone: e.target.value})} />
          <FormInput label="Native Place" value={me.nativePlace||''} onChange={e=>setMe({...me, nativePlace: e.target.value})} />
          <FormInput label="Roll Number" value={me.rollNumber||''} onChange={e=>setMe({...me, rollNumber: e.target.value})} />
          <FormInput label="Batch" value={me.batch||''} onChange={e=>setMe({...me, batch: e.target.value})} />
          <FormInput label="CGPA" value={me.cgpa||''} onChange={e=>setMe({...me, cgpa: e.target.value})} />
          <FormInput label="Arrears" value={me.arrears||''} onChange={e=>setMe({...me, arrears: e.target.value})} />
          <FormInput label="10th %" value={me.tenthPercent||''} onChange={e=>setMe({...me, tenthPercent: e.target.value})} />
          <FormInput label="12th %" value={me.twelfthPercent||''} onChange={e=>setMe({...me, twelfthPercent: e.target.value})} />
        </div>
      </Card>
      <Card title="Resumes">
        <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <Button variant="secondary" onClick={upload}>Upload</Button>
        <div className="grid" style={{marginTop:12}}>
          {(me.resumes||[]).map((r,i)=> (
            <div key={i} className="card" style={{padding:12}}>
              <p>Resume {i+1} — {new Date(r.uploadedAt).toLocaleDateString()}</p>
              <div className="cta">
                <a className="btn btn-secondary" href={r.url} target="_blank" rel="noreferrer">Download</a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}



