import React, { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'

export default function ProfileSettings() {
  const currentUser = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
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
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u) => u.id === currentUser?.id)
      
      if (userIndex === -1) {
        setError('User not found')
        setSaving(false)
        return
      }
      
      // Update user data
      const updatedUser = {
        ...users[userIndex],
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
      }
      
      users[userIndex] = updatedUser
      localStorage.setItem('users', JSON.stringify(users))
      
      // Update auth store
      updateUser(updatedUser)
      
      toast.success('Profile updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }
  
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!passwordData.currentPassword) {
      setError('Current password is required')
      return
    }
    
    if (!passwordData.newPassword) {
      setError('New password is required')
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u) => u.id === currentUser?.id)
      
      if (userIndex === -1) {
        setError('User not found')
        return
      }
      
      // Verify current password
      if (users[userIndex].password !== passwordData.currentPassword) {
        setError('Current password is incorrect')
        return
      }
      
      // Update password
      users[userIndex].password = passwordData.newPassword
      localStorage.setItem('users', JSON.stringify(users))
      
      toast.success('Password changed successfully!')
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to change password')
      toast.error('Failed to change password')
    }
  }
  
  if (!currentUser) {
    return (
      <MainLayout>
        <div>Please log in to access profile settings.</div>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">Profile Settings</h1>
          <p className="text-neutral-600 text-base md:text-lg">Manage your profile information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
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
                <h2 className="text-2xl font-semibold text-neutral-900">Profile Information</h2>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <Avatar
                        src={formData.avatar || currentUser.avatar}
                        name={formData.name || currentUser.name}
                        size="xl"
                      />
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
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
                      <p className="text-sm text-neutral-600 mb-2">
                        Upload a profile picture to personalize your account. JPG, PNG or GIF. Max size 5MB.
                      </p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <span className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer text-sm font-medium">
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

                {error && (
                  <div className="text-danger-600 text-sm bg-danger-50 p-4 rounded-lg border border-danger-200" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" loading={saving} className="flex-1 py-3 text-base font-semibold">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>

            {/* Change Password Section */}
            <Card className="p-6 md:p-8 shadow-lg mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-warning-600"
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
                  <h2 className="text-2xl font-semibold text-neutral-900">Change Password</h2>
                </div>
                {!isChangingPassword && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsChangingPassword(true)}
                    className="py-2 text-base"
                  >
                    Change Password
                  </Button>
                )}
              </div>

              {isChangingPassword && (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <Input
                    label="Current Password *"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                    required
                    className="text-base"
                  />
                  
                  <Input
                    label="New Password *"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password (min 8 characters)"
                    required
                    minLength={8}
                    className="text-base"
                  />
                  
                  <Input
                    label="Confirm New Password *"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    required
                    className="text-base"
                  />
                  
                  {error && (
                    <div className="text-danger-600 text-sm bg-danger-50 p-4 rounded-lg border border-danger-200" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 py-3 text-base font-semibold">
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
            <Card className="p-6 md:p-8 shadow-lg h-fit lg:sticky lg:top-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Preview</h3>
              
              <div className="text-center mb-6">
                <Avatar
                  src={formData.avatar || currentUser.avatar}
                  name={formData.name || currentUser.name}
                  size="xl"
                  className="mx-auto mb-4"
                />
                <h4 className="text-xl font-bold text-neutral-900 mb-1">
                  {formData.name || currentUser.name || 'Your Name'}
                </h4>
                <p className="text-sm text-neutral-600">
                  {formData.email || currentUser.email || 'your.email@example.com'}
                </p>
                {formData.phone && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {formData.phone}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-neutral-500 mb-1">Member Since</p>
                    <p className="text-neutral-900 font-medium">
                      {currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1">Account Type</p>
                    <p className="text-neutral-900 font-medium capitalize">
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

