import React from 'react'

export default function Card({
  children,
  header,
  footer,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden'
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
  
  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-neutral-200">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          {footer}
        </div>
      )}
    </div>
  )
}

