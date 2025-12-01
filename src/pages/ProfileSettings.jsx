import React, { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'
import * as authService from '../services/auth'
import * as orderService from '../services/orders'

export default function ProfileSettings() {
  const currentUser = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const token = useAuthStore((state) => state.token)
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: currentUser.avatar || '',
      })
    }
  }, [currentUser])

  // Real-time password validation
  useEffect(() => {
    if (!isChangingPassword) return

    const errors = {}
    let strength = 0

    // Current password validation
    if (passwordData.currentPassword) {
      // Real-time check will be done on submit
    }

    // New password validation
    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters'
      } else {
        strength++
      }

      if (!/[A-Z]/.test(passwordData.newPassword)) {
        // No error, just strength indicator
      } else {
        strength++
      }

      if (!/[a-z]/.test(passwordData.newPassword)) {
        // No error, just strength indicator
      } else {
        strength++
      }

      if (!/[0-9]/.test(passwordData.newPassword)) {
        // No error, just strength indicator
      } else {
        strength++
      }

      if (!/[^A-Za-z0-9]/.test(passwordData.newPassword)) {
        // No error, just strength indicator
      } else {
        strength++
      }

      // Check if same as current password
      if (passwordData.currentPassword && passwordData.newPassword === passwordData.currentPassword) {
        errors.newPassword = 'New password must be different from current password'
      }
    }

    // Confirm password validation
    if (passwordData.confirmPassword) {
      if (passwordData.newPassword && passwordData.confirmPassword !== passwordData.newPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    setPasswordErrors(errors)
    setPasswordStrength(strength)
  }, [passwordData, isChangingPassword])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }
  
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result,
        }))
        setError('')
      }
      reader.onerror = () => {
        setError('Failed to read image file')
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    
    if (!formData.name.trim()) {
      setError('Name is required')
      setSaving(false)
      return
    }
    
    try {
      const response = await authService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
      })
      
      if (response.success) {
        updateUser(response.data.user)
        toast.success('Profile updated successfully!')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }
  
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate all fields
    if (!passwordData.currentPassword) {
      setError('Current password is required')
      return
    }
    
    if (!passwordData.newPassword) {
      setError('New password is required')
      return
    }
    
    if (Object.keys(passwordErrors).length > 0) {
      setError('Please fix the password errors before submitting')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      
      if (response.success) {
        toast.success('Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setPasswordErrors({})
        setPasswordStrength(0)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    return 'Strong'
  }
  
  if (!currentUser) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <p className="text-neutral-600">Please log in to access profile settings.</p>
        </Card>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-neutral-600 text-sm sm:text-base">
                Manage your profile information and account settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Information Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <Card className="overflow-hidden border border-neutral-200 shadow-lg">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Profile Information</h2>
                </div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-4">
                    Profile Picture
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative group">
                      <Avatar
                        src={formData.avatar || currentUser.avatar}
                        name={formData.name || currentUser.name}
                        size="xl"
                        className="ring-4 ring-primary-100 transition-all group-hover:ring-primary-200"
                      />
                      <label className="absolute bottom-0 right-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full p-2.5 cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-600 mb-3">
                        Upload a profile picture to personalize your account. JPG, PNG or GIF. Max size 5MB.
                      </p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <span className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors cursor-pointer text-sm font-medium inline-flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Choose File
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <Input
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="text-base"
                />

                {/* Email */}
                <Input
                  label="Email / Gmail *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  className="text-base"
                />

                {/* Phone */}
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="text-base"
                />

                {error && !isChangingPassword && (
                  <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded-r-lg" role="alert">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-danger-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200">
                  <Button 
                    type="submit" 
                    loading={saving} 
                    className="flex-1 py-3 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transition-all"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Change Password Section */}
            <Card className="overflow-hidden border border-neutral-200 shadow-lg">
              <div className="bg-gradient-to-r from-warning-500 to-warning-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Change Password</h2>
                  </div>
                  {!isChangingPassword && (
                    <Button
                      variant="secondary"
                      onClick={() => setIsChangingPassword(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    >
                      Change Password
                    </Button>
                  )}
                </div>
              </div>

              {isChangingPassword && (
                <form onSubmit={handleChangePassword} className="p-6 sm:p-8 space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                        setError('')
                      }}
                      placeholder="Enter your current password"
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base transition-all"
                    />
                  </div>
                  
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                        setError('')
                      }}
                      placeholder="Enter new password (min 8 characters)"
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-base transition-all ${
                        passwordErrors.newPassword
                          ? 'border-danger-500 focus:ring-danger-500'
                          : passwordData.newPassword
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-neutral-300 focus:ring-primary-500'
                      }`}
                    />
                    {passwordData.newPassword && (
                      <div className="mt-3 space-y-2">
                        {/* Password Strength Indicator */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength <= 2 ? 'text-red-600' :
                            passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        {/* Password Requirements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className={`flex items-center gap-2 ${passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-neutral-500'}`}>
                            <svg className={`w-4 h-4 ${passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {passwordData.newPassword.length >= 8 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                            At least 8 characters
                          </div>
                          <div className={`flex items-center gap-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-neutral-500'}`}>
                            <svg className={`w-4 h-4 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {/[A-Z]/.test(passwordData.newPassword) ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                            One uppercase letter
                          </div>
                          <div className={`flex items-center gap-2 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-neutral-500'}`}>
                            <svg className={`w-4 h-4 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {/[a-z]/.test(passwordData.newPassword) ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                            One lowercase letter
                          </div>
                          <div className={`flex items-center gap-2 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-neutral-500'}`}>
                            <svg className={`w-4 h-4 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {/[0-9]/.test(passwordData.newPassword) ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                            One number
                          </div>
                        </div>
                      </div>
                    )}
                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-sm text-danger-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                        setError('')
                      }}
                      placeholder="Confirm your new password"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-base transition-all ${
                        passwordErrors.confirmPassword
                          ? 'border-danger-500 focus:ring-danger-500'
                          : passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-neutral-300 focus:ring-primary-500'
                      }`}
                    />
                    {passwordData.confirmPassword && (
                      <div className="mt-2">
                        {passwordData.confirmPassword === passwordData.newPassword ? (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Passwords match
                          </p>
                        ) : (
                          <p className="text-sm text-danger-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    )}
                    {passwordErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-danger-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                  
                  {error && isChangingPassword && (
                    <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded-r-lg" role="alert">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-danger-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200">
                    <Button 
                      type="submit" 
                      disabled={Object.keys(passwordErrors).length > 0 || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="flex-1 py-3 text-base font-semibold bg-gradient-to-r from-warning-600 to-warning-700 hover:from-warning-700 hover:to-warning-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Password
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        })
                        setPasswordErrors({})
                        setPasswordStrength(0)
                        setError('')
                      }}
                      className="py-3 text-base font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Profile Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sm:p-8 shadow-lg border border-neutral-200 h-fit lg:sticky lg:top-6 overflow-hidden">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 -m-6 sm:-m-8 mb-6 sm:mb-8 px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Profile Preview</h3>
                <p className="text-primary-100 text-sm">See how your profile looks</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-block relative">
                  <Avatar
                    src={formData.avatar || currentUser.avatar}
                    name={formData.name || currentUser.name}
                    size="xl"
                    className="mx-auto mb-4 ring-4 ring-primary-100"
                  />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 mb-1">
                  {formData.name || currentUser.name || 'Your Name'}
                </h4>
                <p className="text-sm text-neutral-600 mb-2">
                  {formData.email || currentUser.email || 'your.email@example.com'}
                </p>
                {formData.phone && (
                  <p className="text-sm text-neutral-600 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {formData.phone}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-neutral-500 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Member Since
                    </p>
                    <p className="text-neutral-900 font-semibold">
                      {currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account Type
                    </p>
                    <p className="text-neutral-900 font-semibold capitalize">
                      {currentUser.role || 'Client'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
