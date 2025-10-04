import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components/UI.jsx'

export default function Experiences() {
  const { companyName } = useParams()
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch(`/api/experiences?companyName=${encodeURIComponent(companyName)}`).then(r=>r.json()).then(d=>{
      setItems(d.data||[])
    })
  }, [companyName])

  return (
    <div className="container">
      <Card title={`Interview Experiences — ${companyName}`}>
        {items.length===0 && <p>No experiences yet.</p>}
        {items.map(e=> (
          <div key={e._id} className="card" style={{padding:12, marginBottom:8}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <b>{e.title||'Interview Experience'}</b>
              <small style={{ opacity: 0.7 }}>
                by {e.student?.name || e.student?.email || 'Anonymous'} • {new Date(e.createdAt).toLocaleDateString()}
              </small>
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{e.content}</p>
            {Array.isArray(e.questions) && e.questions.length>0 && (
              <div>
                <b>Questions asked:</b>
                <ul>
                  {e.questions.map((q,i)=> <li key={i}>{q}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}



