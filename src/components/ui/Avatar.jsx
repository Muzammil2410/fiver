import React from 'react'

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
  ...props
}) {
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }
  
  const statusClasses = {
    online: 'bg-success-500',
    offline: 'bg-neutral-400',
    away: 'bg-warning-500',
    busy: 'bg-danger-500',
  }
  
  const statusSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }
  
  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-primary-600 text-white flex items-center justify-center font-medium`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${statusClasses[status]} rounded-full border-2 border-white`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

