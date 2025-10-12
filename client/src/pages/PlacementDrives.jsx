import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../components/UI.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function PlacementDrives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingDrive, setEditingDrive] = useState(null)
  const [editForm, setEditForm] = useState({
    date: '',
    announcements: [],
    rounds: []
  })
  const navigate = useNavigate()
  const { addToast } = useToast()

  useEffect(() => { loadDrives() }, [])

  async function loadDrives() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/drives', { credentials: 'include' })
      const d = await r.json()

      if (!r.ok) {
        throw new Error(d.message || 'Failed to load drives')
      }

      setDrives(d.data || [])
    } catch (err) {
      console.error('Error loading drives:', err)
      setError(err.message || 'Failed to load drives')
    } finally {
      setLoading(false)
    }
  }

  function startEditing(drive) {
    setEditingDrive(drive._id)
    setEditForm({
      date: drive.date ? new Date(drive.date).toISOString().split('T')[0] : '',
      announcements: drive.announcements || [],
      rounds: drive.rounds || []
    })
  }

  function cancelEditing() {
    setEditingDrive(null)
    setEditForm({ date: '', announcements: [], rounds: [] })
  }

  async function saveDrive() {
    try {
      const response = await fetch(`/api/drives/${editingDrive}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: editForm.date ? new Date(editForm.date).toISOString() : undefined,
          announcements: editForm.announcements,
          rounds: editForm.rounds
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update drive')
      }

      addToast('Drive updated successfully', 'success')
      setEditingDrive(null)
      loadDrives()
    } catch (err) {
      console.error('Error updating drive:', err)
      addToast(err.message || 'Failed to update drive', 'error')
    }
  }

  async function deleteDrive(driveId) {
    if (!confirm('Are you sure you want to delete this drive? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/drives/${driveId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete drive')
      }

      addToast('Drive deleted successfully', 'success')
      loadDrives()
    } catch (err) {
      console.error('Error deleting drive:', err)
      addToast(err.message || 'Failed to delete drive', 'error')
    }
  }

  function updateEditForm(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  function addRound() {
    setEditForm(prev => ({
      ...prev,
      rounds: [...prev.rounds, { name: '', description: '', shortlisted: [], results: [] }]
    }))
  }

  function updateRound(index, field, value) {
    setEditForm(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, i) =>
        i === index ? { ...round, [field]: value } : round
      )
    }))
  }

  function removeRound(index) {
    setEditForm(prev => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="container">
        <Card title="Loading Placement Drives...">
          <p>Loading drives...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <Card title="Error">
          <p>Error: {error}</p>
          <Button onClick={loadDrives}>Try Again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Placement Drives Management</h1>
        <p>View and manage all placement drives</p>
      </div>

      {drives.length === 0 ? (
        <Card title="No Drives Found">
          <p>No placement drives have been created yet.</p>
        </Card>
      ) : (
        <div className="drives-list">
          {drives.map(drive => (
            <Card
              key={drive._id}
              title={`${drive.company?.name || drive.registration?.companyNameCached || 'Unknown Company'} - ${new Date(drive.date).toLocaleDateString()}`}
              actions={
                <div className="drive-actions">
                  <Button
                    onClick={() => navigate(`/staff/drive/${drive._id}`)}
                    variant="primary"
                  >
                    Manage Drive
                  </Button>
                  {!drive.isClosed && editingDrive !== drive._id && (
                    <Button
                      onClick={() => startEditing(drive)}
                      variant="secondary"
                    >
                      Edit
                    </Button>
                  )}
                  {!drive.isClosed && !drive.rounds.some(r => r.results && r.results.length > 0) && (
                    <Button
                      onClick={() => deleteDrive(drive._id)}
                      variant="danger"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              }
            >
              <div className="drive-summary">
                <div className="drive-info">
                  <p><strong>Company:</strong> {drive.company?.name || drive.registration?.companyNameCached}</p>
                  <p><strong>Drive Date:</strong> {new Date(drive.date).toLocaleDateString()}</p>
                  <p><strong>Status:</strong>
                    <span className={`status-${drive.isClosed ? 'closed' : 'active'}`}>
                      {drive.isClosed ? 'Closed' : 'Active'}
                    </span>
                  </p>
                  <p><strong>Rounds:</strong> {drive.rounds?.length || 0}</p>
                  <p><strong>Current Round:</strong> {drive.currentRoundIndex + 1} of {drive.rounds?.length || 0}</p>
                  {drive.finalSelected && drive.finalSelected.length > 0 && (
                    <p><strong>Placed Students:</strong> {drive.finalSelected.length}</p>
                  )}
                </div>

                {editingDrive === drive._id && (
                  <div className="drive-edit-form">
                    <h3>Edit Drive</h3>

                    <div className="form-group">
                      <label>Drive Date:</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={e => updateEditForm('date', e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Rounds:</label>
                      {editForm.rounds.map((round, index) => (
                        <div key={index} className="round-edit">
                          <div className="round-fields">
                            <input
                              type="text"
                              placeholder="Round Name"
                              value={round.name}
                              onChange={e => updateRound(index, 'name', e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={round.description}
                              onChange={e => updateRound(index, 'description', e.target.value)}
                              className="form-input"
                            />
                            <Button
                              onClick={() => removeRound(index)}
                              variant="danger"
                              size="small"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button onClick={addRound} variant="secondary" size="small">
                        Add Round
                      </Button>
                    </div>

                    <div className="edit-actions">
                      <Button onClick={saveDrive} variant="success">
                        Save Changes
                      </Button>
                      <Button onClick={cancelEditing} variant="secondary">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
