import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function PlacedStudentExperience() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [placementInfo, setPlacementInfo] = useState(null)
  const [experience, setExperience] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlacementInfo()
  }, [])

  async function loadPlacementInfo() {
    try {
      const response = await fetch('/api/users/me/placement', { credentials: 'include' })
      const data = await response.json()
      
      if (response.ok) {
        setPlacementInfo(data.data)
      } else {
        setMessage('Failed to load placement information')
      }
    } catch (error) {
      setMessage('Error loading placement information')
    } finally {
      setLoading(false)
    }
  }

  async function submitExperience() {
    if (!experience.trim()) {
      setMessage('Please enter your interview experience')
      return
    }

    if (!placementInfo?.isPlaced) {
      setMessage('You are not placed yet')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyName: placementInfo.placedCompanyName,
          experience: experience.trim()
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        setMessage('Experience submitted successfully! It will be reviewed by staff.')
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setMessage(data.message || 'Failed to submit experience')
      }
    } catch (error) {
      setMessage('Error submitting experience')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="container">
        <Card title="Loading...">
          <p>Loading your placement information...</p>
        </Card>
      </div>
    )
  }

  if (!placementInfo?.isPlaced) {
    return (
      <div className="container">
        <Card title="Not Placed">
          <p>You are not placed yet. You can only write interview experiences for companies where you have been placed.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container">
      <Card title={`Write Interview Experience — ${placementInfo.placedCompanyName}`}>
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>🎉 Congratulations on your placement!</h4>
          <p style={{ margin: 0 }}>
            You were placed at <strong>{placementInfo.placedCompanyName}</strong> on{' '}
            {new Date(placementInfo.placedAt).toLocaleDateString()}.
            <br />
            Share your interview experience to help other students prepare for this company.
          </p>
        </div>
        
        <label className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Your Interview Experience</span>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Describe your interview process, questions asked, tips, and overall experience..."
            style={{
              minHeight: '300px',
              padding: '12px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </label>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <Button onClick={submitExperience} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Experience'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
        </div>
        
        {message && (
          <p style={{ 
            marginTop: '16px', 
            padding: '8px', 
            backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') ? '#155724' : '#721c24',
            borderRadius: '4px'
          }}>
            {message}
          </p>
        )}
      </Card>
    </div>
  )
}
