import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card } from '../components/UI.jsx'

export default function DriveStudent() {
  const { companyName } = useParams()
  const [drive, setDrive] = useState(null)

  useEffect(() => {
    // Fetch all drives and pick the latest by date for this company
    fetch('/api/drives', { credentials: 'include' })
      .then(r=>r.json())
      .then(d=>{
        const drives = (d.data||[]).filter(x => (x.company?.name||x.registration?.companyNameCached) === companyName)
        drives.sort((a,b)=> new Date(b.date) - new Date(a.date))
        setDrive(drives[0]||null)
      })
  }, [companyName])

  if (!drive) return <div className="container"><p>Drive info will appear here on the day.</p></div>
  return (
    <div className="container grid">
      <Card title={`${companyName} — Announcements`}>
        {(drive.announcements||[]).slice().reverse().map((a,i)=> <p key={i}>{new Date(a.postedAt).toLocaleString()}: {a.text}</p>)}
      </Card>
      <Card title="Rounds">
        {(drive.rounds||[]).map((r,i)=> <p key={i}><b>{r.name}</b></p>)}
      </Card>
    </div>
  )
}



