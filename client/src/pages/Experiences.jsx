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
      let url
      if (companyName) {
        // If we have a company name from URL params, search for that specific company
        url = `/api/experiences?companyName=${encodeURIComponent(companyName)}`
      } else if (searchCompany.trim()) {
        // If we have a search query, search for that company
        url = `/api/experiences?companyName=${encodeURIComponent(searchCompany.trim())}`
      } else {
        // If no search query, show all approved experiences
        url = `/api/experiences?status=approved`
      }
      
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading experiences...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {searchCompany ? (
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No experiences found</h3>
                <p>No approved interview experiences found for <strong>"{searchCompany}"</strong>.</p>
                <p style={{ fontSize: '14px', marginTop: '12px' }}>
                  Try searching for a different company name or check if the company has any approved experiences.
                </p>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No experiences available</h3>
                <p>There are no approved interview experiences available yet.</p>
                <p style={{ fontSize: '14px', marginTop: '12px' }}>
                  Check back later or search for a specific company to see if they have any experiences.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '16px', opacity: 0.7 }}>
              {items.length} approved experience{items.length !== 1 ? 's' : ''} found
            </p>
            {items.map(e => (
              <div key={e._id} className="card" style={{padding: 20, marginBottom: 16, border: '1px solid var(--border)', borderRadius: '8px'}}>
                {/* Company Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', color: 'var(--violet-600)', fontSize: '1.2rem' }}>
                      {e.companyNameCached || e.company?.name || 'Unknown Company'}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                      <span>by {e.student?.name || e.student?.email || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(e.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ 
                    backgroundColor: '#f0f9ff', 
                    color: 'var(--violet-600)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    APPROVED
                  </div>
                </div>

                {/* Experience Content */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)', fontSize: '1rem' }}>
                    {e.title || 'Interview Experience'}
                  </h4>
                  <div style={{ 
                    backgroundColor: '#f8fafc', 
                    padding: '12px', 
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ 
                      whiteSpace: 'pre-wrap', 
                      margin: 0, 
                      lineHeight: '1.6',
                      color: 'var(--text)'
                    }}>
                      {e.content}
                    </p>
                  </div>
                </div>

                {/* Questions Section */}
                {Array.isArray(e.questions) && e.questions.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#fef3c7', 
                    padding: '12px', 
                    borderRadius: '6px',
                    border: '1px solid #fde68a'
                  }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px' }}>
                      Questions Asked:
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {e.questions.map((q, i) => (
                        <li key={i} style={{ marginBottom: '4px', color: '#92400e', fontSize: '14px' }}>
                          {q}
                        </li>
                      ))}
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



