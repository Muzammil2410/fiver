import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Tag from '../../components/ui/Tag'
import Select from '../../components/ui/Select'
import PaymentUploadModal from '../../components/payments/PaymentUploadModal'
import ReviewList from '../../components/reviews/ReviewList'
import * as gigService from '../../services/gigs'
import { useAuthStore } from '../../store/useAuthStore'
import { toast } from '../../utils/toast'
import { cropImageForFace } from '../../utils/imageCropper'

export default function GigDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [error, setError] = useState('')
  
  // Form state for editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deliveryTime: '',
    category: '',
    skills: [],
    coverImage: '',
    images: [],
    packages: [],
    requirements: [],
  })
  const [skillInput, setSkillInput] = useState('')
  
  useEffect(() => {
    fetchGig()
  }, [id])
  
  useEffect(() => {
    if (gig && user) {
      // Check if current user is the seller
      const isSeller = gig.seller?.id === user.id || gig.sellerId === user.id
      setIsEditing(isSeller)
      
      if (isSeller) {
        // Pre-fill form with gig data
        setFormData({
          title: gig.title || '',
          description: gig.description || '',
          price: gig.price?.toString() || '',
          deliveryTime: gig.deliveryTime?.toString() || '',
          category: gig.category || '',
          skills: gig.skills || [],
          coverImage: gig.coverImage || gig.image || '',
          images: gig.images || [],
          packages: gig.packages && gig.packages.length > 0 
            ? gig.packages.map(pkg => ({
                name: pkg.name,
                price: pkg.price?.toString() || '',
                description: pkg.description || '',
                deliveryTime: pkg.deliveryTime?.toString() || '',
                revisions: pkg.revisions?.toString() || '',
              }))
            : [
                { name: 'Basic', price: '', description: '', deliveryTime: '', revisions: '' },
                { name: 'Standard', price: '', description: '', deliveryTime: '', revisions: '' },
                { name: 'Premium', price: '', description: '', deliveryTime: '', revisions: '' },
              ],
          requirements: gig.requirements || [],
        })
      }
    }
  }, [gig, user])
  
  const fetchGig = async () => {
    try {
      const response = await gigService.getGigById(id)
      setGig(response.data)
    } catch (error) {
      console.error('Error fetching gig:', error)
      toast.error(error.message || 'Failed to fetch gig')
    } finally {
      setLoading(false)
    }
  }
  
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
  
  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    
    if (!formData.title.trim()) {
      setError('Title is required')
      setSaving(false)
      return
    }
    
    try {
      // Process packages
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
      
      const processedRequirements = formData.requirements.filter((req) => req.trim())
      
      const updatedGig = {
        title: formData.title,
        description: formData.description,
        price: processedPackages.length > 0 ? processedPackages[0].price : parseInt(formData.price) || 0,
        deliveryTime: processedPackages.length > 0 ? processedPackages[0].deliveryTime : parseInt(formData.deliveryTime) || 0,
        category: formData.category,
        skills: formData.skills,
        coverImage: formData.coverImage,
        image: formData.coverImage, // Also set image for compatibility
        images: formData.images,
        packages: processedPackages,
        requirements: processedRequirements,
      }
      
      await gigService.updateGig(id, updatedGig)
      toast.success('Gig updated successfully!')
      
      // Refresh gig data
      await fetchGig()
    } catch (err) {
      setError(err.message || 'Failed to update gig')
      toast.error('Failed to update gig')
    } finally {
      setSaving(false)
    }
  }
  
  const handleOrder = async (pkg) => {
    // Check if user is authenticated before allowing order
    if (!user || !isAuthenticated) {
      // Redirect to client login page
      navigate('/client-login', { 
        state: { 
          returnTo: `/gigs/${gig._id || gig.id}`,
          message: 'Please login to place an order'
        }
      })
      return
    }
    
    // Check if user is the seller of this gig
    const isSeller = gig.seller?.id === user.id || gig.sellerId === user.id || gig.seller?._id === user.id
    if (isSeller) {
      toast.error('You cannot place an order on your own gig')
      return
    }
    
    setSelectedPackage(pkg)
    setShowOrderModal(true)
  }
  
  const handleConfirmOrder = () => {
    // Double check authentication before proceeding
    if (!user || !isAuthenticated) {
      navigate('/client-login', { 
        state: { 
          returnTo: `/gigs/${gig._id || gig.id}`,
          message: 'Please login to place an order'
        }
      })
      return
    }
    
    // Double check if user is the seller of this gig
    const isSeller = gig.seller?.id === user.id || gig.sellerId === user.id || gig.seller?._id === user.id
    if (isSeller) {
      toast.error('You cannot place an order on your own gig')
      setShowOrderModal(false)
      return
    }
    
    // Navigate to payment page with package details
    navigate(`/orders/payment/${gig._id || gig.id}`, {
      state: {
        package: selectedPackage,
        gig: gig
      }
    })
    setShowOrderModal(false)
  }
  
  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-64 bg-neutral-200 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-neutral-200 rounded"></div>
                <div className="h-48 bg-neutral-200 rounded"></div>
              </div>
              <div className="h-96 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
  
  if (!gig) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Gig Not Found</h1>
          <p className="text-neutral-600 mb-6">The gig you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/gigs')}>Browse All Gigs</Button>
        </div>
      </MainLayout>
    )
  }
  
  // If seller is editing, show edit form
  if (isEditing) {
    return (
      <MainLayout>
        <Card className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Gig</h1>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel Editing
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div>
              <form onSubmit={handleSave} className="space-y-4">
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
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Image size must be less than 5MB')
                            return
                          }
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
                    />
                  </div>
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
                
                {/* Base price/delivery */}
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex gap-2 mb-2">
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
                    />
                    <Button type="button" onClick={handleAddSkill}>
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
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Package Configuration</h2>
                  <div className="space-y-6">
                    {formData.packages.map((pkg, index) => (
                      <Card key={index} className="p-4 bg-neutral-50">
                        <h3 className="text-lg font-semibold mb-4 text-primary-600">
                          {pkg.name} Package
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <div className="md:col-span-2">
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
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Requirements</h2>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addRequirement}
                    >
                      Add Requirement
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder="Enter requirement"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeRequirement(index)}
                          className="text-danger-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {formData.requirements.length === 0 && (
                      <p className="text-sm text-neutral-500 italic">
                        No requirements added yet.
                      </p>
                    )}
                  </div>
                </div>
                
                {error && (
                  <div className="text-danger-600 text-sm" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" loading={saving} className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                <div className="space-y-4">
                  {/* Cover Image Preview */}
                  {formData.coverImage && (
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold">{formData.title || 'Gig Title'}</h3>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-3">
                      {formData.description || 'Gig description will appear here...'}
                    </p>
                  </div>
                  
                  {/* Price Preview */}
                  {formData.packages.length > 0 && formData.packages[0].price && (
                    <div>
                      <p className="text-sm text-neutral-600">Starting from</p>
                      <p className="text-xl font-bold text-primary-600">
                        PKR {parseInt(formData.packages[0].price || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {/* Packages Preview */}
                  {formData.packages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Packages:</p>
                      {formData.packages.map((pkg, idx) => (
                        <div key={idx} className="p-2 bg-neutral-50 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{pkg.name}</span>
                            {pkg.price && (
                              <span className="text-primary-600">
                                PKR {parseInt(pkg.price || 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Skills Preview */}
                  {formData.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <Badge key={skill} variant="default" size="sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </MainLayout>
    )
  }
  
  // Read-only view for clients
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section with Cover Image */}
        <div className="mb-8">
          {gig.coverImage || (gig.images && gig.images.length > 0) ? (
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={gig.coverImage || gig.images[0]}
                alt={gig.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 text-white">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                  {gig.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {gig.rating && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-yellow-400 text-xl">★</span>
                      <span className="font-bold text-lg">{gig.rating.toFixed(1)}</span>
                      <span className="text-sm opacity-90">
                        ({gig.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}
                  {gig.deliveryTime && (
                    <Badge variant="default" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {gig.deliveryTime} days delivery
                    </Badge>
                  )}
                  {gig.orderCount > 0 && (
                    <Badge variant="default" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {gig.orderCount} orders
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 sm:p-12 lg:p-16 shadow-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                {gig.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                {gig.rating && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-yellow-300 text-xl">★</span>
                    <span className="font-bold text-lg text-white">{gig.rating.toFixed(1)}</span>
                  </div>
                )}
                {gig.deliveryTime && (
                  <Badge variant="default" className="bg-white/20 backdrop-blur-sm text-white">
                    {gig.deliveryTime} days delivery
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Seller Info Card */}
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-6">
                <Avatar
                  src={gig.seller?.avatar}
                  name={gig.seller?.name}
                  size="xl"
                  className="ring-4 ring-primary-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">{gig.seller?.name || 'Seller'}</h3>
                  <p className="text-neutral-600 mb-3">{gig.seller?.title || 'Professional Seller'}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {gig.seller?.level && (
                      <Badge variant="primary" size="md">
                        {gig.seller.level}
                      </Badge>
                    )}
                    {gig.seller?.rating && (
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{gig.seller.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Image Gallery */}
            {gig.images && gig.images.length > 0 && (
              <Card className="overflow-hidden">
                <h2 className="text-xl font-bold mb-4 px-6 pt-6">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 p-6 pt-0">
                  {gig.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`${gig.title} - Image ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          
            {/* Description */}
            <Card>
              <h2 className="text-2xl font-bold mb-6 text-neutral-900">About This Gig</h2>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 whitespace-pre-line leading-relaxed text-base sm:text-lg">
                  {gig.description}
                </p>
              </div>
            </Card>
          
            {/* Skills */}
            {gig.skills && gig.skills.length > 0 && (
              <Card>
                <h2 className="text-2xl font-bold mb-4 text-neutral-900">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((skill, idx) => (
                    <Badge key={idx} variant="default" size="lg" className="text-sm px-4 py-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          
            {/* Requirements */}
            {gig.requirements && gig.requirements.length > 0 && (
              <Card>
                <h2 className="text-2xl font-bold mb-6 text-neutral-900">What I Need From You</h2>
                <ul className="space-y-3">
                  {gig.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-neutral-700 text-base sm:text-lg">{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          
            {/* Reviews */}
            <ReviewList gigId={id} />
          </div>
        
          {/* Sidebar - Sticky on Desktop */}
          <div className="lg:sticky lg:top-6 lg:h-fit space-y-4 sm:space-y-6">
            {/* Package Selection Card */}
            <Card className="overflow-hidden shadow-xl border-2 border-primary-100">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 sm:p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Select Package</h2>
                <p className="text-primary-100 text-xs sm:text-sm">Choose the perfect plan for your needs</p>
              </div>
              
              <div className="p-4 sm:p-6">
                {(() => {
                  const isSeller = user && (gig.seller?.id === user.id || gig.sellerId === user.id || gig.seller?._id === user.id)
                  return gig.packages && gig.packages.length > 0 ? (
                    <div className="space-y-4">
                      {isSeller && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 text-center">
                            You cannot place an order on your own gig
                          </p>
                        </div>
                      )}
                      {gig.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                            selectedPackage?.name === pkg.name
                              ? 'border-primary-600 bg-primary-50 shadow-lg scale-[1.02]'
                              : 'border-neutral-200 hover:border-primary-300 hover:shadow-md bg-white'
                          }`}
                          onClick={() => !isSeller && setSelectedPackage(pkg)}
                        >
                          {selectedPackage?.name === pkg.name && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-base sm:text-lg font-bold text-neutral-900">{pkg.name}</h3>
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-bold text-primary-600">
                                PKR {pkg.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-600 mb-3 sm:mb-4 line-clamp-2">{pkg.description}</p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-neutral-700 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{pkg.deliveryTime} days</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>{pkg.revisions} revisions</span>
                            </div>
                          </div>
                          <Button
                            fullWidth
                            disabled={isSeller}
                            className="font-semibold py-2 sm:py-3 text-sm sm:text-base"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOrder(pkg)
                            }}
                          >
                            Continue ({pkg.name})
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      {isSeller && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            You cannot place an order on your own gig
                          </p>
                        </div>
                      )}
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        PKR {gig.price?.toLocaleString() || 'N/A'}
                      </div>
                      <p className="text-neutral-600 mb-6">Standard Package</p>
                      <Button
                        fullWidth
                        size="lg"
                        disabled={isSeller}
                        className="font-semibold py-3"
                        onClick={() => handleOrder({ name: 'standard', price: gig.price })}
                      >
                        Order Now
                      </Button>
                    </div>
                  )
                })()}
              </div>
            </Card>

            {/* Additional Info Card */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-neutral-900">Gig Information</h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Category</span>
                  <span className="font-medium text-neutral-900 capitalize">
                    {gig.category?.replace('-', ' ') || 'N/A'}
                  </span>
                </div>
                {gig.deliveryTime && (
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Delivery Time</span>
                    <span className="font-medium text-neutral-900">{gig.deliveryTime} days</span>
                  </div>
                )}
                {gig.orderCount > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Total Orders</span>
                    <span className="font-medium text-neutral-900">{gig.orderCount}</span>
                  </div>
                )}
                {gig.rating && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium text-neutral-900">{gig.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <Card className="max-w-md w-full transform transition-all animate-in fade-in zoom-in-95 mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-neutral-900">Confirm Your Order</h2>
              <p className="text-center text-sm sm:text-base text-neutral-600 mb-4 sm:mb-6">Please review your order details</p>
              
              <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Package:</span>
                  <span className="font-semibold text-neutral-900">{selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Price:</span>
                  <span className="text-xl font-bold text-primary-600">
                    PKR {selectedPackage?.price?.toLocaleString()}
                  </span>
                </div>
                {selectedPackage?.deliveryTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Delivery:</span>
                    <span className="font-semibold text-neutral-900">{selectedPackage.deliveryTime} days</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="secondary" 
                  fullWidth
                  onClick={() => setShowOrderModal(false)}
                  className="py-2.5 sm:py-3 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button 
                  fullWidth
                  onClick={handleConfirmOrder}
                  className="py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Payment Upload Modal */}
      {showPaymentModal && (
        <PaymentUploadModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderId={null}
          amount={selectedPackage?.price || gig.price}
        />
      )}
    </MainLayout>
  )
}
