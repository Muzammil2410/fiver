import React, { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'

export default function UsernameModal({ isOpen, onComplete }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const updateUser = useAuthStore((state) => state.updateUser)
  const user = useAuthStore((state) => state.user)
  
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
  
  const checkUsernameAvailability = (username) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    return !users.some((u) => u.username?.toLowerCase() === username.toLowerCase())
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }
    
    if (!checkUsernameAvailability(username)) {
      setError('Username is already taken. Please choose another.')
      return
    }
    
    setLoading(true)
    
    try {
      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u) => u.id === user.id)
      
      if (userIndex > -1) {
        users[userIndex].username = username.trim()
        localStorage.setItem('users', JSON.stringify(users))
        
        // Update Zustand store
        updateUser({ ...user, username: username.trim() })
        
        toast.success('Username set successfully!')
        // After username is set, redirect to create-gig for freelancers
        onComplete()
        // Navigate to create-gig page
        navigate('/create-gig')
      }
    } catch (error) {
      setError('Failed to set username. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing until username is set
      title="Choose Your Username"
      size="md"
      footer={null} // Hide default footer
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Please choose a unique username. This will be your public identifier on the platform.
          </p>
          <Input
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
              setError('')
            }}
            placeholder="Enter username (e.g., johndoe_123)"
            error={error}
            autoFocus
            maxLength={20}
          />
          <p className="text-xs text-neutral-500 mt-1">
            3-20 characters, letters, numbers, and underscores only
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={!username.trim() || loading}
          >
            Yes, Continue
          </Button>
        </div>
      </form>
    </Modal>
  )
}

