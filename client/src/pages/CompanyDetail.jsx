import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function CompanyDetail() {
  const { companyName } = useParams()
  const [company, setCompany] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    // naive fetch by name: list and filter
    fetch(`/api/companies?search=${encodeURIComponent(companyName)}`)
      .then(r=>r.json()).then(d=>setCompany((d.data||[]).find(c=>c.name===companyName)||null))
  }, [companyName])

  if (!company) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container grid">
      <Card title={`${company.name} — ${company.role || ''}`}>
        <p><b>Location:</b> {company.location||'-'}</p>
        <p><b>Salary:</b> {company.salaryLPA||'-'} LPA</p>
        <p><b>Last drive:</b> {company.lastDriveDate? new Date(company.lastDriveDate).toLocaleDateString(): '-'}</p>
        <div className="cta">
          {user.role === 'staff' && (
            <Link className="btn btn-primary" to={`/company/create-registration?companyId=${company._id}`}>Open Registration</Link>
          )}
          <Link className="btn btn-secondary" to={`/company/${encodeURIComponent(company.name)}/interview-experience`}>Interview Experiences</Link>
        </div>
      </Card>
      <Card title="Rounds Template">
        {(company.roundsTemplate||[]).map((r,i)=> (
          <p key={i}><b>Round {i+1}:</b> {r.name} — {r.description||''}</p>
        ))}
      </Card>
    </div>
  )
}



