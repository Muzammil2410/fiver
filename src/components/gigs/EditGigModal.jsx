import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { cropImageForFace } from '../../utils/imageCropper'
import { toast } from '../../utils/toast'

export default function EditGigModal({ isOpen, onClose, gig, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    tags: '',
    image: '',
  })
  const [processingImage, setProcessingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    if (gig) {
      setFormData({
        title: gig.title || '',
        description: gig.description || '',
        price: gig.price || '',
        tags: gig.tags ? gig.tags.join(', ') : '',
        image: gig.image || gig.coverImage || '',
      })
    }
  }, [gig])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please upload a valid image file')
        return
      }
      
      setProcessingImage(true)
      setImageError('')
      
      try {
        // Read file and process with face detection
        const reader = new FileReader()
        reader.onloadend = async (event) => {
          try {
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
              setImageError(`Image is still too large (${sizeInMB.toFixed(2)} MB) after processing. Please use a smaller image.`)
              setProcessingImage(false)
              return
            }
            
            setFormData(prev => ({
              ...prev,
              image: croppedImage,
            }))
            setImageError('')
            toast.success('Image processed successfully! Face is now properly visible.')
          } catch (err) {
            console.error('Image processing error:', err)
            setImageError('Failed to process image: ' + err.message)
          } finally {
            setProcessingImage(false)
          }
        }
        reader.onerror = () => {
          setImageError('Failed to read image file')
          setProcessingImage(false)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        setImageError('Failed to process image: ' + error.message)
        setProcessingImage(false)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedGig = {
      ...gig,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      image: formData.image,
      coverImage: formData.image,
    }
    onSave(updatedGig)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Gig"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />

        {/* Price */}
        <Input
          label="Price (PKR)"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />

        {/* Tags */}
        <Input
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., logo, design, branding"
        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Image
          </label>
          <div className="space-y-2">
            {formData.image && (
              <div className="w-full h-32 rounded-lg overflow-hidden bg-neutral-100">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={processingImage}
              className="block w-full text-sm text-neutral-700
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {processingImage && (
              <p className="text-xs text-primary-600">
                Processing image and detecting face...
              </p>
            )}
            {imageError && (
              <p className="text-xs text-danger-600">
                {imageError}
              </p>
            )}
            {!processingImage && !imageError && (
              <p className="text-xs text-neutral-500">
                Upload a new image. Face will be automatically detected and cropped for optimal visibility.
              </p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}

