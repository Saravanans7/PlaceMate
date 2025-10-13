import { useEffect, useState } from 'react'
import { Card, Table, FormInput, Button, Modal } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { FiUserPlus } from 'react-icons/fi'

export default function Blacklist() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [blacklistedStudents, setBlacklistedStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [selectedBlacklistEntry, setSelectedBlacklistEntry] = useState(null)
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
      const response = await fetch('/api/blacklist?active=true', { credentials: 'include' })
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
          `${selectedBlacklistEntry?.studentName || 'Student'} removed from blacklist.`
        )
        setShowRemoveModal(false)
        setSelectedBlacklistEntry(null)
        setRemoveReason('')
        // Small delay to ensure database update is complete
        setTimeout(() => loadBlacklistedStudents(), 500)
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
      <Card title="Student Blacklist Management">

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
              <p><strong>Student:</strong> {selectedBlacklistEntry.studentName}</p>
              <p><strong>Original Reason:</strong> {selectedBlacklistEntry.reason}</p>
              <p><strong>Blacklisted On:</strong> {new Date(selectedBlacklistEntry.addedDate).toLocaleDateString()}</p>
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
