import React from 'react'

export default function Card({
  children,
  header,
  footer,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden'
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-xl hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-0.5' : ''
  
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

