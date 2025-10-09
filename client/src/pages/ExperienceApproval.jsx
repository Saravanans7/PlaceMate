import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal } from '../components/UI.jsx'

export default function ExperienceApproval() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedExperience, setSelectedExperience] = useState(null)
  const [showModal, setShowModal] = useState(false)

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
        setShowModal(false) // Close modal after action
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
        setShowModal(false) // Close modal after action
      }
    } catch (error) {
      console.error('Failed to reject experience:', error)
    }
  }

  function viewExperience(exp) {
    setSelectedExperience(exp)
    setShowModal(true)
  }

  function handleApproveFromModal() {
    if (selectedExperience) {
      approveExperience(selectedExperience._id)
    }
  }

  function handleRejectFromModal() {
    if (selectedExperience) {
      rejectExperience(selectedExperience._id)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container">
      <Card title="Interview Experience Approval" actions={
        <Button onClick={loadExperiences}>Refresh</Button>
      }>
        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
            <p style={{ color: 'red', margin: 0 }}>Error: {error}</p>
          </div>
        )}
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
                    {(r.content || '').substring(0, 100)}...
                  </div>
                )},
                { label: 'Submitted', key: 'submittedAt' },
                { label: 'Actions', render: r => (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => viewExperience(r)}>View</Button>
                    <Button onClick={() => approveExperience(r._id)}>Approve</Button>
                    <Button variant="secondary" onClick={() => rejectExperience(r._id)}>Reject</Button>
                  </div>
                )}
              ]}
              rows={experiences.map(exp => ({
                _id: exp._id,
                companyName: exp.companyNameCached || exp.companyName,
                studentName: exp.student?.name || exp.student?.email || 'Unknown',
                content: exp.content,
                submittedAt: new Date(exp.createdAt).toLocaleDateString(),
                ...exp // Include all experience data for the modal
              }))} />
            </div>
          </div>
        )}
      </Card>

      <Modal 
        open={showModal} 
        title="Interview Experience Details"
        onClose={() => setShowModal(false)}
      >
        {selectedExperience && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>Company:</strong> {selectedExperience.companyNameCached || selectedExperience.companyName}</p>
              <p><strong>Student:</strong> {selectedExperience.student?.name || selectedExperience.student?.email || 'Unknown'}</p>
              <p><strong>Submitted:</strong> {new Date(selectedExperience.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <h4>Experience Details:</h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                {selectedExperience.content || 'No content provided'}
              </div>
            </div>

            {selectedExperience.questions && selectedExperience.questions.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4>Questions Asked:</h4>
                <ul>
                  {selectedExperience.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleRejectFromModal}>
                Reject
              </Button>
              <Button onClick={handleApproveFromModal}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
