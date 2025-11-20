import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    username: '',
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  useEffect(() => {
    loadProfile()
  }, [id])
  
  useEffect(() => {
    if (profileUser) {
      setFormData({
        name: profileUser.name || '',
        email: profileUser.email || '',
        phone: profileUser.phone || '',
        avatar: profileUser.avatar || '',
        username: profileUser.username || '',
      })
    }
  }, [profileUser])
  
  const loadProfile = () => {
    setLoading(true)
    try {
      // Get user from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      let user = users.find((u) => u.id === id)
      
      // If user not found in users array, check if it's the current user
      if (!user && currentUser && currentUser.id === id) {
        user = currentUser
      }
      
      // If still not found, try to get from auth store directly
      if (!user) {
        const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (authData.state?.user && authData.state.user.id === id) {
          user = authData.state.user
        }
      }
      
      if (user) {
        setProfileUser(user)
        // Check if current user is viewing their own profile
        if (currentUser && currentUser.id === id) {
          setIsEditing(true)
        }
      } else {
        toast.error('User not found')
        // Don't navigate away, just show error
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
      const userIndex = users.findIndex((u) => u.id === id)
      
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
        username: formData.username,
      }
      
      users[userIndex] = updatedUser
      localStorage.setItem('users', JSON.stringify(users))
      
      // Update auth store if it's the current user
      if (currentUser && currentUser.id === id) {
        updateUser(updatedUser)
      }
      
      setProfileUser(updatedUser)
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
      const userIndex = users.findIndex((u) => u.id === id)
      
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
  
  const isOwnProfile = currentUser && currentUser.id === id
  
  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse">Loading...</div>
      </MainLayout>
    )
  }
  
  if (!profileUser) {
    return (
      <MainLayout>
        <div>User not found</div>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar
                    src={formData.avatar || profileUser.avatar}
                    name={profileUser.name}
                    size="xl"
                  />
                  {isOwnProfile && (
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <svg
                        className="w-4 h-4"
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
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                  {profileUser.username && (
                    <p className="text-neutral-600">@{profileUser.username}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={profileUser.role === 'freelancer' ? 'primary' : 'default'}>
                      {profileUser.role === 'freelancer' ? 'Seller' : 'Client'}
                    </Badge>
                    {profileUser.level && (
                      <Badge variant="primary" size="sm">
                        {profileUser.level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {isOwnProfile && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
            
            {/* Profile Information */}
            {isOwnProfile && isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                  
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                  />
                </div>
                
                {error && (
                  <div className="text-danger-600 text-sm" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button type="submit" loading={saving}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: profileUser.name || '',
                        email: profileUser.email || '',
                        phone: profileUser.phone || '',
                        avatar: profileUser.avatar || '',
                        username: profileUser.username || '',
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Email</h3>
                  <p className="text-neutral-900">
                    {profileUser.email || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Phone</h3>
                  <p className="text-neutral-900">
                    {profileUser.phone || 'Not provided'}
                  </p>
                </div>
                
                {profileUser.username && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-600 mb-1">Username</h3>
                    <p className="text-neutral-900">@{profileUser.username}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Member Since</h3>
                  <p className="text-neutral-900">
                    {profileUser.createdAt
                      ? new Date(profileUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Change Password Section (Only for own profile) */}
            {isOwnProfile && (
              <div className="border-t pt-6">
                {!isChangingPassword ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Password</h3>
                      <p className="text-sm text-neutral-600">
                        Change your account password
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    
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
                      required
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
                      required
                      minLength={8}
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
                      required
                    />
                    
                    {error && (
                      <div className="text-danger-600 text-sm" role="alert">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button type="submit">Update Password</Button>
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
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}

