import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, FormInput, Button } from '../components/UI.jsx'

export default function DriveStaff() {
  const { id } = useParams()
  const [drive, setDrive] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => { load() }, [id])
  async function load() {
    const r = await fetch(`/api/drives/${id}`, { credentials: 'include' })
    const d = await r.json(); setDrive(d.data)
  }

  async function postAnnouncement() {
    await fetch(`/api/drives/${id}/announcement`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ text: announcement }) })
    setAnnouncement(''); load()
  }

  if (!drive) return <div className="container"><p>Loading...</p></div>
  return (
    <div className="container grid-2">
      <div className="stack">
        <Card title="Announcements" actions={<Button onClick={postAnnouncement}>Post</Button>}>
          <FormInput label="New Announcement" value={announcement} onChange={e=>setAnnouncement(e.target.value)} />
          {(drive.announcements||[]).slice().reverse().map((a,i)=> (
            <p key={i}>{new Date(a.postedAt).toLocaleString()}: {a.text}</p>
          ))}
        </Card>
        <Card title="Rounds">
          {(drive.rounds||[]).map((r,i)=> (
            <div key={i} className="card" style={{padding:12, marginBottom:8}}>
              <b>{r.name}</b> — shortlisted: {r.shortlisted?.length||0}
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="Finalize">
          <p>Finalize placed students here (simplified UI)</p>
        </Card>
      </div>
    </div>
  )
}



