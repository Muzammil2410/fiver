import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useAuthStore } from '../store/useAuthStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { toast } from '../utils/toast'

export default function SellerLogin() {
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
      // Login: Check localStorage for user
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      const user = users.find(
        (u) =>
          (u.email === formData.email || u.phone === formData.phone) &&
          u.password === formData.password &&
          u.role === 'freelancer' // Only allow freelancers/sellers
      )
      
      if (!user) {
        setErrors({
          submit: 'Invalid credentials or you are not registered as a seller.',
        })
        setLoading(false)
        return
      }
      
      // Generate mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Login user
      login(user, token)
      
      toast.success('Login successful!')
      
      // Redirect seller to their dashboard
      const gigs = JSON.parse(localStorage.getItem('gigs') || '[]')
      const userGigs = gigs.filter((g) => g.seller?.id === user.id || g.sellerId === user.id)
      if (userGigs.length === 0) {
        // No gigs yet, redirect to create gig
        navigate('/create-gig')
      } else {
        // Has gigs, redirect to seller dashboard
        navigate('/seller')
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-3 text-neutral-900">Seller Login</h1>
              <p className="text-lg text-neutral-600">Sign in to manage your gigs and grow your business</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
                required
                className="text-base"
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
                Login as Seller
              </Button>
              
              <div className="text-center space-y-3 pt-4 border-t border-neutral-200">
                <p className="text-neutral-700">
                  Don't have a seller account?{' '}
                  <Link to="/seller-signup" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                    Become a Seller
                  </Link>
                </p>
                <p className="text-sm text-neutral-500">
                  Are you a client?{' '}
                  <Link to="/client-login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                    Client Login
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
