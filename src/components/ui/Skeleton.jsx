import React from 'react'

export default function Skeleton({
  width,
  height,
  className = '',
  variant = 'text',
  ...props
}) {
  const baseClasses = 'animate-pulse bg-neutral-200 rounded'
  
  if (variant === 'circular') {
    return (
      <div
        className={`${baseClasses} ${width || 'w-10'} ${height || 'h-10'} rounded-full ${className}`}
        {...props}
      />
    )
  }
  
  if (variant === 'rectangular') {
    return (
      <div
        className={`${baseClasses} ${width || 'w-full'} ${height || 'h-24'} ${className}`}
        {...props}
      />
    )
  }
  
  // text variant
  return (
    <div
      className={`${baseClasses} ${width || 'w-full'} ${height || 'h-4'} ${className}`}
      {...props}
    />
  )
}

