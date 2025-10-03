import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Card, Table } from '../components/UI.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [todayDrives, setTodayDrives] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [batches, setBatches] = useState([])

  useEffect(() => {
    fetch('/api/drives?date=today', { credentials: 'include' }).then(r=>r.json()).then(d=>setTodayDrives(d.data||[]))
    fetch('/api/registrations?status=open&range=next30', { credentials: 'include' }).then(r=>r.json()).then(d=>setUpcoming(d.data||[]))
    if (user.role === 'staff') {
      fetch('/api/stats/batches', { credentials: 'include' }).then(r=>r.json()).then(d=>setBatches(d.data||[]))
    }
  }, [user.role])

  if (user.role === 'staff') {
    return (
      <div className="container grid-2">
        <div className="stack">
          <Card title="Today's Drives">
            <div className="table-card">
              <Table columns={[{label:'Company', key:'company'},{label:'Registered', render:r=>r.registration?._id ? '—' : '—'},{label:'View', render:r=> '👁️'}]}
                rows={todayDrives.map(d=>({ company: d.company?.name || d.registration?.companyNameCached || '—' }))} />
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
        <Card title="Registered companies">
          <p>Registrations you joined will appear here.</p>
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



