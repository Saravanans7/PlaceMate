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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [roundStudents, setRoundStudents] = useState([])
  const [roundResults, setRoundResults] = useState([])
  const [processingRound, setProcessingRound] = useState(false)

  useEffect(() => { load() }, [id])
  
  async function load() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/drives/${id}`, { credentials: 'include' })
      const d = await r.json()
      
      if (!r.ok) {
        throw new Error(d.message || 'Failed to load drive')
      }
      
      setDrive(d.data)
      
      // Set current round index from database
      if (d.data?.currentRoundIndex !== undefined) {
        setCurrentRoundIndex(d.data.currentRoundIndex)
      }
      
      // Load applicants for this drive's registration
      if (d.data?.registration?._id) {
        console.log('Loading applicants for registration:', d.data.registration._id)
        const appR = await fetch(`/api/registrations/${d.data.registration._id}/applicants`, { credentials: 'include' })
        const appD = await appR.json()
        
        if (!appR.ok) {
          console.error('Failed to load applicants:', appD)
          setError('Failed to load registered students')
        } else {
          console.log('Applicants data:', appD)
          setApplicants(appD.data || [])
        }
      }
    } catch (err) {
      console.error('Error loading drive:', err)
      setError(err.message || 'Failed to load drive')
    } finally {
      setLoading(false)
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

  function toggleRoundStudent(studentId) {
    setRoundStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  async function processRound() {
    if (roundStudents.length === 0) {
      alert('Please select students to move to next round')
      return
    }

    setProcessingRound(true)
    try {
      const isLastRound = currentRoundIndex === (drive.rounds.length - 1)
      
      if (isLastRound) {
        // This is the final round - mark students as placed and close the drive
        await fetch(`/api/drives/${id}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            finalSelected: roundStudents, 
            close: true 
          })
        })
        alert(`${roundStudents.length} students have been placed! Drive closed and stats updated.`)
      } else {
        // Move students to next round
        const results = roundStudents.map(studentId => ({
          student: studentId,
          status: 'passed',
          notes: 'Selected for next round'
        }))

        await fetch(`/api/drives/${id}/rounds/${currentRoundIndex}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            results,
            nextRoundIndex: currentRoundIndex + 1
          })
        })

        // Move to next round
        setCurrentRoundIndex(prev => prev + 1)
        setRoundStudents([])
        alert(`Students moved to Round ${currentRoundIndex + 2}`)
      }
      
      // Reload data
      await load()
    } catch (error) {
      console.error('Error processing round:', error)
      alert('Failed to process round')
    } finally {
      setProcessingRound(false)
    }
  }

  function getStudentsForCurrentRound() {
    if (currentRoundIndex === 0) {
      // First round - show all applicants
      return applicants
    } else {
      // Subsequent rounds - show students from previous round
      const previousRound = drive.rounds[currentRoundIndex - 1]
      const passedStudents = previousRound.results
        ?.filter(result => result.status === 'passed')
        ?.map(result => result.student) || []
      
      return applicants.filter(app => passedStudents.includes(app.student._id))
    }
  }

  function getRoundStatus() {
    if (currentRoundIndex >= drive.rounds.length) {
      return 'completed'
    }
    const currentRound = drive.rounds[currentRoundIndex]
    return currentRound.results?.length > 0 ? 'completed' : 'in-progress'
  }

  if (loading) {
    return (
      <div className="container">
        <Card title="Loading Drive...">
          <p>Loading drive information...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <Card title="Error">
          <p>Error: {error}</p>
          <Button onClick={load}>Try Again</Button>
        </Card>
      </div>
    )
  }

  if (!drive) {
    return (
      <div className="container">
        <Card title="Drive Not Found">
          <p>The requested drive was not found.</p>
          <Button onClick={load}>Refresh</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container grid-2">
      <div className="stack">
        <Card title="Drive Information">
          <div className="drive-info">
            <p><strong>Company:</strong> {drive.company?.name || drive.registration?.companyNameCached}</p>
            <p><strong>Drive Date:</strong> {new Date(drive.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {drive.isClosed ? 'Closed' : 'Active'}</p>
            <p><strong>Total Applicants:</strong> {applicants.length}</p>
          </div>
        </Card>

        <Card title="Announcements" actions={<Button onClick={postAnnouncement}>Post</Button>}>
          <FormInput label="New Announcement" value={announcement} onChange={e=>setAnnouncement(e.target.value)} />
          {(drive.announcements||[]).slice().reverse().map((a,i)=> (
            <div key={i} className="announcement-item">
              <small>{new Date(a.postedAt).toLocaleString()}</small>
              <p>{a.text}</p>
            </div>
          ))}
        </Card>
        
        <Card title="Recruitment Rounds">
          {(drive.rounds||[]).map((r,i)=> (
            <div key={i} className={`round-item ${i === currentRoundIndex ? 'current-round' : i < currentRoundIndex ? 'completed-round' : 'upcoming-round'}`}>
              <div className="round-header">
                <h4>Round {i + 1}: {r.name}</h4>
                <div className="round-status-info">
                  {i < currentRoundIndex ? (
                    <span className="round-status completed">Completed</span>
                  ) : i === currentRoundIndex ? (
                    <span className="round-status current">Current</span>
                  ) : (
                    <span className="round-status upcoming">Upcoming</span>
                  )}
                  <span className="round-count">{r.shortlisted?.length || 0} students</span>
                </div>
              </div>
              {r.description && <p className="round-description">{r.description}</p>}
              {i < currentRoundIndex && r.results && (
                <div className="round-results">
                  <p><strong>Results:</strong> {r.results.filter(r => r.status === 'passed').length} passed, {r.results.filter(r => r.status === 'failed').length} failed</p>
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>
      <div>
        {/* Round Management */}
        {currentRoundIndex < drive.rounds.length && (
          <Card title={`Round ${currentRoundIndex + 1}: ${drive.rounds[currentRoundIndex]?.name || 'Current Round'}`} actions={
            <div className="card-actions">
              <Button 
                onClick={processRound} 
                disabled={processingRound || roundStudents.length === 0}
                variant={currentRoundIndex === drive.rounds.length - 1 ? 'success' : 'primary'}
              >
                {processingRound ? 'Processing...' : 
                 currentRoundIndex === drive.rounds.length - 1 ? 
                 `Place ${roundStudents.length} Students` : 
                 `Move ${roundStudents.length} to Next Round`}
              </Button>
            </div>
          }>
            <div className="round-management">
              <div className="round-info">
                <p><strong>Current Round:</strong> {drive.rounds[currentRoundIndex]?.name}</p>
                <p><strong>Description:</strong> {drive.rounds[currentRoundIndex]?.description || 'No description provided'}</p>
                <p><strong>Students in this round:</strong> {getStudentsForCurrentRound().length}</p>
                <p><strong>Selected for next round:</strong> {roundStudents.length}</p>
              </div>
              
              <div className="students-selection">
                <h4>Select students to move to next round:</h4>
                <div className="students-list">
                  {getStudentsForCurrentRound().map(app => (
                    <div key={app._id} className={`student-card ${roundStudents.includes(app.student._id) ? 'selected' : ''}`}>
                      <label className="student-checkbox">
                        <input 
                          type="checkbox" 
                          checked={roundStudents.includes(app.student._id)}
                          onChange={() => toggleRoundStudent(app.student._id)}
                        />
                        <div className="student-info">
                          <div className="student-name">{app.student.name || 'No name'}</div>
                          <div className="student-details">
                            <span>Email: {app.student.email}</span>
                            {app.student.batch && <span>Batch: {app.student.batch}</span>}
                            {app.student.cgpa && <span>CGPA: {app.student.cgpa}</span>}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Final Placement */}
        {currentRoundIndex >= drive.rounds.length && (
          <Card title="Drive Completed" actions={
            <div className="card-actions">
              <Button onClick={finalizeDrive} disabled={finalizing || selectedStudents.length === 0}>
                {finalizing ? 'Finalizing...' : `Finalize ${selectedStudents.length} selected`}
              </Button>
            </div>
          }>
            <div className="drive-completed">
              <p>All rounds have been completed. You can now finalize the remaining students.</p>
            </div>
          </Card>
        )}

        <Card title={`All Registered Students (${applicants.length})`} actions={
          <div className="card-actions">
            <Button onClick={load}>Refresh</Button>
          </div>
        }>
          {applicants.length === 0 ? (
            <div className="no-applicants">
              <p>No students have registered for this drive yet.</p>
              <p>Students need to register for the company before they can be finalized.</p>
            </div>
          ) : (
            <div className="applicants-list">
              <div className="applicants-header">
                <p>Select students to finalize for placement:</p>
              </div>
              {applicants.map(app => (
                <div key={app._id} className={`applicant-card ${selectedStudents.includes(app.student._id) ? 'selected' : ''}`}>
                  <label className="applicant-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(app.student._id)}
                      onChange={() => toggleStudent(app.student._id)}
                    />
                    <div className="applicant-info">
                      <div className="applicant-name">{app.student.name || 'No name'}</div>
                      <div className="applicant-details">
                        <span>Email: {app.student.email}</span>
                        {app.student.batch && <span>Batch: {app.student.batch}</span>}
                        {app.student.cgpa && <span>CGPA: {app.student.cgpa}</span>}
                        {app.student.rollNumber && <span>Roll: {app.student.rollNumber}</span>}
                      </div>
                      <div className="application-date">
                        Registered: {new Date(app.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}



