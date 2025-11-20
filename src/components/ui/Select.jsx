import React, { useState, useRef, useEffect } from 'react'

export default function Select({
  label,
  value,
  onChange,
  options = [],
  error,
  className = '',
  required = false,
  placeholder = 'Select an option',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (optionValue) => {
    if (onChange) {
      const event = {
        target: {
          value: optionValue,
          name: props.name,
        },
      }
      onChange(event)
    }
    setIsOpen(false)
  }

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            error ? 'border-danger-500' : 'border-neutral-300'
          } bg-white flex items-center justify-between`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <ul
              role="listbox"
              className="py-1"
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-3 py-2 cursor-pointer hover:bg-primary-50 ${
                    value === option.value
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-neutral-900'
                  }`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

