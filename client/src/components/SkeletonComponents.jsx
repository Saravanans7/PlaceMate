import { useState, useEffect } from 'react'
import '../styles/skeleton.css'

// Skeleton for cards
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
        <div className="skeleton-line skeleton-text medium"></div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  )
}

// Skeleton for table rows
export function SkeletonTableRow({ columns = 3 }) {
  return (
    <div className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="skeleton-table-cell">
          <div className="skeleton-line skeleton-text"></div>
        </div>
      ))}
    </div>
  )
}

// Skeleton for table
export function SkeletonTable({ rows = 5, columns = 3 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="skeleton-table-header-cell">
            <div className="skeleton-line skeleton-text"></div>
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <SkeletonTableRow key={rowIndex} columns={columns} />
      ))}
    </div>
  )
}

// Skeleton for dashboard grid
export function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-grid">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

// Skeleton for company list
export function SkeletonCompanyList() {
  return (
    <div className="skeleton-company-list">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="skeleton-company-item">
          <div className="skeleton-company-logo"></div>
          <div className="skeleton-company-info">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-text"></div>
            <div className="skeleton-line skeleton-text short"></div>
          </div>
          <div className="skeleton-company-actions">
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton for profile
export function SkeletonProfile() {
  return (
    <div className="skeleton-profile">
      <div className="skeleton-profile-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-profile-info">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
        </div>
      </div>
      <div className="skeleton-profile-content">
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-text medium"></div>
        </div>
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-text short"></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for navbar
export function SkeletonNavbar() {
  return (
    <div className="skeleton-navbar">
      <div className="skeleton-navbar-brand">
        <div className="skeleton-line skeleton-title"></div>
      </div>
      <div className="skeleton-navbar-items">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton-navbar-item">
            <div className="skeleton-line skeleton-text"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for form
export function SkeletonForm({ fields = 4 }) {
  return (
    <div className="skeleton-form">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="skeleton-form-field">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-input"></div>
        </div>
      ))}
      <div className="skeleton-form-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  )
}

// Generic skeleton wrapper with random timing
export function SkeletonWrapper({ children, minDuration = 1500, maxDuration = 3000 }) {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const duration = Math.random() * (maxDuration - minDuration) + minDuration
    const timer = setTimeout(() => setShow(true), duration)
    return () => clearTimeout(timer)
  }, [minDuration, maxDuration])

  if (!show) {
    return <div className="skeleton-wrapper">{children}</div>
  }
  
  return null
}
