import { useEffect, useState } from 'react'
import { Card, Table, FormInput, Button } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import LoadingWrapper from '../components/LoadingWrapper.jsx'
import { SkeletonTable, SkeletonCard } from '../components/SkeletonComponents.jsx'

export default function CompanyList() {
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

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
      setRows([]) // Set empty array on error
      toast.error('Load Failed', 'Failed to load companies due to a network error')
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
        toast.success('Company Deleted', `${companyName} has been successfully deleted.`)
        load() // Refresh the list
      } else {
        const data = await response.json()
        toast.error('Delete Failed', data.message || 'Failed to delete company')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Delete Failed', 'Failed to delete company due to a network error')
    }
  }

  const isAdmin = user?.role === 'staff'

  const skeletonComponent = (
    <div className="container">
      <SkeletonCard />
    </div>
  )

  return (
    <LoadingWrapper 
      isLoading={loading} 
      skeletonComponent={skeletonComponent}
      loadingMessage="Loading companies..."
    >
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
        <Button onClick={load} disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Loading...' : 'Search'}
        </Button>
        <Table columns={[
          {label:'#', render:(r, i)=>i+1},
          {label:'Company Name', render:r=>r.name},
          {label:'Salary (LPA)', render:r=>r.salary},
          {label:'Location', render:r=>r.location},
          {label:'Job Role', render:r=>r.role},
          {label:'Last Year Placed', render:r=>r.lastYearPlaced},
          {label:'Last Drive', render:r=>r.lastDriveDate},
          {label:'Actions', render:r=> (
            <div className="action-buttons">
              <a
                className="btn btn-secondary btn-sm icon-btn"
                href={`/company/${encodeURIComponent(r.name)}`}
                aria-label="View"
                title="View"
              >
                {/* Eye icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </a>
              {isAdmin && (
                <>
                  <a
                    className="btn btn-primary btn-sm icon-btn"
                    href={`/company/edit/${r.id}`}
                    aria-label="Edit"
                    title="Edit"
                  >
                    {/* Pencil icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </a>
                  <button
                    className="btn btn-danger btn-sm icon-btn"
                    onClick={() => deleteCompany(r.id, r.name)}
                    disabled={loading}
                    aria-label="Delete"
                    title="Delete"
                  >
                    {/* Trash icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        ]} rows={rows} />
        </Card>
      </div>
    </LoadingWrapper>
  )
}



