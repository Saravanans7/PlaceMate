import { useEffect, useState } from 'react'
import { Card, Table, FormInput, Button } from '../components/UI.jsx'

export default function CompanyList() {
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch(`/api/companies?search=${encodeURIComponent(search)}`)
    const d = await r.json()
    setRows((d.data||[]).map(c => ({ id: c._id, name: c.name, salary: c.salaryLPA||'-', location: c.location||'-', role: c.role||'-', lastYearPlaced: c.lastYearPlaced||0, lastDriveDate: c.lastDriveDate? new Date(c.lastDriveDate).toLocaleDateString(): '-' })))
  }

  return (
    <div className="container">
      <Card title="Companies" actions={<Button onClick={load}>Search</Button>}>
        <FormInput label="Search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by name" />
        <Table columns={[
          {label:'ID', render:r=>r.id},
          {label:'Company Name', render:r=>r.name},
          {label:'Salary (LPA)', render:r=>r.salary},
          {label:'Location', render:r=>r.location},
          {label:'Job Role', render:r=>r.role},
          {label:'Last Year Placed', render:r=>r.lastYearPlaced},
          {label:'Last Drive', render:r=>r.lastDriveDate},
          {label:'View', render:r=> <a className="btn btn-secondary" href={`/company/${encodeURIComponent(r.name)}`}>View</a> }
        ]} rows={rows} />
      </Card>
    </div>
  )
}



