import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { toast } from '../utils/toast'

export default function ClientSignup() {
  const navigate = useNavigate()
  
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
  
  const validate = () => {
    const newErrors = {}
    
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
      
      // Create new client user
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        password: formData.password,
        otpEnabled: formData.otpEnabled,
        role: 'client', // Client role
        username: null,
        createdAt: new Date().toISOString(),
        avatar: null,
      }
      
      // Save to localStorage
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      toast.success('Account created successfully! Please login to continue.')
      // Redirect to client login page
      navigate('/client-login')
    } catch (error) {
      setErrors({
        submit: 'An error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-lg mx-auto shadow-xl">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-3 text-neutral-900">Join as Client</h1>
              <p className="text-lg text-neutral-600">Create your account to browse amazing gigs</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={errors.name}
                placeholder="Enter your full name"
                required
                className="text-base"
              />
              
              <Input
                label="Email or Phone"
                name="email"
                type="text"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                placeholder="Enter email or phone"
                required
                className="text-base"
              />
              
              <Input
                label="Phone (optional if email provided)"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className="text-base"
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
                placeholder="Enter password (min 8 characters)"
                required
                className="text-base"
              />
              
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                required
                className="text-base"
              />
              
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="otpEnabled"
                  checked={formData.otpEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, otpEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="otpEnabled" className="ml-3 text-sm text-neutral-700">
                  Enable OTP verification for added security
                </label>
              </div>
              
              {errors.submit && (
                <div className="text-danger-600 text-sm bg-danger-50 p-3 rounded-md" role="alert">
                  {errors.submit}
                </div>
              )}
              
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
                className="py-3 text-base font-semibold mt-2"
              >
                Create Account
              </Button>
              
              <div className="text-center pt-4 border-t border-neutral-200">
                <p className="text-neutral-700">
                  Already have an account?{' '}
                  <Link to="/client-login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
