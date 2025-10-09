import { useEffect, useState } from 'react'
import { Card, Table, FormInput, Button, Modal } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { FiUserMinus, FiUserPlus, FiSearch } from 'react-icons/fi'

export default function Blacklist() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [blacklistedStudents, setBlacklistedStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedBlacklistEntry, setSelectedBlacklistEntry] = useState(null)
  const [reason, setReason] = useState('')
  const [removeReason, setRemoveReason] = useState('')

  // --------------------------
  // Load Blacklisted Students
  // --------------------------
  useEffect(() => {
    loadBlacklistedStudents()
  }, [])

  async function loadBlacklistedStudents() {
    setLoading(true)
    try {
      const response = await fetch('/api/blacklist', { credentials: 'include' })
      const data = await response.json()
      if (response.ok) {
        setBlacklistedStudents(data.data || [])
      } else {
        toast.error('Load Failed', data.message || 'Failed to load blacklisted students')
      }
    } catch (error) {
      toast.error('Load Failed', 'Network error while loading blacklisted students')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------
  // Search Students
  // --------------------------
  async function searchStudents() {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/blacklist/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok) {
        setSearchResults(data.data || [])
        if (data.data.length === 0) {
          toast.info('No Results', 'No students found matching your search criteria')
        }
      } else {
        toast.error('Search Failed', data.message || 'Failed to search students')
        setSearchResults([])
      }
    } catch {
      toast.error('Search Failed', 'Network error while searching students')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // --------------------------
  // Add to Blacklist
  // --------------------------
  async function addToBlacklist() {
    if (!selectedStudent || !reason.trim()) {
      toast.error('Validation Error', 'Please select a student and provide a reason')
      return
    }

    try {
      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: selectedStudent._id,
          reason: reason.trim()
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Student Blacklisted', `${selectedStudent.name} added successfully.`)
        setShowAddModal(false)
        setSelectedStudent(null)
        setReason('')
        setSearchQuery('')
        setSearchResults([])
        loadBlacklistedStudents()
      } else {
        toast.error('Blacklist Failed', data.message || 'Failed to add student')
      }
    } catch {
      toast.error('Blacklist Failed', 'Network error while adding to blacklist')
    }
  }

  // --------------------------
  // Remove from Blacklist
  // --------------------------
  async function removeFromBlacklist() {
    if (!selectedBlacklistEntry || !removeReason.trim()) {
      toast.error('Validation Error', 'Please provide a reason for removal')
      return
    }

    try {
      const response = await fetch('/api/blacklist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          blacklistId: selectedBlacklistEntry._id,
          reason: removeReason.trim()
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(
          'Student Removed',
          `${selectedBlacklistEntry.student.name} removed from blacklist.`
        )
        setShowRemoveModal(false)
        setSelectedBlacklistEntry(null)
        setRemoveReason('')
        loadBlacklistedStudents()
      } else {
        toast.error('Remove Failed', data.message || 'Failed to remove student')
      }
    } catch {
      toast.error('Remove Failed', 'Network error while removing student')
    }
  }

  // --------------------------
  // Modals
  // --------------------------
  function openAddModal(student) {
    setSelectedStudent(student)
    setShowAddModal(true)
  }

  function openRemoveModal(entry) {
    setSelectedBlacklistEntry(entry)
    setShowRemoveModal(true)
  }

  // --------------------------
  // Access Restriction
  // --------------------------
  if (user?.role !== 'staff') {
    return (
      <div className="container">
        <Card title="Access Denied">
          <p>Only staff members can access the blacklist management.</p>
        </Card>
      </div>
    )
  }

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="container">
      <Card
        title="Student Blacklist Management"
        actions={
          <Button onClick={() => setShowAddModal(true)}>
            <FiUserMinus style={{ marginRight: '8px' }} />
            Add Student
          </Button>
        }
      >
        {/* Search Section */}
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}
        >
          <h4>Search Students</h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FormInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or roll number..."
              style={{ flex: 1 }}
              onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
            />
            <Button onClick={searchStudents} disabled={loading || searchQuery.length < 2}>
              <FiSearch style={{ marginRight: '8px' }} />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h5>Search Results ({searchResults.length}):</h5>
              {searchResults.map((student) => (
                <div
                  key={student._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: student.isBlacklisted ? '#fee2e2' : '#f0f9ff',
                    border: `1px solid ${student.isBlacklisted ? '#fecaca' : '#bfdbfe'}`,
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}
                >
                  <div>
                    <strong>{student.name}</strong>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      <div>📧 {student.email}</div>
                      {student.rollNumber && <div>🎓 Roll: {student.rollNumber}</div>}
                    </div>
                  </div>

                  {student.isBlacklisted ? (
                    <span style={{ color: '#dc2626', fontSize: '12px' }}>Already Blacklisted</span>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => openAddModal(student)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      <FiUserMinus style={{ marginRight: '4px' }} />
                      Blacklist
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
            <div
              style={{
                marginTop: '12px',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}
            >
              <p style={{ color: '#6b7280' }}>
                No students found matching "<strong>{searchQuery}</strong>"
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                Try searching by name, email, or roll number
              </p>
            </div>
          )}
        </div>

        {/* Blacklisted Students Table */}
        <div>
          <h4>Currently Blacklisted Students</h4>
          {loading ? (
            <p>Loading blacklisted students...</p>
          ) : blacklistedStudents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
              No students are currently blacklisted.
            </p>
          ) : (
            <div className="table-card">
              <Table
                columns={[
                  { label: 'Student Name', key: 'studentName' },
                  { label: 'Email', key: 'email' },
                  { label: 'Roll Number', key: 'rollNumber' },
                  { label: 'Reason', key: 'reason' },
                  { label: 'Added By', key: 'addedBy' },
                  { label: 'Added Date', key: 'addedDate' },
                  {
                    label: 'Actions',
                    render: (r) => (
                      <Button variant="secondary" onClick={() => openRemoveModal(r)}>
                        <FiUserPlus style={{ marginRight: '4px' }} />
                        Remove
                      </Button>
                    )
                  }
                ]}
                rows={blacklistedStudents.map((entry) => ({
                  _id: entry._id,
                  studentName: entry.student?.name || 'Unknown',
                  email: entry.student?.email || 'Unknown',
                  rollNumber: entry.student?.rollNumber || '-',
                  reason: entry.reason,
                  addedBy: entry.addedBy?.name || 'Unknown',
                  addedDate: new Date(entry.addedAt).toLocaleDateString()
                }))}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        title="Add Student to Blacklist"
        onClose={() => {
          setShowAddModal(false)
          setSelectedStudent(null)
          setReason('')
        }}
      >
        {selectedStudent && (
          <div>
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px'
              }}
            >
              <p><strong>Student:</strong> {selectedStudent.name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              {selectedStudent.rollNumber && (
                <p><strong>Roll Number:</strong> {selectedStudent.rollNumber}</p>
              )}
            </div>

            <FormInput
              label="Reason for Blacklisting"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason..."
              required
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={addToBlacklist}>Add to Blacklist</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Remove Modal */}
      <Modal
        open={showRemoveModal}
        title="Remove Student from Blacklist"
        onClose={() => {
          setShowRemoveModal(false)
          setSelectedBlacklistEntry(null)
          setRemoveReason('')
        }}
      >
        {selectedBlacklistEntry && (
          <div>
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '4px'
              }}
            >
              <p><strong>Student:</strong> {selectedBlacklistEntry.student?.name}</p>
              <p><strong>Original Reason:</strong> {selectedBlacklistEntry.reason}</p>
              <p><strong>Blacklisted On:</strong> {new Date(selectedBlacklistEntry.addedAt).toLocaleDateString()}</p>
            </div>

            <FormInput
              label="Reason for Removal"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Enter the reason..."
              required
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
                Cancel
              </Button>
              <Button onClick={removeFromBlacklist}>Remove from Blacklist</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
