import { useEffect, useState } from 'react'
import { Card, Table, FormInput, Button, Modal } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { FiUserMinus, FiUserPlus, FiSearch, FiX } from 'react-icons/fi'

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
      toast.error('Load Failed', 'Failed to load blacklisted students due to a network error')
    }
    setLoading(false)
  }

  async function searchStudents() {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/blacklist/search?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok) {
        setSearchResults(data.data || [])
      } else {
        toast.error('Search Failed', data.message || 'Failed to search students')
      }
    } catch (error) {
      toast.error('Search Failed', 'Failed to search students due to a network error')
    }
  }

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
        toast.success('Student Blacklisted', `${selectedStudent.name} has been added to the blacklist.`)
        setShowAddModal(false)
        setSelectedStudent(null)
        setReason('')
        setSearchQuery('')
        setSearchResults([])
        loadBlacklistedStudents()
      } else {
        toast.error('Blacklist Failed', data.message || 'Failed to add student to blacklist')
      }
    } catch (error) {
      toast.error('Blacklist Failed', 'Failed to add student to blacklist due to a network error')
    }
  }

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
        toast.success('Student Removed', `${selectedBlacklistEntry.student.name} has been removed from the blacklist.`)
        setShowRemoveModal(false)
        setSelectedBlacklistEntry(null)
        setRemoveReason('')
        loadBlacklistedStudents()
      } else {
        toast.error('Remove Failed', data.message || 'Failed to remove student from blacklist')
      }
    } catch (error) {
      toast.error('Remove Failed', 'Failed to remove student from blacklist due to a network error')
    }
  }

  function openAddModal(student) {
    setSelectedStudent(student)
    setShowAddModal(true)
  }

  function openRemoveModal(entry) {
    setSelectedBlacklistEntry(entry)
    setShowRemoveModal(true)
  }

  if (user?.role !== 'staff') {
    return (
      <div className="container">
        <Card title="Access Denied">
          <p>Only staff members can access the blacklist management.</p>
        </Card>
      </div>
    )
  }

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
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Search Students</h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FormInput
              label=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or roll number..."
              style={{ flex: 1 }}
            />
            <Button onClick={searchStudents} disabled={loading}>
              <FiSearch style={{ marginRight: '8px' }} />
              Search
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h5>Search Results:</h5>
              {searchResults.map(student => (
                <div 
                  key={student._id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: student.isBlacklisted ? '#fee2e2' : '#f0f9ff',
                    border: `1px solid ${student.isBlacklisted ? '#fecaca' : '#bfdbfe'}`,
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  <div>
                    <strong>{student.name}</strong>
                    <br />
                    <small style={{ color: '#6b7280' }}>
                      {student.email} {student.rollNumber && `• ${student.rollNumber}`}
                    </small>
                  </div>
                  {student.isBlacklisted ? (
                    <span style={{ color: '#dc2626', fontWeight: '600' }}>Already Blacklisted</span>
                  ) : (
                    <Button 
                      variant="secondary" 
                      onClick={() => openAddModal(student)}
                    >
                      <FiUserMinus style={{ marginRight: '4px' }} />
                      Blacklist
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blacklisted Students List */}
        <div>
          <h4 style={{ margin: '0 0 16px 0' }}>Currently Blacklisted Students</h4>
          {loading ? (
            <p>Loading blacklisted students...</p>
          ) : blacklistedStudents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
              No students are currently blacklisted.
            </p>
          ) : (
            <div className="table-card">
              <Table columns={[
                { label: 'Student Name', key: 'studentName' },
                { label: 'Email', key: 'email' },
                { label: 'Roll Number', key: 'rollNumber' },
                { label: 'Reason', key: 'reason' },
                { label: 'Added By', key: 'addedBy' },
                { label: 'Added Date', key: 'addedDate' },
                { label: 'Actions', render: r => (
                  <Button 
                    variant="secondary" 
                    onClick={() => openRemoveModal(r)}
                  >
                    <FiUserPlus style={{ marginRight: '4px' }} />
                    Remove
                  </Button>
                )}
              ]}
              rows={blacklistedStudents.map(entry => ({
                _id: entry._id,
                studentName: entry.student?.name || 'Unknown',
                email: entry.student?.email || 'Unknown',
                rollNumber: entry.student?.rollNumber || '-',
                reason: entry.reason,
                addedBy: entry.addedBy?.name || 'Unknown',
                addedDate: new Date(entry.addedAt).toLocaleDateString(),
                ...entry
              }))} />
            </div>
          )}
        </div>
      </Card>

      {/* Add to Blacklist Modal */}
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
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
              <p><strong>Student:</strong> {selectedStudent.name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              {selectedStudent.rollNumber && <p><strong>Roll Number:</strong> {selectedStudent.rollNumber}</p>}
            </div>
            
            <FormInput
              label="Reason for Blacklisting"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for blacklisting this student..."
              required
            />
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => {
                setShowAddModal(false)
                setSelectedStudent(null)
                setReason('')
              }}>
                Cancel
              </Button>
              <Button onClick={addToBlacklist}>
                Add to Blacklist
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Remove from Blacklist Modal */}
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
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
              <p><strong>Student:</strong> {selectedBlacklistEntry.student?.name}</p>
              <p><strong>Original Reason:</strong> {selectedBlacklistEntry.reason}</p>
              <p><strong>Blacklisted On:</strong> {new Date(selectedBlacklistEntry.addedAt).toLocaleDateString()}</p>
            </div>
            
            <FormInput
              label="Reason for Removal"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Enter the reason for removing this student from blacklist..."
              required
            />
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => {
                setShowRemoveModal(false)
                setSelectedBlacklistEntry(null)
                setRemoveReason('')
              }}>
                Cancel
              </Button>
              <Button onClick={removeFromBlacklist}>
                Remove from Blacklist
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
