import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    }
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  // Convenience methods
  const toast = {
    success: (title, message, options = {}) => 
      addToast({ type: 'success', title, message, ...options }),
    error: (title, message, options = {}) => 
      addToast({ type: 'error', title, message, ...options }),
    warning: (title, message, options = {}) => 
      addToast({ type: 'warning', title, message, ...options }),
    info: (title, message, options = {}) => 
      addToast({ type: 'info', title, message, ...options }),
    custom: (toastData) => addToast(toastData)
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts, toast }}>
      {children}
    </ToastContext.Provider>
  )
}
