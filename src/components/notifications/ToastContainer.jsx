import React from 'react'
import Toast from './Toast'

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      className="fixed top-20 right-4 z-50 space-y-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
          duration={toast.persistent ? 0 : 5000}
        />
      ))}
    </div>
  )
}

