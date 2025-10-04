import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Card, Table } from '../components/UI.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [todayDrives, setTodayDrives] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [batches, setBatches] = useState([])
  const [applications, setApplications] = useState([])

  useEffect(() => {
    fetch('/api/drives?date=today', { credentials: 'include' }).then(r=>r.json()).then(d=>setTodayDrives(d.data||[]))
    fetch('/api/registrations?status=open&range=next30', { credentials: 'include' }).then(r=>r.json()).then(d=>setUpcoming(d.data||[]))
    if (user.role === 'staff') {
      fetch('/api/stats/batches', { credentials: 'include' }).then(r=>r.json()).then(d=>setBatches(d.data||[]))
    } else if (user.role === 'student' && user._id) {
      fetch(`/api/applications/users/${user._id}/applications`, { credentials: 'include' })
        .then(r=>r.json())
        .then(d=>{
          console.log('Applications data:', d)
          setApplications(d.data||[])
        })
        .catch(e=>console.error('Failed to load applications:', e))
    }
  }, [user.role, user._id])

  if (user.role === 'staff') {
    return (
      <div className="container grid-2">
        <div className="stack">
          <Card title="Today's Drives">
            <div className="table-card">
              <Table columns={[
                {label:'Company', key:'company'},
                {label:'Registered', render:r=>r.registration?._id ? '—' : '—'},
                {label:'View', render:r=> <a className="btn btn-secondary" href={`/staff/drive/${r.id}`}>👁️</a>}
              ]}
                rows={todayDrives.map(d=>({ id: d._id, company: d.company?.name || d.registration?.companyNameCached || '—', registration: d.registration }))} />
            </div>
          </Card>
          <Card title="Upcoming Drives">
            <div className="table-card">
              <Table columns={[{label:'Company', key:'company'},{label:'Drive Date', key:'date'}]}
                rows={upcoming.map(r=>({ company: r.company?.name || r.companyNameCached, date: new Date(r.driveDate).toLocaleString() }))} />
            </div>
          </Card>
        </div>
        <div>
          <Card title="Batch-wise stats">
            <div className="stats">
              {batches.map(b=> (
                <div className="stat" key={b._id}><h4>{b._id||'N/A'}</h4><small>Total {b.total}</small></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Student dashboard
  return (
    <div className="container grid-2">
      <div className="stack">
        <Card title="Upcoming companies">
          <div className="table-card">
            <Table columns={[{label:'Company', key:'company'},{label:'Drive Date', key:'date'}]}
              rows={upcoming.map(r=>({ company: r.company?.name || r.companyNameCached, date: new Date(r.driveDate).toLocaleString() }))} />
          </div>
        </Card>
        <Card title="Registered companies" actions={
          <Button onClick={() => {
            if (user._id) {
              fetch(`/api/applications/users/${user._id}/applications`, { credentials: 'include' })
                .then(r=>r.json())
                .then(d=>{
                  console.log('Refreshed applications:', d)
                  setApplications(d.data||[])
                })
            }
          }}>Refresh</Button>
        }>
          <div className="table-card">
            {applications.length === 0 ? (
              <p>No registered companies yet. <a href="/company">Browse companies</a> to register.</p>
            ) : (
              <Table columns={[
                { label: 'Company', key: 'company' },
                { label: 'Drive Date', key: 'date' },
                { label: 'View', render: r => <a className="btn btn-secondary" href={`/company/${encodeURIComponent(r.company)}`}>Open</a> }
              ]}
              rows={applications.map(a => ({
                company: a.registration?.company?.name || a.registration?.companyNameCached || '-'
                , date: a.registration?.driveDate ? new Date(a.registration.driveDate).toLocaleString() : '-'
              }))} />
            )}
          </div>
        </Card>
      </div>
      <div>
        <Card title="Quick actions">
          <div className="stack">
            <a className="btn btn-primary" href="/student/profile">Edit Profile</a>
            <a className="btn btn-secondary" href="/student/profile">Upload Resume</a>
          </div>
        </Card>
      </div>
    </div>
  )
}



