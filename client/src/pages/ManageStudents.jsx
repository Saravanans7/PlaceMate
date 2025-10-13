import { useEffect, useState } from 'react'
import { Card, Table, FormInput, Button, Modal } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { FiUserPlus, FiEdit, FiTrash2, FiUpload, FiSearch, FiDownload } from 'react-icons/fi'

export default function ManageStudents() {
  const { user } = useAuth()
  const { toast } = useToast()

  // State for students list
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)

  // State for forms
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    batch: '',
    cgpa: '',
    arrears: '',
    historyOfArrears: '',
    tenthPercent: '',
    twelfthPercent: '',
    phone: '',
    nativePlace: '',
    password: ''
  })

  // State for bulk upload
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  // --------------------------
  // Load Students
  // --------------------------
  useEffect(() => {
    loadStudents()
  }, [pagination.page, searchQuery, selectedBatch])

  async function loadStudents() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        batch: selectedBatch
      })

      const response = await fetch(`/api/users/students?${params}`, { credentials: 'include' })
      const data = await response.json()

      if (response.ok) {
        setStudents(data.data || [])
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
      } else {
        toast.error('Load Failed', data.message || 'Failed to load students')
      }
    } catch (error) {
      toast.error('Load Failed', 'Network error while loading students')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------
  // Form Handling
  // --------------------------
  function resetForm() {
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      batch: '',
      cgpa: '',
      arrears: '',
      historyOfArrears: '',
      tenthPercent: '',
      twelfthPercent: '',
      phone: '',
      nativePlace: '',
      password: ''
    })
  }

  function openAddModal() {
    resetForm()
    setSelectedStudent(null)
    setShowAddModal(true)
  }

  function openEditModal(student) {
    setSelectedStudent(student)
    setFormData({
      name: student.name || '',
      email: student.email || '',
      rollNumber: student.rollNumber || '',
      batch: student.batch || '',
      cgpa: student.cgpa || '',
      arrears: student.arrears || '',
      historyOfArrears: student.historyOfArrears || '',
      tenthPercent: student.tenthPercent || '',
      twelfthPercent: student.twelfthPercent || '',
      phone: student.phone || '',
      nativePlace: student.nativePlace || '',
      password: '' // Don't prefill password
    })
    setShowEditModal(true)
  }

  function openDeleteModal(student) {
    setSelectedStudent(student)
    setShowDeleteModal(true)
  }

  // --------------------------
  // CRUD Operations
  // --------------------------
  async function saveStudent() {
    if (!formData.name || !formData.email) {
      toast.error('Validation Error', 'Name and email are required')
      return
    }

    try {
      const method = selectedStudent ? 'PUT' : 'POST'
      const url = selectedStudent ? `/api/users/students/${selectedStudent._id}` : '/api/users/students'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          selectedStudent ? 'Student Updated' : 'Student Added',
          `${formData.name} ${selectedStudent ? 'updated' : 'added'} successfully.`
        )
        setShowAddModal(false)
        setShowEditModal(false)
        loadStudents()
      } else {
        toast.error('Save Failed', data.message || 'Failed to save student')
      }
    } catch {
      toast.error('Save Failed', 'Network error while saving student')
    }
  }

  async function deleteStudent() {
    if (!selectedStudent) return

    try {
      const response = await fetch(`/api/users/students/${selectedStudent._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Student Deleted', `${selectedStudent.name} deleted successfully.`)
        setShowDeleteModal(false)
        setSelectedStudent(null)
        loadStudents()
      } else {
        toast.error('Delete Failed', data.message || 'Failed to delete student')
      }
    } catch {
      toast.error('Delete Failed', 'Network error while deleting student')
    }
  }

  // --------------------------
  // Bulk Upload
  // --------------------------
  async function handleBulkUpload() {
    if (!uploadFile) {
      toast.error('Validation Error', 'Please select an Excel file')
      return
    }

    const formData = new FormData()
    formData.append('file', uploadFile)

    try {
      setLoading(true)
      const response = await fetch('/api/users/students/bulk', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadResult(data)
        toast.success('Bulk Upload Completed', `Created: ${data.data.created}, Errors: ${data.data.errors}, Duplicates: ${data.data.duplicates}`)
        loadStudents()
      } else {
        toast.error('Upload Failed', data.message || 'Failed to upload students')
      }
    } catch {
      toast.error('Upload Failed', 'Network error during upload')
    } finally {
      setLoading(false)
    }
  }

  function downloadTemplate() {
    // Create a sample Excel template
    const headers = [
      'name', 'email', 'rollNumber', 'batch', 'cgpa', 'arrears',
      'historyOfArrears', 'tenthPercent', 'twelfthPercent', 'phone', 'nativePlace', 'password'
    ]

    const sampleData = [
      headers,
      ['John Doe', 'john.doe@example.com', '2021001', '2025', '8.5', '0', '0', '95', '90', '9876543210', 'City Name', 'password123']
    ]

    // Create CSV content
    const csvContent = sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'student_template.csv'
    link.click()
  }

  // --------------------------
  // Access Restriction
  // --------------------------
  if (user?.role !== 'staff') {
    return (
      <div className="container">
        <Card title="Access Denied">
          <p>Only staff members can access student management.</p>
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
        title="Student Management"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={downloadTemplate} variant="secondary">
              <FiDownload style={{ marginRight: '8px' }} />
              Template
            </Button>
            <Button onClick={() => setShowBulkUploadModal(true)} variant="secondary">
              <FiUpload style={{ marginRight: '8px' }} />
              Bulk Upload
            </Button>
            <Button onClick={openAddModal}>
              <FiUserPlus style={{ marginRight: '8px' }} />
              Add Student
            </Button>
          </div>
        }
      >
        {/* Search and Filters */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <FormInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or roll number..."
              style={{ width: '100%' }}
            />
          </div>
          <FormInput
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            placeholder="Filter by batch"
            style={{ width: '120px' }}
          />
          <Button onClick={loadStudents} variant="secondary">
            <FiSearch style={{ marginRight: '8px' }} />
            Search
          </Button>
        </div>

        {/* Students Table */}
        <div className="table-card">
          <Table
            columns={[
              { label: 'Name', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Roll Number', key: 'rollNumber' },
              { label: 'Batch', key: 'batch' },
              { label: 'CGPA', key: 'cgpa' },
              { label: 'Phone', key: 'phone' },
              {
                label: 'Actions',
                render: (student) => (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => openEditModal(student)}
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => openDeleteModal(student)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                )
              }
            ]}
            rows={students}
          />
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span style={{ alignSelf: 'center' }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={showAddModal || showEditModal}
        title={selectedStudent ? 'Edit Student' : 'Add New Student'}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          resetForm()
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormInput
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <FormInput
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <FormInput
            label="Roll Number"
            value={formData.rollNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
          />
          <FormInput
            label="Batch"
            type="number"
            value={formData.batch}
            onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
          />
          <FormInput
            label="CGPA"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.cgpa}
            onChange={(e) => setFormData(prev => ({ ...prev, cgpa: e.target.value }))}
          />
          <FormInput
            label="Current Arrears"
            type="number"
            min="0"
            value={formData.arrears}
            onChange={(e) => setFormData(prev => ({ ...prev, arrears: e.target.value }))}
          />
          <FormInput
            label="History of Arrears"
            type="number"
            min="0"
            value={formData.historyOfArrears}
            onChange={(e) => setFormData(prev => ({ ...prev, historyOfArrears: e.target.value }))}
          />
          <FormInput
            label="10th Percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.tenthPercent}
            onChange={(e) => setFormData(prev => ({ ...prev, tenthPercent: e.target.value }))}
          />
          <FormInput
            label="12th Percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.twelfthPercent}
            onChange={(e) => setFormData(prev => ({ ...prev, twelfthPercent: e.target.value }))}
          />
          <FormInput
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
          <FormInput
            label="Native Place"
            value={formData.nativePlace}
            onChange={(e) => setFormData(prev => ({ ...prev, nativePlace: e.target.value }))}
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <FormInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={selectedStudent ? 'Leave blank to keep current password' : 'Enter password'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddModal(false)
              setShowEditModal(false)
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button onClick={saveStudent}>
            {selectedStudent ? 'Update Student' : 'Add Student'}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        title="Delete Student"
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedStudent(null)
        }}
      >
        {selectedStudent && (
          <div>
            <p>Are you sure you want to delete this student? This action cannot be undone.</p>
            <div
              style={{
                margin: '16px 0',
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '4px',
                border: '1px solid #fecaca'
              }}
            >
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              {selectedStudent.rollNumber && (
                <p><strong>Roll Number:</strong> {selectedStudent.rollNumber}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedStudent(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={deleteStudent}>
                Delete Student
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        open={showBulkUploadModal}
        title="Bulk Upload Students"
        onClose={() => {
          setShowBulkUploadModal(false)
          setUploadFile(null)
          setUploadResult(null)
        }}
      >
        <div>
          <p>Upload an Excel file (.xlsx or .xls) with student data. The file should have the following columns:</p>
          <ul style={{ margin: '12px 0', paddingLeft: '20px' }}>
            <li><strong>name</strong> (required)</li>
            <li><strong>email</strong> (required)</li>
            <li><strong>rollNumber</strong></li>
            <li><strong>batch</strong></li>
            <li><strong>cgpa</strong></li>
            <li><strong>arrears</strong></li>
            <li><strong>historyOfArrears</strong></li>
            <li><strong>tenthPercent</strong></li>
            <li><strong>twelfthPercent</strong></li>
            <li><strong>phone</strong></li>
            <li><strong>nativePlace</strong></li>
            <li><strong>password</strong> (optional, defaults to 'password123')</li>
          </ul>

          <div style={{ margin: '20px 0' }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              style={{ marginBottom: '12px' }}
            />
            {uploadFile && (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Selected: {uploadFile.name}
              </p>
            )}
          </div>

          {uploadResult && (
            <div
              style={{
                margin: '20px 0',
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '4px',
                border: '1px solid #bfdbfe'
              }}
            >
              <h4>Upload Results:</h4>
              <p><strong>Created:</strong> {uploadResult.data.created}</p>
              <p><strong>Errors:</strong> {uploadResult.data.errors}</p>
              <p><strong>Duplicates:</strong> {uploadResult.data.duplicates}</p>

              {uploadResult.errors.length > 0 && (
                <div>
                  <h5>Errors:</h5>
                  <ul>
                    {uploadResult.errors.map((error, index) => (
                      <li key={index} style={{ fontSize: '12px', color: '#dc2626' }}>
                        Row {error.row}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {uploadResult.duplicates.length > 0 && (
                <div>
                  <h5>Duplicates:</h5>
                  <ul>
                    {uploadResult.duplicates.map((dup, index) => (
                      <li key={index} style={{ fontSize: '12px', color: '#d97706' }}>
                        Row {dup.row}: {dup.name} ({dup.email}) - {dup.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowBulkUploadModal(false)
                setUploadFile(null)
                setUploadResult(null)
              }}
            >
              Close
            </Button>
            <Button onClick={handleBulkUpload} disabled={!uploadFile || loading}>
              {loading ? 'Uploading...' : 'Upload Students'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
