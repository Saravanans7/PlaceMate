import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components/UI.jsx'

export default function Experiences() {
  const { companyName } = useParams()
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('/api/experiences?status=approved').then(r=>r.json()).then(d=>{
      setItems((d.data||[]).filter(x=> x.companyNameCached===companyName))
    })
  }, [companyName])

  return (
    <div className="container">
      <Card title={`Interview Experiences — ${companyName}`}>
        {items.length===0 && <p>No experiences yet.</p>}
        {items.map(e=> (
          <div key={e._id} className="card" style={{padding:12, marginBottom:8}}>
            <b>{e.title||'Untitled'}</b>
            <p>{e.content}</p>
            {Array.isArray(e.questions) && e.questions.length>0 && (
              <ul>
                {e.questions.map((q,i)=> <li key={i}>{q}</li>)}
              </ul>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}



