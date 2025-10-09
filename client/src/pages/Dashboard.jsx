import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Card, Table, Button } from '../components/UI.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [todayDrives, setTodayDrives] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [batches, setBatches] = useState([])
  const [applications, setApplications] = useState([])
  const [placementStatus, setPlacementStatus] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to refresh placement status
  async function refreshPlacementStatus() {
    if (user.role === 'student' && user._id) {
      setIsRefreshing(true)
      try {
        const response = await fetch(`/api/drives/student/${user._id}/placement-status`, { credentials: 'include' })
        const data = await response.json()
        
        if (response.ok) {
          console.log('Placement status refreshed:', data)
          const wasPlaced = placementStatus?.student?.isPlaced
          setPlacementStatus(data.data || null)
          setLastRefresh(Date.now())
          
          // If student just got placed, show a special message
          if (data.data?.student?.isPlaced && !wasPlaced) {
            alert('🎉 Congratulations! You have been placed!')
          }
        } else {
          console.error('Failed to refresh placement status:', data)
        }
      } catch (error) {
        console.error('Error refreshing placement status:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  useEffect(() => {
    fetch('/api/drives?date=today', { credentials: 'include' }).then(r=>r.json()).then(d=>setTodayDrives(d.data||[]))
    fetch('/api/registrations?status=open&range=next30', { credentials: 'include' }).then(r=>r.json()).then(d=>setUpcoming(d.data||[]))
    if (user.role === 'staff') {
      fetch('/api/stats/batches', { credentials: 'include' }).then(r=>r.json()).then(d=>setBatches(d.data||[]))
    } else if (user.role === 'student' && user._id) {
      fetch(`/api/users/${user._id}/applications`, { credentials: 'include' })
        .then(r=>r.json())
        .then(d=>{
          console.log('Applications data:', d)
          setApplications(d.data||[])
        })
        .catch(e=>console.error('Failed to load applications:', e))
      
      // Fetch placement status and round progress
      refreshPlacementStatus()
    }
  }, [user.role, user._id])

  // Auto-refresh placement status every 30 seconds for students
  useEffect(() => {
    if (user.role === 'student' && user._id) {
      const interval = setInterval(() => {
        refreshPlacementStatus()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user.role, user._id, placementStatus])

  if (user.role === 'staff') {
    return (
      <div className="container grid-2">
        <div className="stack">
          <Card title="Today's Drives" actions={
            <div className="card-actions">
              <a className="btn btn-primary" href="/company/create-registration">+ Create Drive</a>
            </div>
          }>
            <div className="table-card">
              <Table columns={[
                {label:'Company', key:'company'},
                {label:'Status', render:r=>r.isClosed ? 'Closed' : 'Active'},
                {label:'Students', render:r=>r.registration?.applicants?.length || 0},
                {label:'Actions', render:r=> (
                  <div className="action-buttons">
                    <a className="btn btn-secondary btn-sm" href={`/staff/drive/${r.id}`}>Manage</a>
                    <a className="btn btn-primary btn-sm" href={`/staff/drive/${r.id}`}>👁️ View</a>
                  </div>
                )}
              ]}
                rows={todayDrives.map(d=>({ 
                  id: d._id, 
                  company: d.company?.name || d.registration?.companyNameCached || '—', 
                  registration: d.registration,
                  isClosed: d.isClosed,
                  applicants: d.registration?.applicants
                }))} />
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
          <Card title="Quick Actions">
            <div className="quick-actions">
              <a className="btn btn-primary" href="/company/create">+ Create Company</a>
              <a className="btn btn-secondary" href="/company/create-registration">+ Create Drive</a>
              <a className="btn btn-secondary" href="/company">Manage Companies</a>
            </div>
          </Card>
          
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
      {/* Auto-refresh indicator */}
      {isRefreshing && (
        <div className="auto-refresh-indicator">
          🔄 Checking for updates...
        </div>
      )}
      <div className="stack">
        {/* Placement Status Card */}
        {placementStatus?.student?.isPlaced && (
          <Card title="🎉 Congratulations! You're Placed!" className="success-card" actions={
            <Button onClick={refreshPlacementStatus} variant="secondary">
              🔄 Refresh
            </Button>
          }>
            <div className="placement-info">
              <h3>Company: {placementStatus.student.placedCompany}</h3>
              <p>Placed on: {new Date(placementStatus.student.placedAt).toLocaleDateString()}</p>
              <div className="placement-actions">
                <p>🎯 You have successfully secured a placement!</p>
                <p>📧 Check your email for further instructions.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Round Progress Card */}
        {placementStatus?.roundProgress && placementStatus.roundProgress.length > 0 && (
          <Card title="Round Progress" actions={
            <Button onClick={refreshPlacementStatus} variant="secondary">
              🔄 Refresh
            </Button>
          }>
            <div className="round-progress">
              {placementStatus.roundProgress.map((progress, index) => (
                <div key={index} className="round-item">
                  <div className="round-header">
                    <h4>{progress.companyName}</h4>
                    <span className={`status-badge ${progress.isSelected ? 'selected' : progress.currentRound ? 'in-progress' : 'pending'}`}>
                      {progress.isSelected ? 'Selected' : progress.currentRound ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                  {progress.currentRound && (
                    <div className="round-details">
                      <p><strong>Current Round:</strong> {progress.currentRound.name}</p>
                      <p><strong>Progress:</strong> Round {progress.currentRound.index + 1} of {progress.totalRounds}</p>
                      {progress.currentRound.description && (
                        <p><strong>Description:</strong> {progress.currentRound.description}</p>
                      )}
                    </div>
                  )}
                  {progress.isInFinalRound && !progress.isSelected && (
                    <p className="final-round-notice">You're in the final round! Good luck! 🍀</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
        <Card title="Upcoming companies">
          <div className="table-card">
            <Table columns={[{label:'Company', key:'company'},{label:'Drive Date', key:'date'}]}
              rows={upcoming.map(r=>({ company: r.company?.name || r.companyNameCached, date: new Date(r.driveDate).toLocaleString() }))} />
          </div>
        </Card>
        <Card title="Registered companies" actions={
          <Button onClick={async () => {
            if (user._id) {
              // Refresh applications
              try {
                const appResponse = await fetch(`/api/users/${user._id}/applications`, { credentials: 'include' })
                const appData = await appResponse.json()
                console.log('Refreshed applications:', appData)
                setApplications(appData.data || [])
              } catch (error) {
                console.error('Failed to refresh applications:', error)
              }
              
              // Refresh placement status
              await refreshPlacementStatus()
            }
          }}>🔄 Refresh All</Button>
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



