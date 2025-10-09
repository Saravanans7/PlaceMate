import { useState } from 'react'

export default function BarChart({ data, title }) {
  const [hoveredBar, setHoveredBar] = useState(null)
  
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className="bar-chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="bar-chart">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100
          const isHovered = hoveredBar === index
          
          return (
            <div 
              key={item.label}
              className="bar-wrapper"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="bar-container">
                <div 
                  className={`bar ${isHovered ? 'hovered' : ''}`}
                  style={{ height: `${height}%` }}
                >
                  <div className="bar-value">{item.value}</div>
                </div>
              </div>
              <div className="bar-label">{item.label}</div>
              {isHovered && (
                <div className="tooltip">
                  <div className="tooltip-content">
                    <strong>{item.label}</strong>
                    <div>Placed: {item.value}</div>
                    <div>Total Members: {item.total}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
