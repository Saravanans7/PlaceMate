import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, Button } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingWrapper from '../components/LoadingWrapper.jsx'
import { SkeletonCard } from '../components/SkeletonComponents.jsx'

export default function CompanyDetail() {
  const { companyName } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [registeredStudents, setRegisteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  useEffect(() => {
    loadCompanyData()
  }, [companyName])

  async function loadCompanyData() {
    setLoading(true)
    setError(null)
    try {
      // Fetch company data
      const companyResponse = await fetch(`/api/companies?search=${encodeURIComponent(companyName)}`, { credentials: 'include' })
      const companyData = await companyResponse.json()
      
      if (!companyResponse.ok) {
        throw new Error(companyData.message || 'Failed to load company')
      }
      
      const foundCompany = (companyData.data || []).find(c => c.name === companyName)
      if (!foundCompany) {
        throw new Error('Company not found')
      }
      
      setCompany(foundCompany)
      
      // Only fetch detailed registration data for staff users
      if (user?.role === 'staff') {
        // Fetch registrations for this company
        console.log('Fetching registrations for company:', foundCompany._id)
        const regResponse = await fetch(`/api/registrations?company=${foundCompany._id}`, { credentials: 'include' })
        const regData = await regResponse.json()
        
        console.log('Registrations response:', regResponse.ok, regData)
        
        if (regResponse.ok) {
          setRegistrations(regData.data || [])
          
          // Fetch registered students for each registration
          const allStudents = []
          for (const reg of regData.data || []) {
            console.log('Fetching students for registration:', reg._id)
            try {
              // Applicants endpoint is mounted at /api/registrations/:id/applicants
              const studentsResponse = await fetch(`/api/registrations/${reg._id}/applicants`, { credentials: 'include' })
              const studentsData = await studentsResponse.json()
              
              console.log('Students response for registration', reg._id, ':', studentsResponse.ok, studentsData)
              
              if (studentsResponse.ok) {
                const studentsWithRegInfo = (studentsData.data || []).map(student => ({
                  ...student,
                  registrationInfo: {
                    driveDate: reg.driveDate,
                    batch: reg.batch,
                    status: reg.status
                  }
                }))
                allStudents.push(...studentsWithRegInfo)
              } else {
                console.error('Failed to fetch students for registration:', reg._id, studentsData)
              }
            } catch (err) {
              console.error(`Failed to load students for registration ${reg._id}:`, err)
            }
          }
          console.log('Total students found:', allStudents.length)
          setRegisteredStudents(allStudents)
        } else {
          console.error('Failed to fetch registrations:', regData)
        }
      } else {
        // For students, check if they have already registered for this company
        setRegistrations([])
        setRegisteredStudents([])
        if (user?._id) {
          try {
            // Find open registrations for this company
            const regResponse = await fetch(`/api/registrations?company=${foundCompany._id}&status=open`, { credentials: 'include' })
            const regData = await regResponse.json()
            if (regResponse.ok) {
              const regs = regData.data || []
              if (regs.length > 0) {
                // Load user's applications and check if any match these registrations
                const appsResponse = await fetch(`/api/users/${user._id}/applications`, { credentials: 'include' })
                const appsData = await appsResponse.json()
                if (appsResponse.ok) {
                  const appRegIds = new Set((appsData.data || []).map(a => String(a.registration?._id || a.registration)))
                  const hasApplied = regs.some(r => appRegIds.has(String(r._id)))
                  setAlreadyRegistered(hasApplied)
                }
              }
            }
          } catch (e) {
            console.error('Failed to check existing registration', e)
          }
        }
      }
    } catch (err) {
      console.error('Error loading company data:', err)
      setError(err.message || 'Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  async function manageRoundsForRegistration(registrationId) {
    try {
      const r = await fetch(`/api/drives/by-registration/${registrationId}`, { credentials: 'include' })
      const d = await r.json()
      if (!r.ok) {
        throw new Error(d.message || 'Failed to open drive manager')
      }
      navigate(`/staff/drive/${d.data._id}`)
    } catch (e) {
      alert(e.message || 'Failed to open drive manager')
    }
  }

  const skeletonComponent = (
    <div className="container grid">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )

  if (loading) {
    return (
      <LoadingWrapper 
        isLoading={true} 
        skeletonComponent={skeletonComponent}
        loadingMessage="Loading company details..."
      >
        <div className="container">
          <Card title="Loading...">
            <p>Loading company information...</p>
          </Card>
        </div>
      </LoadingWrapper>
    )
  }

  if (error) {
    return (
      <div className="container">
        <Card title="Error">
          <p>Error: {error}</p>
          <Button onClick={loadCompanyData}>Try Again</Button>
        </Card>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container">
        <Card title="Company Not Found">
          <p>The company "{companyName}" was not found.</p>
          <Link to="/company" className="btn btn-primary">Back to Companies</Link>
        </Card>
      </div>
    )
  }

  return (
    <LoadingWrapper 
      isLoading={false} 
      skeletonComponent={skeletonComponent}
      loadingMessage="Loading company details..."
    >
      <div className="container grid">
      <Card title={`${company.name} — ${company.role || ''}`}>
        <div className="company-info">
          <p><b>Location:</b> {company.location||'-'}</p>
          <p><b>Salary:</b> {company.salaryLPA||'-'} LPA</p>
          <p><b>Last drive:</b> {company.lastDriveDate? new Date(company.lastDriveDate).toLocaleDateString(): '-'}</p>
          {user?.role === 'staff' && (
            <>
              <p><b>Total Registrations:</b> {registrations.length}</p>
              <p><b>Total Registered Students:</b> {registeredStudents.length}</p>
            </>
          )}
        </div>
        <div className="cta">
          {user?.role === 'staff' && (
            <Link className="btn btn-primary" to={`/company/create-registration?companyId=${company._id}`}>Open Registration</Link>
          )}
          {user?.role === 'student' && !alreadyRegistered && (
            <Link className="btn btn-primary" to={`/company/${encodeURIComponent(company.name)}/register`}>Register</Link>
          )}
          {user?.role === 'student' && alreadyRegistered && (
            <span className="btn btn-secondary" aria-disabled="true">Already Registered</span>
          )}
          {user?.role === 'student' && alreadyRegistered && (
            <Link className="btn btn-primary" to={`/drive/${encodeURIComponent(company.name)}`}>View Drive</Link>
          )}
          {user?.role === 'student' && (
            <Link className="btn btn-primary" to={`/company/${encodeURIComponent(company.name)}/add-interview-experience`}>Add Interview Experience</Link>
          )}
          <Link className="btn btn-secondary" to={`/company/${encodeURIComponent(company.name)}/interview-experience`}>Interview Experiences</Link>
        </div>
      </Card>

      {/* Only show registered students to staff/admin */}
      {user?.role === 'staff' && (
        <div>
          <Card title={`Registrations (${registrations.length})`}>
            {registrations.length === 0 ? (
              <p>No registrations found for this company.</p>
            ) : (
              <div className="students-list">
                {registrations.map((reg) => (
                  <div key={reg._id} className="student-card">
                    <div className="student-header">
                      <h4>Drive: {new Date(reg.driveDate).toLocaleDateString()} • Batch {reg.batch}</h4>
                      <span className={`status-badge ${reg.status}`}>{reg.status}</span>
                    </div>
                    <div className="registration-info">
                      <Button onClick={() => manageRoundsForRegistration(reg._id)}>Manage Rounds</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title={`Registered Students (${registeredStudents.length})`} actions={
            <Button onClick={loadCompanyData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          }>
            {registeredStudents.length === 0 ? (
              <div className="no-students">
                <p>No students have registered for this company yet.</p>
                <p>Students need to register for company drives to appear here.</p>
              </div>
            ) : (
              <div className="students-list">
                {registeredStudents.map((app, index) => (
                  <div key={`${app._id}-${index}`} className="student-card">
                    <div className="student-header">
                      <h4>{app.student.name || 'No name'}</h4>
                      <span className="registration-date">
                        {new Date(app.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="student-details">
                      <span>Email: {app.student.email}</span>
                      {app.student.batch && <span>Batch: {app.student.batch}</span>}
                      {app.student.cgpa && <span>CGPA: {app.student.cgpa}</span>}
                      {app.student.rollNumber && <span>Roll: {app.student.rollNumber}</span>}
                    </div>
                    <div className="registration-info">
                      <span>Drive Date: {new Date(app.registrationInfo.driveDate).toLocaleDateString()}</span>
                      <span>Batch: {app.registrationInfo.batch}</span>
                      <span className={`status-badge ${app.registrationInfo.status}`}>
                        {app.registrationInfo.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Show different content for students */}
      {user?.role === 'student' && (
        <div>
          <Card title="Company Information">
            <div className="student-company-info">
              <h3>About {company.name}</h3>
              <p>This company offers great opportunities for students in your field.</p>
              <div className="company-stats">
                <div className="stat-item">
                  <span className="stat-label">Salary Range:</span>
                  <span className="stat-value">{company.salaryLPA || 'Not specified'} LPA</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Location:</span>
                  <span className="stat-value">{company.location || 'Not specified'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Drive:</span>
                  <span className="stat-value">
                    {company.lastDriveDate ? new Date(company.lastDriveDate).toLocaleDateString() : 'No previous drives'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Recruitment Process">
            <div className="recruitment-info">
              <p>This company typically follows this recruitment process:</p>
              <div className="process-steps">
                {(company.roundsTemplate || []).map((round, index) => (
                  <div key={index} className="process-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <h4>{round.name}</h4>
                      {round.description && <p>{round.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card title="Rounds Template">
        {(company.roundsTemplate||[]).map((r,i)=> (
          <p key={i}><b>Round {i+1}:</b> {r.name} — {r.description||''}</p>
        ))}
      </Card>
    </div>
    </LoadingWrapper>
  )
}



