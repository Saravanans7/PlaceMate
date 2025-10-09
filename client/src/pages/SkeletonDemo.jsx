import { useState } from 'react'
import { SkeletonCard, SkeletonTable, SkeletonDashboard, SkeletonCompanyList, SkeletonProfile, SkeletonForm } from '../components/SkeletonComponents.jsx'
import { Card } from '../components/UI.jsx'

export default function SkeletonDemo() {
  const [showSkeletons, setShowSkeletons] = useState(true)

  return (
    <div className="container">
      <Card title="Skeleton Animation Demo" actions={
        <button 
          className="btn btn-primary" 
          onClick={() => setShowSkeletons(!showSkeletons)}
        >
          {showSkeletons ? 'Hide' : 'Show'} Skeletons
        </button>
      }>
        <p>This page demonstrates all the skeleton loading animations. Each skeleton will show for a random duration between 1.5-3 seconds.</p>
        
        {showSkeletons && (
          <div style={{ marginTop: '20px' }}>
            <h3>Skeleton Cards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

            <h3>Skeleton Table</h3>
            <div style={{ marginBottom: '30px' }}>
              <SkeletonTable rows={5} columns={4} />
            </div>

            <h3>Skeleton Dashboard</h3>
            <div style={{ marginBottom: '30px' }}>
              <SkeletonDashboard />
            </div>

            <h3>Skeleton Company List</h3>
            <div style={{ marginBottom: '30px' }}>
              <SkeletonCompanyList />
            </div>

            <h3>Skeleton Profile</h3>
            <div style={{ marginBottom: '30px' }}>
              <SkeletonProfile />
            </div>

            <h3>Skeleton Form</h3>
            <div style={{ marginBottom: '30px' }}>
              <SkeletonForm fields={5} />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
