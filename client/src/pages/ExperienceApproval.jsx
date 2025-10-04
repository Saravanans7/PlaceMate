import { useEffect, useState } from 'react'
import { Card, Table, Button } from '../components/UI.jsx'

export default function ExperienceApproval() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadExperiences()
  }, [])

  async function loadExperiences() {
    try {
      console.log('Loading pending experiences...')
      const response = await fetch('/api/experiences?status=pending', { credentials: 'include' })
      const data = await response.json()
      console.log('Experiences response:', data)
      if (!response.ok) {
        setError(data.message || 'Failed to load experiences')
      } else {
        setExperiences(data.data || [])
        setError(null)
      }
    } catch (error) {
      console.error('Failed to load experiences:', error)
      setError('Network error: ' + error.message)
    }
    setLoading(false)
  }

  async function approveExperience(id) {
    try {
      const response = await fetch(`/api/experiences/${id}/approve`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        loadExperiences() // Reload the list
      }
    } catch (error) {
      console.error('Failed to approve experience:', error)
    }
  }

  async function rejectExperience(id) {
    try {
      const response = await fetch(`/api/experiences/${id}/reject`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        loadExperiences() // Reload the list
      }
    } catch (error) {
      console.error('Failed to reject experience:', error)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container">
      <Card title="Interview Experience Approval" actions={
        <Button onClick={loadExperiences}>Refresh</Button>
      }>
        <div style={{ marginBottom: '16px' }}>
          <p>Debug info: Loading={loading.toString()}, Experiences count: {experiences.length}</p>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
        {error ? (
          <p style={{ color: 'red' }}>Error loading experiences: {error}</p>
        ) : experiences.length === 0 ? (
          <p>No pending interview experiences to review.</p>
        ) : (
          <div>
            <p>Found {experiences.length} pending experience(s)</p>
            <div className="table-card">
              <Table columns={[
                { label: 'Company', key: 'companyName' },
                { label: 'Student', key: 'studentName' },
                { label: 'Experience', render: r => (
                  <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {(r.experience || '').substring(0, 100)}...
                  </div>
                )},
                { label: 'Submitted', key: 'submittedAt' },
                { label: 'Actions', render: r => (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={() => approveExperience(r._id)}>Approve</Button>
                    <Button variant="secondary" onClick={() => rejectExperience(r._id)}>Reject</Button>
                  </div>
                )}
              ]}
              rows={experiences.map(exp => ({
                _id: exp._id,
                companyName: exp.companyNameCached || exp.companyName,
                studentName: exp.student?.name || exp.student?.email || 'Unknown',
                experience: exp.content || exp.experience,
                submittedAt: new Date(exp.createdAt).toLocaleDateString()
              }))} />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
