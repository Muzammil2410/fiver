import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Tag from '../../components/ui/Tag'
import Select from '../../components/ui/Select'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/useAuthStore'
import { toast } from '../../utils/toast'
import api from '../../services/api'
import { cropImageForFace } from '../../utils/imageCropper'

export default function SellerProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    avatar: '',
    title: '',
    skills: [],
    bio: '',
    portfolio: {
      images: [],
      links: []
    },
    languages: [],
    experienceLevel: ''
  })
  
  const [skillInput, setSkillInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')
  const [portfolioLinkInput, setPortfolioLinkInput] = useState('')
  
  useEffect(() => {
    if (user) {
      setFormData({
        avatar: user.avatar || '',
        title: user.title || '',
        skills: user.skills || [],
        bio: user.bio || '',
        portfolio: {
          images: user.portfolio?.images || [],
          links: user.portfolio?.links || []
        },
        languages: user.languages || [],
        experienceLevel: user.experienceLevel || ''
      })
    }
  }, [user])
  
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }
    
    try {
      setError('')
      setLoading(true)
      
      const reader = new FileReader()
      reader.onloadend = async (event) => {
        try {
          const croppedImage = await cropImageForFace(
            event.target.result,
            400,
            400,
            0.8
          )
          
          setFormData({
            ...formData,
            avatar: croppedImage
          })
          toast.success('Profile picture updated!')
        } catch (err) {
          console.error('Image processing error:', err)
          setError('Failed to process image: ' + err.message)
        } finally {
          setLoading(false)
        }
      }
      reader.onerror = () => {
        setError('Failed to read image file')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to upload image')
      setLoading(false)
    }
  }
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }
  
  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill)
    })
  }
  
  const handleAddLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, languageInput.trim()]
      })
      setLanguageInput('')
    }
  }
  
  const handleRemoveLanguage = (language) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((l) => l !== language)
    })
  }
  
  const handleAddPortfolioLink = () => {
    if (portfolioLinkInput.trim()) {
      const url = portfolioLinkInput.trim()
      // Basic URL validation
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('www.')) {
        setFormData({
          ...formData,
          portfolio: {
            ...formData.portfolio,
            links: [...formData.portfolio.links, url]
          }
        })
        setPortfolioLinkInput('')
      } else {
        setError('Please enter a valid URL (starting with http://, https://, or www.)')
      }
    }
  }
  
  const handleRemovePortfolioLink = (link) => {
    setFormData({
      ...formData,
      portfolio: {
        ...formData.portfolio,
        links: formData.portfolio.links.filter((l) => l !== link)
      }
    })
  }
  
  const handlePortfolioImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    try {
      setLoading(true)
      setError('')
      
      const newImages = []
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          setError('Each image must be less than 5MB')
          continue
        }
        
        if (!file.type.startsWith('image/')) {
          continue
        }
        
        const reader = new FileReader()
        await new Promise((resolve, reject) => {
          reader.onloadend = async (event) => {
            try {
              const croppedImage = await cropImageForFace(
                event.target.result,
                1200,
                800,
                0.7
              )
              newImages.push(croppedImage)
              resolve()
            } catch (err) {
              reject(err)
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }
      
      setFormData({
        ...formData,
        portfolio: {
          ...formData.portfolio,
          images: [...formData.portfolio.images, ...newImages]
        }
      })
      
      toast.success(`${newImages.length} portfolio image(s) added!`)
    } catch (err) {
      console.error('Error processing portfolio images:', err)
      setError('Failed to process some images')
    } finally {
      setLoading(false)
    }
  }
  
  const handleRemovePortfolioImage = (index) => {
    setFormData({
      ...formData,
      portfolio: {
        ...formData.portfolio,
        images: formData.portfolio.images.filter((_, i) => i !== index)
      }
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    
    try {
      const response = await api.put('/auth/profile', formData)
      
      if (response.data.success) {
        // Update user in store immediately for real-time updates
        updateUser(response.data.data.user)
        toast.success('Profile updated successfully!')
      } else {
        setError(response.data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.')
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }
  
  if (!user || user.role !== 'freelancer') {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-neutral-600">This page is only available for sellers.</p>
        </div>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">Seller Profile</h1>
          <p className="text-neutral-600">Manage your profile information and showcase your expertise</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-neutral-900">Profile Picture</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar
                  src={formData.avatar}
                  name={user.name}
                  size="xl"
                  className="ring-4 ring-primary-100"
                />
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: '' })}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
                    aria-label="Remove avatar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Upload Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                  className="block w-full text-sm text-neutral-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    file:cursor-pointer
                    cursor-pointer disabled:opacity-50"
                />
                <p className="text-xs text-neutral-500 mt-1">Max size: 5MB. Image will be automatically cropped.</p>
              </div>
            </div>
          </Card>
          
          {/* Title */}
          <Card>
            <Input
              label="Professional Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Full Stack Developer, Web Designer, SEO Expert"
              helperText="This title will appear on your gigs and profile"
            />
          </Card>
          
          {/* Bio */}
          <Card>
            <Textarea
              label="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              placeholder="Tell potential clients about yourself, your experience, and what makes you unique..."
              helperText="Write a compelling bio that showcases your expertise and personality"
            />
          </Card>
          
          {/* Skills */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-neutral-900">Skills</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                placeholder="Add a skill and press Enter"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddSkill} variant="secondary">
                Add
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Tag key={skill} onRemove={() => handleRemoveSkill(skill)}>
                    {skill}
                  </Tag>
                ))}
              </div>
            )}
          </Card>
          
          {/* Experience Level */}
          <Card>
            <Select
              label="Experience Level"
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              options={[
                { value: '', label: 'Select experience level' },
                { value: 'Beginner', label: 'Beginner / Level 1' },
                { value: 'Intermediate', label: 'Intermediate / Level 2' },
                { value: 'Expert', label: 'Expert' },
                { value: 'Top Rated', label: 'Top Rated' }
              ]}
              helperText="Your experience level affects your visibility and credibility"
            />
          </Card>
          
          {/* Languages */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-neutral-900">Languages</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddLanguage()
                  }
                }}
                placeholder="Add a language and press Enter"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddLanguage} variant="secondary">
                Add
              </Button>
            </div>
            {formData.languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((language) => (
                  <Badge key={language} variant="default" size="lg" className="text-sm px-3 py-1">
                    {language}
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(language)}
                      className="ml-2 text-neutral-500 hover:text-neutral-700"
                      aria-label={`Remove ${language}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>
          
          {/* Portfolio */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-neutral-900">Portfolio</h2>
            
            {/* Portfolio Links */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Portfolio Links
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={portfolioLinkInput}
                  onChange={(e) => setPortfolioLinkInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddPortfolioLink()
                    }
                  }}
                  placeholder="https://example.com/portfolio"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddPortfolioLink} variant="secondary">
                  Add Link
                </Button>
              </div>
              {formData.portfolio.links.length > 0 && (
                <div className="space-y-2">
                  {formData.portfolio.links.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm truncate flex-1 mr-2"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioLink(link)}
                        className="text-danger-600 hover:text-danger-700"
                        aria-label="Remove link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Portfolio Images */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Portfolio Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePortfolioImageChange}
                disabled={loading}
                className="block w-full text-sm text-neutral-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  file:cursor-pointer
                  cursor-pointer disabled:opacity-50 mb-3"
              />
              {formData.portfolio.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.portfolio.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioImage(idx)}
                        className="absolute top-2 right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          
          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg" role="alert">
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving || loading}
              className="flex-1 sm:flex-none"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

