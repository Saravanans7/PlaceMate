import { useEffect, useState } from 'react'
import { Card, FormInput, Button } from '../components/UI.jsx'

export default function Profile() {
  const [me, setMe] = useState(null)

  useEffect(() => { fetch('/api/users/me', { credentials: 'include' }).then(r=>r.json()).then(d=>setMe(d.data||d.user)) }, [])

  async function save() {
    const r = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(me) })
    const d = await r.json(); setMe(d.data)
  }

  if (!me) return <div className="container"><p>Loading...</p></div>
  return (
    <div className="container grid">
      <Card title="Profile" actions={<Button onClick={save}>Save</Button>}>
        <div className="grid-2">
          <FormInput label="Name" value={me.name||''} readOnly />
          <FormInput label="Phone" value={me.phone||''} onChange={e=>setMe({...me, phone: e.target.value})} />
          <FormInput label="Native Place" value={me.nativePlace||''} onChange={e=>setMe({...me, nativePlace: e.target.value})} />
          <FormInput label="Roll Number" value={me.rollNumber||''} readOnly />
          <FormInput label="Batch" value={me.batch||''} readOnly />
          <FormInput label="CGPA" value={me.cgpa||''} readOnly />
          <FormInput label="Arrears" value={me.arrears||''} readOnly />
          <FormInput label="10th %" value={me.tenthPercent||''} readOnly />
          <FormInput label="12th %" value={me.twelfthPercent||''} readOnly />
        </div>
      </Card>
      <Card title="Resume">
        <FormInput
          label="Google Drive Link"
          value={me.resumeLink||''}
          onChange={e=>setMe({...me, resumeLink: e.target.value})}
          placeholder="https://drive.google.com/file/d/.../view"
        />
        {me.resumeLink && (
          <div style={{ marginTop: '12px' }}>
            <a
              className="btn btn-secondary"
              href={me.resumeLink}
              target="_blank"
              rel="noreferrer"
            >
              View Resume
            </a>
          </div>
        )}
      </Card>
    </div>
  )
}



