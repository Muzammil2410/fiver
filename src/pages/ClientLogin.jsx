import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useAuthStore } from '../store/useAuthStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { toast } from '../utils/toast'
import * as authService from '../services/auth'

export default function ClientLogin() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = 'Email or phone is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      // Call backend API for login
      const response = await authService.login({
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        role: 'client' // Only allow clients
      })
      
      if (response.success && response.data) {
        const { user, token } = response.data
        
        // Transform user data to match frontend format
        const userData = {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          username: user.username,
          avatar: user.avatar,
          otpEnabled: user.otpEnabled,
          createdAt: user.createdAt
        }
        
        // Login user with JWT token
        login(userData, token)
        
        toast.success('Login successful!')
        
        // Redirect client to browse gigs (where they see ALL gigs from ALL sellers)
        navigate('/gigs')
      } else {
        setErrors({
          submit: response.message || 'Invalid credentials or you are not registered as a client.',
        })
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.'
      setErrors({
        submit: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-6 sm:py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-2xl">
          <div className="p-8 sm:p-10 md:p-12 lg:p-16">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600"
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
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 md:space-y-7">
              <div>
                <Input
                  label="Email or Phone"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors.email}
                  placeholder="Enter your email or phone number"
                  required
                  className="text-base sm:text-lg"
                />
              </div>
              
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
                  placeholder="Enter your password"
                  required
                  className="text-base sm:text-lg"
                />
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
                className="py-3.5 sm:py-4 text-base sm:text-lg font-semibold mt-6"
              >
                Login
              </Button>
              
              <div className="text-center space-y-3 pt-4 border-t border-neutral-200">
                <p className="text-neutral-700">
                  Don't have an account?{' '}
                  <Link to="/client-signup" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                    Join Now
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
