import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import { toast } from '../../utils/toast'

export default function AuthForm({ mode = 'login', userRole = 'client' }) {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otpEnabled: false,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const validate = () => {
    const newErrors = {}
    
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required'
      }
      if (!formData.email.trim() && !formData.phone.trim()) {
        newErrors.email = 'Email or phone is required'
      }
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else {
      if (!formData.email.trim() && !formData.phone.trim()) {
        newErrors.email = 'Email or phone is required'
      }
      if (!formData.password) {
        newErrors.password = 'Password is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    setLoading(true)
    
    try {
      if (mode === 'signup') {
        // Signup: Store user in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        // Check if user already exists
        const existingUser = users.find(
          (u) => u.email === formData.email || u.phone === formData.phone
        )
        
        if (existingUser) {
          setErrors({
            submit: 'An account with this email or phone already exists.',
          })
          setLoading(false)
          return
        }
        
        // Create new user
        // userRole is 'freelancer' for "Become a Seller", 'client' for "Join"
        const role = userRole === 'freelancer' ? 'freelancer' : 'client'
        const newUser = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          password: formData.password, // In production, this should be hashed
          otpEnabled: formData.otpEnabled,
          role: role,
          username: null, // Username will be set after login (only for freelancers)
          createdAt: new Date().toISOString(),
          avatar: null,
        }
        
        // Save to localStorage
        users.push(newUser)
        localStorage.setItem('users', JSON.stringify(users))
        
        toast.success('Account created successfully! Please login to continue.')
        // Redirect to login page after signup (don't auto-login)
        navigate('/login')
      } else {
        // Login: Check localStorage for user
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        const user = users.find(
          (u) =>
            (u.email === formData.email || u.phone === formData.phone) &&
            u.password === formData.password
        )
        
        if (!user) {
          setErrors({
            submit: 'Invalid email/phone or password.',
          })
          setLoading(false)
          return
        }
        
        // Generate mock token
        const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Login user
        login(user, token)
        
        toast.success('Login successful!')
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin')
        } else if (user.role === 'freelancer') {
          // For freelancers, check if username is set
          if (!user.username) {
            // Will show username modal, then redirect to create-gig
            navigate('/create-gig')
          } else {
            // Check if freelancer has any gigs
            const gigs = JSON.parse(localStorage.getItem('gigs') || '[]')
            const userGigs = gigs.filter((g) => g.seller?.id === user.id)
            if (userGigs.length === 0) {
              // No gigs yet, redirect to create gig
              navigate('/create-gig')
            } else {
              // Has gigs, redirect to dashboard
              navigate('/dashboard')
            }
          }
        } else {
          // Client role - redirect to gigs listing
          navigate('/gigs')
        }
      }
    } catch (error) {
      setErrors({
        submit: 'An error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        {mode === 'signup' ? 'Create Account' : 'Login'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            error={errors.name}
            required
          />
        )}
        
        <Input
          label={mode === 'signup' ? 'Email or Phone' : 'Email/Phone'}
          name="email"
          type="text"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          error={errors.email}
          placeholder={mode === 'signup' ? 'Enter email or phone' : 'Enter email or phone'}
          required
        />
        
        {mode === 'signup' && (
          <Input
            label="Phone (optional if email provided)"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        )}
        
        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={errors.password}
            required
          />
        </div>
        
        {mode === 'signup' && (
          <>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              error={errors.confirmPassword}
              required
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="otpEnabled"
                checked={formData.otpEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, otpEnabled: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="otpEnabled" className="text-sm text-neutral-700">
                Enable OTP verification
              </label>
            </div>
          </>
        )}
        
        {errors.submit && (
          <div className="text-danger-600 text-sm" role="alert">
            {errors.submit}
          </div>
        )}
        
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {mode === 'signup' ? 'Sign Up' : 'Login'}
        </Button>
        
        <div className="text-center text-sm">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 hover:underline">
                Login
              </a>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <a href="/signup" className="text-primary-600 hover:underline">
                Sign up
              </a>
            </p>
          )}
        </div>
      </form>
    </Card>
  )
}

