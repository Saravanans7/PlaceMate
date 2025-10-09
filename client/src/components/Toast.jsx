import { useEffect, useState } from 'react'
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi'

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10)

    // Auto remove after duration
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove()
      }, toast.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300) // Match CSS transition duration
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FiCheckCircle className="toast-icon success" />
      case 'error':
        return <FiXCircle className="toast-icon error" />
      case 'warning':
        return <FiAlertTriangle className="toast-icon warning" />
      case 'info':
      default:
        return <FiInfo className="toast-icon info" />
    }
  }

  const getToastClass = () => {
    const baseClass = 'toast'
    const typeClass = `toast-${toast.type}`
    const visibilityClass = isVisible && !isLeaving ? 'toast-visible' : 'toast-hidden'
    return `${baseClass} ${typeClass} ${visibilityClass}`.trim()
  }

  return (
    <div className={getToastClass()}>
      <div className="toast-content">
        {getIcon()}
        <div className="toast-message">
          <div className="toast-title">{toast.title}</div>
          {toast.message && <div className="toast-description">{toast.message}</div>}
        </div>
        <button 
          className="toast-close"
          onClick={handleRemove}
          aria-label="Close notification"
        >
          <FiX />
        </button>
      </div>
    </div>
  )
}

export default Toast
