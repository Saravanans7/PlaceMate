import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, Button } from '../components/UI.jsx'

export default function Experiences() {
  const { companyName } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCompany, setSearchCompany] = useState(searchParams.get('company') || '')

  useEffect(() => {
    loadExperiences()
  }, [companyName, searchCompany])

  async function loadExperiences() {
    setLoading(true)
    try {
      const url = companyName 
        ? `/api/experiences?companyName=${encodeURIComponent(companyName)}`
        : `/api/experiences?status=approved`
      
      const response = await fetch(url, { credentials: 'include' })
      const data = await response.json()
      setItems(data.data || [])
    } catch (error) {
      console.error('Failed to load experiences:', error)
      setItems([])
    }
    setLoading(false)
  }

  function handleSearch() {
    setSearchParams({ company: searchCompany })
    loadExperiences()
  }

  function clearSearch() {
    setSearchCompany('')
    setSearchParams({})
    loadExperiences()
  }

  const pageTitle = companyName 
    ? `Interview Experiences — ${companyName}`
    : 'Interview Experiences'

  return (
    <div className="container">
      <Card title={pageTitle}>
        {!companyName && (
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Search by Company</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                placeholder="Enter company name..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                Search
              </Button>
              {searchCompany && (
                <Button variant="secondary" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>
            {searchCompany && (
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
                Showing experiences for: <strong>{searchCompany}</strong>
              </p>
            )}
          </div>
        )}

        {loading ? (
          <p>Loading experiences...</p>
        ) : items.length === 0 ? (
          <p>
            {searchCompany 
              ? `No approved interview experiences found for "${searchCompany}".`
              : 'No approved interview experiences available yet.'
            }
          </p>
        ) : (
          <div>
            <p style={{ marginBottom: '16px', opacity: 0.7 }}>
              {items.length} approved experience{items.length !== 1 ? 's' : ''} found
            </p>
            {items.map(e => (
              <div key={e._id} className="card" style={{padding: 16, marginBottom: 12}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <b>{e.title || 'Interview Experience'}</b>
                  <small style={{ opacity: 0.7 }}>
                    by {e.student?.name || e.student?.email || 'Anonymous'} • {new Date(e.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{e.content}</p>
                {Array.isArray(e.questions) && e.questions.length > 0 && (
                  <div>
                    <b>Questions asked:</b>
                    <ul>
                      {e.questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}



