import React, { useState } from 'react'

export default function Textarea({
  label,
  error,
  className = '',
  maxLength,
  ...props
}) {
  const [charCount, setCharCount] = useState((props.value || '').length)
  
  const handleChange = (e) => {
    if (maxLength) {
      setCharCount(e.target.value.length)
    }
    if (props.onChange) {
      props.onChange(e)
    }
  }
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        onChange={handleChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id || props.name}-error` : undefined}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y ${
          error ? 'border-danger-500' : 'border-neutral-300'
        } ${props.disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'}`}
      />
      {(error || maxLength) && (
        <div className="mt-1 flex justify-between">
          {error && (
            <p
              id={`${props.id || props.name}-error`}
              className="text-sm text-danger-600"
              role="alert"
            >
              {error}
            </p>
          )}
          {maxLength && (
            <p className="text-sm text-neutral-500 ml-auto">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

