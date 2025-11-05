import React from 'react'

export default function Tag({
  children,
  onRemove,
  className = '',
  ...props
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-md text-sm font-medium ${className}`}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-primary-900 focus:outline-none"
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  )
}

