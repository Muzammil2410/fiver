import React, { useState } from 'react'

export default function Input({
  label,
  error,
  type = 'text',
  clearable = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [value, setValue] = useState(props.value || '')
  
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  
  const handleChange = (e) => {
    setValue(e.target.value)
    if (props.onChange) {
      props.onChange(e)
    }
  }
  
  const handleClear = () => {
    setValue('')
    if (props.onChange) {
      const event = { target: { value: '', name: props.name } }
      props.onChange(event)
    }
  }
  
  // Extract className from props to avoid passing it to input
  const { className: inputClassName, label: _, error: __, clearable: ___, type: ____, ...inputProps } = props
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputProps.id || inputProps.name}
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...inputProps}
          type={inputType}
          value={inputProps.value !== undefined ? inputProps.value : value}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputProps.id || inputProps.name}-error` : undefined}
          className={`w-full px-4 py-3 sm:py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-base ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300'
          } ${inputProps.disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white hover:border-neutral-400'} ${inputClassName || ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
        {clearable && value && !inputProps.disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            aria-label="Clear input"
          >
            ×
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${inputProps.id || inputProps.name}-error`}
          className="mt-1 text-sm text-danger-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

