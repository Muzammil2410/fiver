import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { toast } from '../../utils/toast'
import api from '../../services/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: 'admin123'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
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
      console.log('Attempting admin login with:', { email: formData.email })
      const response = await api.post('/admin/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })
      
      console.log('Login response:', response.data)
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data
        
        // Store admin session in localStorage
        localStorage.setItem('admin-token', token)
        localStorage.setItem('admin-user', JSON.stringify(user))
        
        toast.success('Admin login successful!')
        navigate('/admin/dashboard')
      } else {
        setErrors({
          submit: response.data.message || 'Invalid credentials'
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.'
      setErrors({
        submit: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-6 sm:py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="text-center mb-6 sm:mb-8">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-neutral-900">Admin Login</h1>
              <p className="text-neutral-600">Sign in to access admin panel</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                placeholder="Enter your email"
                required
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
                placeholder="Enter your password"
                required
              />
              
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
                className="py-3 text-base font-semibold"
              >
                Login as Admin
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}

