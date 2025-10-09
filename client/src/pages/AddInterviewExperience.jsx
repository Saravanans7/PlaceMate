import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '../components/UI.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function AddInterviewExperience() {
  const { companyName } = useParams()
  const navigate = useNavigate()
  const [experience, setExperience] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  async function submitExperience() {
    if (!experience.trim()) {
      setMessage('Please enter your interview experience')
      toast.error('Validation Error', 'Please enter your interview experience')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyName,
          experience: experience.trim()
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        setMessage('Experience submitted successfully! It will be reviewed by staff.')
        toast.success('Experience Submitted', 'Your interview experience has been submitted and will be reviewed by staff.')
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setMessage(data.message || 'Failed to submit experience')
        toast.error('Submission Failed', data.message || 'Failed to submit experience')
      }
    } catch (error) {
      setMessage('Error submitting experience')
      toast.error('Submission Failed', 'Error submitting experience due to a network error')
    }
    setSubmitting(false)
  }

  return (
    <div className="container">
      <Card title={`Interview Experience — ${companyName}`}>
        <p>Share your interview experience to help other students prepare for this company.</p>
        
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
