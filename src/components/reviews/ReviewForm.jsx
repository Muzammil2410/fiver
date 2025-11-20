import React, { useState } from 'react'
import Button from '../ui/Button'
import Textarea from '../ui/Textarea'
import * as reviewService from '../../services/reviews'
import { toast } from '../../utils/toast'

export default function ReviewForm({ orderId, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    setLoading(true)
    
    try {
      await reviewService.createReview(orderId, {
        rating,
        comment,
        isPublic,
      })
      
      toast.success('Review submitted successfully!')
      onSuccess()
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Rating *
        </label>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Rating"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setRating(star)
                }
              }}
              className="text-3xl focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <span
                className={
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-500'
                    : 'text-neutral-300'
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <Textarea
        label="Review Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={4}
      />
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="isPublic" className="text-sm text-neutral-700">
          Make this review public
        </label>
      </div>
      
      <Button type="submit" loading={loading} disabled={rating === 0}>
        Submit Review
      </Button>
    </form>
  )
}

