import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Tag from '../components/ui/Tag'
import Select from '../components/ui/Select'
import * as gigService from '../services/gigs'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'
import { cropImageForFace } from '../utils/imageCropper'

export default function CreateGig() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deliveryTime: '',
    category: '',
    skills: [],
    coverImage: '', // Main background/cover image for the gig card
    images: [],
    packages: [
      {
        name: 'Basic',
        price: '',
        description: '',
        deliveryTime: '',
        revisions: '',
      },
      {
        name: 'Standard',
        price: '',
        description: '',
        deliveryTime: '',
        revisions: '',
      },
      {
        name: 'Premium',
        price: '',
        description: '',
        deliveryTime: '',
        revisions: '',
      },
    ],
    requirements: [],
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      })
      setSkillInput('')
    }
  }
  
  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    })
  }
  
  const handlePackageChange = (index, field, value) => {
    const updatedPackages = [...formData.packages]
    updatedPackages[index] = {
      ...updatedPackages[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      packages: updatedPackages,
    })
  }
  
  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.requirements]
    updatedRequirements[index] = value
    setFormData({
      ...formData,
      requirements: updatedRequirements,
    })
  }
  
  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ''],
    })
  }
  
  const removeRequirement = (index) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!formData.coverImage.trim()) {
      setError('Cover image is required')
      return
    }
    
    // Validate packages
    const validPackages = formData.packages.filter(
      (pkg) =>
        pkg.price &&
        pkg.description.trim() &&
        pkg.deliveryTime &&
        pkg.revisions
    )
    
    if (validPackages.length === 0) {
      setError('At least one package must be fully configured')
      return
    }
    
    if (!user) {
      setError('You must be logged in to create a gig')
      return
    }
    
    if (user.role !== 'freelancer') {
      setError('Only freelancers can create gigs')
      return
    }
    
    setLoading(true)
    
    try {
      // Process packages - convert to numbers and filter out incomplete ones
      const processedPackages = formData.packages
        .filter(
          (pkg) =>
            pkg.price &&
            pkg.description.trim() &&
            pkg.deliveryTime &&
            pkg.revisions
        )
        .map((pkg) => ({
          name: pkg.name,
          price: parseInt(pkg.price),
          description: pkg.description.trim(),
          deliveryTime: parseInt(pkg.deliveryTime),
          revisions: parseInt(pkg.revisions),
        }))
      
      // Filter out empty requirements
      const processedRequirements = formData.requirements.filter((req) => req.trim())
      
      // Associate gig with logged-in freelancer
      const gigData = {
        title: formData.title,
        description: formData.description,
        price: processedPackages.length > 0 ? processedPackages[0].price : parseInt(formData.price) || 0,
        deliveryTime: processedPackages.length > 0 ? processedPackages[0].deliveryTime : parseInt(formData.deliveryTime) || 0,
        category: formData.category,
        skills: formData.skills,
        coverImage: formData.coverImage, // Main background image
        images: formData.images,
        packages: processedPackages,
        requirements: processedRequirements,
        seller: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          level: 'Expert', // Default level, can be updated later
          title: user.username || user.name,
        },
      }
      
      // Log payload size before sending
      const payloadSize = JSON.stringify(gigData).length
      const payloadSizeMB = payloadSize / (1024 * 1024)
      console.log(`📤 Sending payload size: ${payloadSizeMB.toFixed(2)} MB`)
      
      const response = await gigService.createGig(gigData)
      toast.success('Gig created successfully!')
      // Redirect to seller dashboard
      navigate('/seller')
    } catch (err) {
      setError(err.message || 'Failed to create gig')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <MainLayout>
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Create Gig</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          
          <Textarea
            label="Description *"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={6}
            required
          />
          
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Cover Image (Background Picture) *
            </label>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      setError('Image size must be less than 5MB')
                      return
                    }
                    
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      setError('Please upload a valid image file')
                      return
                    }
                    
                    // Process image with face detection and cropping
                    const reader = new FileReader()
                    reader.onloadend = async (event) => {
                      try {
                        setError('Processing image and detecting face...')
                        
                        // Use face detection and cropping utility
                        const croppedImage = await cropImageForFace(
                          event.target.result,
                          1200, // maxWidth
                          800,  // maxHeight
                          0.7    // quality
                        )
                        
                        // Check final size
                        const sizeInMB = croppedImage.length / (1024 * 1024)
                        console.log(`📸 Processed image size: ${sizeInMB.toFixed(2)} MB`)
                        
                        // Final check - if still too large, show error
                        if (sizeInMB > 15) {
                          setError(`Image is still too large (${sizeInMB.toFixed(2)} MB) after processing. Please use a smaller image.`)
                          return
                        }
                        
                        setFormData({
                          ...formData,
                          coverImage: croppedImage,
                        })
                        setError('')
                        toast.success('Image processed successfully! Face is now properly visible.')
                      } catch (err) {
                        console.error('Image processing error:', err)
                        setError('Failed to process image: ' + err.message)
                      }
                    }
                    reader.onerror = () => {
                      setError('Failed to read image file')
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="block w-full text-sm text-neutral-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  file:cursor-pointer
                  cursor-pointer"
                required
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Upload a high-quality image that will be displayed as the main background on your gig card. Max size: 5MB
            </p>
            {formData.coverImage && (
              <div className="mt-4">
                <p className="text-sm text-neutral-600 mb-2">Preview:</p>
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-64 object-cover rounded-md border border-neutral-200 shadow-sm"
                />
              </div>
            )}
          </div>
          
          {/* Base price/delivery - optional, used as fallback if packages not fully configured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Base Price (PKR) - Optional"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="Fallback if packages not set"
            />
            
            <Input
              label="Base Delivery Time (days) - Optional"
              type="number"
              value={formData.deliveryTime}
              onChange={(e) =>
                setFormData({ ...formData, deliveryTime: e.target.value })
              }
              placeholder="Fallback if packages not set"
            />
          </div>
          <p className="text-xs text-neutral-500 -mt-2 mb-4">
            Note: Package-specific prices and delivery times (configured below) will be used instead of these base values.
          </p>
          
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="Select category"
            required
            options={[
              { value: '', label: 'Select category' },
              { value: 'social-media-management', label: 'Social Media Management' },
              { value: 'video-editing', label: 'Video Editing' },
              { value: 'logo-designing', label: 'Logo Designing' },
              { value: 'seo-expert', label: 'SEO Expert' },
              { value: 'website-development', label: 'Website Development' },
              { value: 'web-designer', label: 'Web Designer' },
              { value: 'wordpress-developer', label: 'WordPress Developer' },
            ]}
          />
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Skills
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                placeholder="Add skill and press Enter"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddSkill} className="w-full sm:w-auto">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Tag key={skill} onRemove={() => handleRemoveSkill(skill)}>
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
          
          {/* Packages Section */}
          <div className="border-t pt-4 sm:pt-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Package Configuration</h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4">
              Configure your three packages (Basic, Standard, Premium). All fields are required for each package.
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              {formData.packages.map((pkg, index) => (
                <Card key={index} className="p-3 sm:p-4 bg-neutral-50">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary-600">
                    {pkg.name} Package
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Input
                      label="Price (PKR) *"
                      type="number"
                      value={pkg.price}
                      onChange={(e) =>
                        handlePackageChange(index, 'price', e.target.value)
                      }
                      placeholder="e.g., 3000"
                      required
                    />
                    <Input
                      label="Delivery Time (days) *"
                      type="number"
                      value={pkg.deliveryTime}
                      onChange={(e) =>
                        handlePackageChange(index, 'deliveryTime', e.target.value)
                      }
                      placeholder="e.g., 5"
                      required
                    />
                    <Input
                      label="Number of Revisions *"
                      type="number"
                      value={pkg.revisions}
                      onChange={(e) =>
                        handlePackageChange(index, 'revisions', e.target.value)
                      }
                      placeholder="e.g., 2"
                      required
                    />
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Description *"
                        value={pkg.description}
                        onChange={(e) =>
                          handlePackageChange(index, 'description', e.target.value)
                        }
                        placeholder="Describe what's included in this package"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Requirements Section */}
          <div className="border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Requirements</h2>
              <Button
                type="button"
                variant="secondary"
                onClick={addRequirement}
                className="w-full sm:w-auto"
              >
                Add Requirement
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4">
              List what information you need from the client to complete this gig.
            </p>
            <div className="space-y-2">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder="Enter requirement (e.g., Brand name, Industry)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeRequirement(index)}
                    className="text-danger-600 w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {formData.requirements.length === 0 && (
                <p className="text-sm text-neutral-500 italic">
                  No requirements added yet. Click "Add Requirement" to add one.
                </p>
              )}
            </div>
          </div>
          
          {error && (
            <div className="text-danger-600 text-sm" role="alert">
              {error}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              Create Gig
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/gigs')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  )
}

