import React, { useEffect } from 'react'
import Button from '../ui/Button'

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])
  
  const typeClasses = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
  }
  
  return (
    <div
      className={`${typeClasses[type]} border-l-4 p-4 rounded-md shadow-lg mb-2 flex items-center justify-between min-w-[300px] max-w-[500px]`}
      role="alert"
      aria-live="assertive"
    >
      <p className="flex-1">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-current opacity-70 hover:opacity-100 focus:outline-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  )
}

