import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, FormInput, Button } from '../components/UI.jsx'

export default function DriveStaff() {
  const { id } = useParams()
  const [drive, setDrive] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const [applicants, setApplicants] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [finalizing, setFinalizing] = useState(false)

  useEffect(() => { load() }, [id])
  async function load() {
    const r = await fetch(`/api/drives/${id}`, { credentials: 'include' })
    const d = await r.json(); setDrive(d.data)
    
    // Load applicants for this drive's registration
    if (d.data?.registration?._id) {
      console.log('Loading applicants for registration:', d.data.registration._id)
      const appR = await fetch(`/api/applications/registrations/${d.data.registration._id}/applicants`, { credentials: 'include' })
      const appD = await appR.json()
      console.log('Applicants data:', appD)
      setApplicants(appD.data || [])
    }
  }

  async function postAnnouncement() {
    await fetch(`/api/drives/${id}/announcement`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ text: announcement }) })
    setAnnouncement(''); load()
  }

  async function finalizeDrive() {
    setFinalizing(true)
    try {
      await fetch(`/api/drives/${id}/finalize`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify({ finalSelected: selectedStudents, close: true }) 
      })
      load() // Reload to show updated state
    } catch (e) {
      console.error('Finalize failed', e)
    }
    setFinalizing(false)
  }

  function toggleStudent(studentId) {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
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
        <Card title="Finalize" actions={
          <Button onClick={finalizeDrive} disabled={finalizing || selectedStudents.length === 0}>
            {finalizing ? 'Finalizing...' : `Finalize ${selectedStudents.length} selected`}
          </Button>
        }>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {applicants.length === 0 ? (
              <p>No students registered for this drive.</p>
            ) : (
              <div className="stack">
                {applicants.map(app => (
                  <label key={app._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(app.student._id)}
                      onChange={() => toggleStudent(app.student._id)}
                    />
                    <div>
                      <div><strong>{app.student.name || app.student.email}</strong></div>
                      <small>Email: {app.student.email}</small>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}



