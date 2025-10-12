import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../components/UI.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function PlacementDrives() {
  const [drives, setDrives] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'forthcoming', 'ongoing', 'past'
  const [viewType, setViewType] = useState('all') // 'all', 'registrations', 'drives'
  const [editingDrive, setEditingDrive] = useState(null)
  const [editingRegistration, setEditingRegistration] = useState(null)
  const [editForm, setEditForm] = useState({
    date: '',
    announcements: [],
    rounds: []
  })
  const [editRegistrationForm, setEditRegistrationForm] = useState({
    driveDate: '',
    batch: '',
    eligibility: {
      minCgpa: '',
      maxArrears: '',
      maxHistoryArrears: '',
      minTenthPercent: '',
      minTwelfthPercent: '',
      acceptedBatches: []
    }
  })
  const navigate = useNavigate()
  const { addToast } = useToast()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      // Fetch both drives and registrations in parallel
      const [drivesRes, registrationsRes] = await Promise.all([
        fetch('/api/drives', { credentials: 'include' }),
        fetch('/api/registrations?status=open', { credentials: 'include' })
      ])

      const [drivesData, registrationsData] = await Promise.all([
        drivesRes.json(),
        registrationsRes.json()
      ])

      if (!drivesRes.ok || !registrationsRes.ok) {
        throw new Error('Failed to load data')
      }

      setDrives(drivesData.data || [])
      setRegistrations(registrationsData.data || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load placement data')
    } finally {
      setLoading(false)
    }
  }

  // Get items by view type for counting
  function getItemsByViewType(viewTypeFilter = viewType) {
    switch (viewTypeFilter) {
      case 'registrations':
        return registrations.map(reg => ({
          id: reg._id,
          type: 'registration',
          date: reg.driveDate,
          isUpcoming: new Date(reg.driveDate) > new Date(),
          isOngoing: new Date(reg.driveDate).toDateString() === new Date().toDateString(),
          isPast: new Date(reg.driveDate) < new Date()
        }))
      case 'drives':
        return drives.map(drive => ({
          id: drive._id,
          type: 'drive',
          date: drive.date,
          isUpcoming: false,
          isOngoing: !drive.isClosed,
          isPast: drive.isClosed
        }))
      default:
        return [
          ...registrations.map(reg => ({
            id: reg._id,
            type: 'registration',
            date: reg.driveDate,
            isUpcoming: new Date(reg.driveDate) > new Date(),
            isOngoing: new Date(reg.driveDate).toDateString() === new Date().toDateString(),
            isPast: new Date(reg.driveDate) < new Date()
          })),
          ...drives.map(drive => ({
            id: drive._id,
            type: 'drive',
            date: drive.date,
            isUpcoming: false,
            isOngoing: !drive.isClosed,
            isPast: drive.isClosed
          }))
        ]
    }
  }

  // Filter and combine drives and registrations
  function getFilteredItems() {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Convert registrations to a common format
    const registrationItems = registrations.map(reg => ({
      id: reg._id,
      type: 'registration',
      companyName: reg.companyNameCached || reg.company?.name || 'Unknown Company',
      date: reg.driveDate,
      status: 'registration',
      data: reg,
      isUpcoming: new Date(reg.driveDate) > today,
      isOngoing: new Date(reg.driveDate).toDateString() === today.toDateString(),
      isPast: new Date(reg.driveDate) < today
    }))

    // Convert drives to a common format
    const driveItems = drives.map(drive => ({
      id: drive._id,
      type: 'drive',
      companyName: drive.company?.name || drive.registration?.companyNameCached || 'Unknown Company',
      date: drive.date,
      status: drive.isClosed ? 'completed' : 'ongoing',
      data: drive,
      isUpcoming: false, // Drives are always current or past
      isOngoing: !drive.isClosed,
      isPast: drive.isClosed
    }))

    // Filter by view type first
    let itemsToFilter = []
    switch (viewType) {
      case 'registrations':
        itemsToFilter = registrationItems
        break
      case 'drives':
        itemsToFilter = driveItems
        break
      default:
        itemsToFilter = [...registrationItems, ...driveItems]
    }

    // Then apply time filter
    switch (filter) {
      case 'forthcoming':
        return itemsToFilter.filter(item => item.isUpcoming)
      case 'ongoing':
        return itemsToFilter.filter(item => item.isOngoing)
      case 'past':
        return itemsToFilter.filter(item => item.isPast)
      default:
        return itemsToFilter
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

  function startEditingRegistration(registration) {
    setEditingRegistration(registration._id)
    setEditRegistrationForm({
      driveDate: registration.driveDate ? new Date(registration.driveDate).toISOString().split('T')[0] : '',
      batch: registration.batch || '',
      eligibility: {
        minCgpa: registration.eligibility?.minCgpa || '',
        maxArrears: registration.eligibility?.maxArrears || '',
        maxHistoryArrears: registration.eligibility?.maxHistoryArrears || '',
        minTenthPercent: registration.eligibility?.minTenthPercent || '',
        minTwelfthPercent: registration.eligibility?.minTwelfthPercent || '',
        acceptedBatches: registration.eligibility?.acceptedBatches || []
      }
    })
  }

  function cancelEditing() {
    setEditingDrive(null)
    setEditingRegistration(null)
    setEditForm({ date: '', announcements: [], rounds: [] })
    setEditRegistrationForm({
      driveDate: '',
      batch: '',
      eligibility: {
        minCgpa: '',
        maxArrears: '',
        maxHistoryArrears: '',
        minTenthPercent: '',
        minTwelfthPercent: '',
        acceptedBatches: []
      }
    })
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
      loadData()
    } catch (err) {
      console.error('Error updating drive:', err)
      addToast(err.message || 'Failed to update drive', 'error')
    }
  }

  async function saveRegistration() {
    try {
      const response = await fetch(`/api/registrations/${editingRegistration}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          driveDate: editRegistrationForm.driveDate ? new Date(editRegistrationForm.driveDate).toISOString() : undefined,
          batch: editRegistrationForm.batch,
          eligibility: {
            minCgpa: editRegistrationForm.eligibility.minCgpa || undefined,
            maxArrears: editRegistrationForm.eligibility.maxArrears || undefined,
            maxHistoryArrears: editRegistrationForm.eligibility.maxHistoryArrears || undefined,
            minTenthPercent: editRegistrationForm.eligibility.minTenthPercent || undefined,
            minTwelfthPercent: editRegistrationForm.eligibility.minTwelfthPercent || undefined,
            acceptedBatches: editRegistrationForm.eligibility.acceptedBatches
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update registration')
      }

      addToast('Registration updated successfully', 'success')
      setEditingRegistration(null)
      loadData()
    } catch (err) {
      console.error('Error updating registration:', err)
      addToast(err.message || 'Failed to update registration', 'error')
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
      loadData()
    } catch (err) {
      console.error('Error deleting drive:', err)
      addToast(err.message || 'Failed to delete drive', 'error')
    }
  }

  async function deleteRegistration(registrationId) {
    if (!confirm('Are you sure you want to delete this registration? This will also delete all associated applications and cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete registration')
      }

      addToast('Registration deleted successfully', 'success')
      loadData()
    } catch (err) {
      console.error('Error deleting registration:', err)
      addToast(err.message || 'Failed to delete registration', 'error')
    }
  }

  function updateEditForm(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  function updateEditRegistrationForm(field, value) {
    if (field.startsWith('eligibility.')) {
      const eligibilityField = field.split('.')[1]
      setEditRegistrationForm(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          [eligibilityField]: value
        }
      }))
    } else {
      setEditRegistrationForm(prev => ({ ...prev, [field]: value }))
    }
  }

  function addAcceptedBatch() {
    setEditRegistrationForm(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        acceptedBatches: [...(prev.eligibility.acceptedBatches || []), '']
      }
    }))
  }

  function updateAcceptedBatch(index, value) {
    setEditRegistrationForm(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        acceptedBatches: prev.eligibility.acceptedBatches.map((batch, i) =>
          i === index ? value : batch
        )
      }
    }))
  }

  function removeAcceptedBatch(index) {
    setEditRegistrationForm(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        acceptedBatches: prev.eligibility.acceptedBatches.filter((_, i) => i !== index)
      }
    }))
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
          <Button onClick={loadData}>Try Again</Button>
        </Card>
      </div>
    )
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="container">
      <div className="page-header">
        <h1>Placement Management</h1>
        <p>View and manage all placement registrations and drives</p>
        <div className="view-indicator">
          Currently viewing: <strong>{viewType === 'all' ? 'All Items' : viewType === 'registrations' ? 'Registrations Only' : 'Drives Only'}</strong>
        </div>
      </div>

      {/* View Type Selector */}
      <Card className="view-type-selector">
        <div className="filter-buttons">
          <Button
            variant={viewType === 'all' ? 'primary' : 'secondary'}
            onClick={() => setViewType('all')}
          >
            All Items ({registrations.length + drives.length})
          </Button>
          <Button
            variant={viewType === 'registrations' ? 'primary' : 'secondary'}
            onClick={() => setViewType('registrations')}
          >
            Registrations ({registrations.length})
          </Button>
          <Button
            variant={viewType === 'drives' ? 'primary' : 'secondary'}
            onClick={() => setViewType('drives')}
          >
            Drives ({drives.length})
          </Button>
        </div>
      </Card>

      {/* Filter Buttons */}
      <Card>
        <div className="filter-buttons">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All Time
          </Button>
          <Button
            variant={filter === 'forthcoming' ? 'primary' : 'secondary'}
            onClick={() => setFilter('forthcoming')}
          >
            Forthcoming ({getItemsByViewType().filter(item => item.isUpcoming).length})
          </Button>
          <Button
            variant={filter === 'ongoing' ? 'primary' : 'secondary'}
            onClick={() => setFilter('ongoing')}
          >
            Ongoing ({getItemsByViewType().filter(item => item.isOngoing).length})
          </Button>
          <Button
            variant={filter === 'past' ? 'primary' : 'secondary'}
            onClick={() => setFilter('past')}
          >
            Past ({getItemsByViewType().filter(item => item.isPast).length})
          </Button>
        </div>
      </Card>

      {filteredItems.length === 0 ? (
        <Card title="No Items Found">
          <p>No {filter !== 'all' ? filter : ''} {viewType !== 'all' ? viewType : 'placement'} items found.</p>
          {(filter !== 'all' || viewType !== 'all') && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {filter !== 'all' && <Button onClick={() => setFilter('all')}>Show All Time</Button>}
              {viewType !== 'all' && <Button onClick={() => setViewType('all')}>Show All Types</Button>}
            </div>
          )}
        </Card>
      ) : (
        <div className="drives-list">
          {filteredItems.map(item => (
            <Card
              key={`${item.type}-${item.id}`}
              title={`${item.companyName} - ${new Date(item.date).toLocaleDateString()}`}
              actions={
                <div className="drive-actions">
                  {item.type === 'drive' ? (
                    <>
                      <Button
                        onClick={() => navigate(`/staff/drive/${item.id}`)}
                        variant="primary"
                      >
                        Manage Drive
                      </Button>
                      {!item.data.isClosed && editingDrive !== item.id && (
                        <Button
                          onClick={() => startEditing(item.data)}
                          variant="secondary"
                        >
                          Edit
                        </Button>
                      )}
                      {!item.data.isClosed && !item.data.rounds.some(r => r.results && r.results.length > 0) && (
                        <Button
                          onClick={() => deleteDrive(item.id)}
                          variant="danger"
                        >
                          Delete
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => navigate(`/company/${item.data.companyNameCached || item.data.company?._id || item.data.company}/register`)}
                        variant="primary"
                      >
                        View Registration
                      </Button>
                      {editingRegistration !== item.id && (
                        <Button
                          onClick={() => startEditingRegistration(item.data)}
                          variant="secondary"
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteRegistration(item.id)}
                        variant="danger"
                      >
                        Delete
                      </Button>
                      <span className="item-type-badge registration">Registration Open</span>
                    </>
                  )}
                </div>
              }
            >
              <div className="drive-summary">
                <div className="drive-info">
                  <p><strong>Company:</strong> {item.companyName}</p>
                  <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
                  <p><strong>Type:</strong>
                    <span className={`item-type ${item.type}`}>
                      {item.type === 'registration' ? 'Registration' : 'Drive'}
                    </span>
                  </p>
                  <p><strong>Status:</strong>
                    <span className={`status-${item.status === 'registration' ? 'open' : item.status}`}>
                      {item.type === 'registration'
                        ? 'Registration Open'
                        : item.status === 'ongoing' ? 'Active' : 'Completed'
                      }
                    </span>
                  </p>
                  {item.type === 'drive' && (
                    <>
                      <p><strong>Rounds:</strong> {item.data.rounds?.length || 0}</p>
                      <p><strong>Current Round:</strong> {item.data.currentRoundIndex + 1} of {item.data.rounds?.length || 0}</p>
                      {item.data.finalSelected && item.data.finalSelected.length > 0 && (
                        <p><strong>Placed Students:</strong> {item.data.finalSelected.length}</p>
                      )}
                    </>
                  )}
                  {item.type === 'registration' && (
                    <>
                      <p><strong>Batch:</strong> {item.data.batch}</p>
                      <p><strong>Eligibility:</strong> Min CGPA {item.data.eligibility?.minCgpa || 'N/A'}</p>
                    </>
                  )}
                </div>

                {editingDrive === item.id && item.type === 'drive' && (
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

                {editingRegistration === item.id && item.type === 'registration' && (
                  <div className="drive-edit-form">
                    <h3>Edit Registration</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Drive Date:</label>
                        <input
                          type="date"
                          value={editRegistrationForm.driveDate}
                          onChange={e => updateEditRegistrationForm('driveDate', e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Batch:</label>
                        <input
                          type="number"
                          value={editRegistrationForm.batch}
                          onChange={e => updateEditRegistrationForm('batch', e.target.value)}
                          className="form-input"
                          placeholder="e.g., 2025"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <h4>Eligibility Criteria:</h4>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Min CGPA:</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editRegistrationForm.eligibility.minCgpa}
                            onChange={e => updateEditRegistrationForm('eligibility.minCgpa', e.target.value)}
                            className="form-input"
                            placeholder="e.g., 7.0"
                          />
                        </div>

                        <div className="form-group">
                          <label>Max Arrears:</label>
                          <input
                            type="number"
                            value={editRegistrationForm.eligibility.maxArrears}
                            onChange={e => updateEditRegistrationForm('eligibility.maxArrears', e.target.value)}
                            className="form-input"
                            placeholder="e.g., 2"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Max History Arrears:</label>
                          <input
                            type="number"
                            value={editRegistrationForm.eligibility.maxHistoryArrears}
                            onChange={e => updateEditRegistrationForm('eligibility.maxHistoryArrears', e.target.value)}
                            className="form-input"
                            placeholder="e.g., 4"
                          />
                        </div>

                        <div className="form-group">
                          <label>Min 10th %:</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editRegistrationForm.eligibility.minTenthPercent}
                            onChange={e => updateEditRegistrationForm('eligibility.minTenthPercent', e.target.value)}
                            className="form-input"
                            placeholder="e.g., 60.0"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Min 12th %:</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editRegistrationForm.eligibility.minTwelfthPercent}
                            onChange={e => updateEditRegistrationForm('eligibility.minTwelfthPercent', e.target.value)}
                            className="form-input"
                            placeholder="e.g., 65.0"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Accepted Batches:</label>
                        {editRegistrationForm.eligibility.acceptedBatches?.map((batch, index) => (
                          <div key={index} className="batch-input-row">
                            <input
                              type="number"
                              value={batch}
                              onChange={e => updateAcceptedBatch(index, e.target.value)}
                              className="form-input"
                              placeholder="e.g., 2025"
                            />
                            <Button
                              onClick={() => removeAcceptedBatch(index)}
                              variant="danger"
                              size="small"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button onClick={addAcceptedBatch} variant="secondary" size="small">
                          Add Batch
                        </Button>
                      </div>
                    </div>

                    <div className="edit-actions">
                      <Button onClick={saveRegistration} variant="success">
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
