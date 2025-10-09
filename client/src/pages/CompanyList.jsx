import { useEffect, useState } from 'react'
import { Card, Table, FormInput, Button } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function CompanyList() {
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch(`/api/companies?search=${encodeURIComponent(search)}`, { credentials: 'include' })
      const d = await r.json()
      setRows((d.data||[]).map(c => ({ 
        id: c._id, 
        name: c.name, 
        salary: c.salaryLPA||'-', 
        location: c.location||'-', 
        role: c.role||'-', 
        lastYearPlaced: c.lastYearPlaced||0, 
        lastDriveDate: c.lastDriveDate? new Date(c.lastDriveDate).toLocaleDateString(): '-' 
      })))
    } catch (error) {
      console.error('Failed to load companies:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteCompany(companyId, companyName) {
    if (!confirm(`Are you sure you want to delete ${companyName}? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        alert('Company deleted successfully')
        load() // Refresh the list
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to delete company')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete company')
    }
  }

  const isAdmin = user?.role === 'staff'

  return (
    <div className="container">
      <Card 
        title="Companies" 
        actions={
          <div className="card-actions">
            {isAdmin && (
              <a className="btn btn-primary" href="/company/create">
                + Create Company
              </a>
            )}
            <Button onClick={load} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        }
      >
        <FormInput 
          label="Search" 
          value={search} 
          onChange={(e)=>setSearch(e.target.value)} 
          placeholder="Search by name" 
        />
        <Table columns={[
          {label:'ID', render:r=>r.id},
          {label:'Company Name', render:r=>r.name},
          {label:'Salary (LPA)', render:r=>r.salary},
          {label:'Location', render:r=>r.location},
          {label:'Job Role', render:r=>r.role},
          {label:'Last Year Placed', render:r=>r.lastYearPlaced},
          {label:'Last Drive', render:r=>r.lastDriveDate},
          {label:'Actions', render:r=> (
            <div className="action-buttons">
              <a className="btn btn-secondary btn-sm" href={`/company/${encodeURIComponent(r.name)}`}>View</a>
              {isAdmin && (
                <>
                  <a className="btn btn-primary btn-sm" href={`/company/edit/${r.id}`}>Edit</a>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteCompany(r.id, r.name)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        ]} rows={rows} />
      </Card>
    </div>
  )
}



