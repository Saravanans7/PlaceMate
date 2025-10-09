import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card } from '../components/UI.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { FiCheckCircle, FiXCircle, FiClock, FiUserCheck, FiUserX } from 'react-icons/fi'

export default function DriveStudent() {
  const { companyName } = useParams()
  const { toast } = useToast()
  const [drive, setDrive] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDriveWithProgress()
  }, [companyName])

  async function loadDriveWithProgress() {
    setLoading(true)
    try {
      const response = await fetch(`/api/drives/student/${encodeURIComponent(companyName)}`, { 
        credentials: 'include' 
      })
      const data = await response.json()
      
      if (response.ok) {
        setDrive(data.data)
      } else if (response.status === 403) {
        toast.error('Access Denied', data.message || 'You are not registered for this drive')
        setDrive(null)
      } else {
        toast.error('Load Failed', data.message || 'Failed to load drive information')
        setDrive(null)
      }
    } catch (error) {
      toast.error('Load Failed', 'Failed to load drive information due to a network error')
      setDrive(null)
    }
    setLoading(false)
  }

  function getRoundStatusIcon(status) {
    switch (status) {
      case 'completed':
      case 'selected':
      case 'passed':
        return <FiCheckCircle className="status-icon success" />
      case 'eliminated':
      case 'rejected':
        return <FiXCircle className="status-icon error" />
      case 'shortlisted':
        return <FiUserCheck className="status-icon info" />
      case 'current':
        return <FiClock className="status-icon warning" />
      default:
        return <FiClock className="status-icon pending" />
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'selected':
        return 'Selected'
      case 'passed':
        return 'Passed'
      case 'eliminated':
        return 'Eliminated'
      case 'rejected':
        return 'Rejected'
      case 'shortlisted':
        return 'Shortlisted'
      case 'current':
        return 'Current Round'
      default:
        return 'Pending'
    }
  }

  function getOverallStatusMessage() {
    if (!drive?.studentProgress) return ''
    
    const { status, currentRound, isSelected, isEliminated } = drive.studentProgress
    
    if (isSelected) {
      return '🎉 Congratulations! You have been selected for this position.'
    } else if (isEliminated) {
      return 'Unfortunately, you were not selected for this position.'
    } else if (status === 'awaiting_final_results') {
      return 'All rounds completed. Waiting for final results.'
    } else if (status === 'in_progress') {
      return `You are currently in the recruitment process. Current round: ${currentRound + 1}`
    } else {
      return 'You are registered for this drive.'
    }
  }

  if (loading) {
    return <div className="container"><p>Loading drive information...</p></div>
  }

  if (!drive) {
    return (
      <div className="container">
        <Card title="Drive Information">
          <p>Drive information is not available. You may not be registered for this drive or the drive may not have started yet.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Overall Status */}
      <Card title={`${companyName} — Your Progress`}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: drive.studentProgress.isSelected ? '#f0fdf4' : 
                           drive.studentProgress.isEliminated ? '#fef2f2' : '#fef3c7',
          border: `1px solid ${drive.studentProgress.isSelected ? '#bbf7d0' : 
                               drive.studentProgress.isEliminated ? '#fecaca' : '#fed7aa'}`,
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {drive.studentProgress.isSelected ? (
              <FiUserCheck style={{ color: '#16a34a', fontSize: '24px' }} />
            ) : drive.studentProgress.isEliminated ? (
              <FiUserX style={{ color: '#dc2626', fontSize: '24px' }} />
            ) : (
              <FiClock style={{ color: '#d97706', fontSize: '24px' }} />
            )}
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: drive.studentProgress.isSelected ? '#16a34a' : 
                                                   drive.studentProgress.isEliminated ? '#dc2626' : '#d97706' }}>
                {drive.studentProgress.isSelected ? 'Selected' : 
                 drive.studentProgress.isEliminated ? 'Not Selected' : 'In Progress'}
              </h3>
              <p style={{ margin: 0, color: '#6b7280' }}>{getOverallStatusMessage()}</p>
            </div>
          </div>
        </div>

        {/* Registration Info */}
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
          <p><strong>Registration Date:</strong> {new Date(drive.registrationDate).toLocaleDateString()}</p>
          <p><strong>Drive Date:</strong> {drive.date ? new Date(drive.date).toLocaleDateString() : 'TBD'}</p>
        </div>
      </Card>

      <div className="grid">
        {/* Round Progress */}
        <Card title="Round Progress">
          {drive.studentProgress.rounds.length === 0 ? (
            <p>No rounds information available yet.</p>
          ) : (
            <div className="round-progress">
              {drive.studentProgress.rounds.map((round, index) => (
                <div 
                  key={index} 
                  className={`round-item ${
                    round.status === 'completed' ? 'completed-round' :
                    round.status === 'eliminated' ? 'eliminated-round' :
                    round.status === 'current' ? 'current-round' : ''
                  }`}
                >
                  <div className="round-header">
                    <h4>{round.name}</h4>
                    <div className="round-status-info">
                      <div className={`round-status ${round.status}`}>
                        {getStatusText(round.status)}
                      </div>
                      {getRoundStatusIcon(round.status)}
                    </div>
                  </div>
                  
                  <div className="round-description">
                    <p>{round.description}</p>
                  </div>
                  
                  {round.notes && (
                    <div className="round-results">
                      <p><strong>Notes:</strong> {round.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Announcements */}
        <Card title="Announcements">
          {drive.announcements && drive.announcements.length > 0 ? (
            <div>
              {drive.announcements.slice().reverse().map((announcement, i) => (
                <div key={i} className="announcement-item">
                  <small>{new Date(announcement.postedAt).toLocaleString()}</small>
                  <p>{announcement.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No announcements yet.</p>
          )}
        </Card>
      </div>
    </div>
  )
}



