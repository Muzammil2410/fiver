import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'
import * as authService from '../services/auth'

export default function UsernameModal({ isOpen, onComplete }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const updateUser = useAuthStore((state) => state.updateUser)
  const user = useAuthStore((state) => state.user)
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUsername('')
      setError('')
    }
  }, [isOpen])
  
  const validateUsername = (value) => {
    if (!value.trim()) {
      return 'Username is required'
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (value.length > 20) {
      return 'Username must be less than 20 characters'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return null
  }
  
  // Check username availability in database
  const checkUsernameAvailability = async (usernameValue) => {
    if (!usernameValue || !usernameValue.trim()) {
      return { available: false, message: 'Username is required' }
    }
    
    setCheckingAvailability(true)
    try {
      const response = await authService.checkUsernameAvailability(usernameValue.trim())
      return {
        available: response.available,
        message: response.message || (response.available ? 'Username is available' : 'This name already exists. Choose a different name.')
      }
    } catch (error) {
      console.error('Error checking username availability:', error)
      return {
        available: false,
        message: error.response?.data?.message || 'Error checking username availability. Please try again.'
      }
    } finally {
      setCheckingAvailability(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate username format
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }
    
    setLoading(true)
    
    try {
      // Check username availability in database
      const availabilityCheck = await checkUsernameAvailability(username)
      
      if (!availabilityCheck.available) {
        setError(availabilityCheck.message || 'This name already exists. Choose a different name.')
        setLoading(false)
        return
      }
      
      // Update username via backend API
      const response = await authService.updateProfile({
        username: username.trim()
      })
      
      if (response.success && response.data) {
        // Update Zustand store with new user data
        const updatedUser = {
          ...user,
          username: response.data.user.username
        }
        updateUser(updatedUser)
        
        toast.success('Username set successfully!')
        
        // Call onComplete callback
        onComplete()
        
        // Navigate to create-gig page
        navigate('/create-gig')
      } else {
        setError(response.message || 'Failed to set username. Please try again.')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to set username. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    setUsername('')
    setError('')
    onComplete()
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Choose Your Username"
      size="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            type="submit"
            form="username-form"
            loading={loading || checkingAvailability}
            disabled={!username.trim() || loading || checkingAvailability}
          >
            Yes, Continue
          </Button>
        </div>
      }
    >
      <form id="username-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Please choose a unique username. This will be your public identifier on the platform.
          </p>
          <Input
            label="Username"
            value={username}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
              setUsername(value)
              setError('')
            }}
            placeholder="Enter username (e.g., johndoe_123)"
            error={error}
            autoFocus
            maxLength={20}
            disabled={loading || checkingAvailability}
          />
          <p className="text-xs text-neutral-500 mt-1">
            3-20 characters, letters, numbers, and underscores only
          </p>
        </div>
      </form>
    </Modal>
  )
}

