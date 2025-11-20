import React, { useState, useEffect } from 'react'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'
import * as reviewService from '../../services/reviews'

export default function ReviewList({ gigId }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  
  useEffect(() => {
    fetchReviews()
    // Real-time polling every 2 seconds to update reviews
    const interval = setInterval(() => {
      fetchReviews()
    }, 2000)
    
    return () => clearInterval(interval)
  }, [gigId])
  
  const fetchReviews = async () => {
    try {
      const response = await reviewService.getReviewsByGigId(gigId)
      setReviews(response.data.reviews || [])
      setAverageRating(response.data.averageRating || 0)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }
  
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-500' : 'text-neutral-300'}
      >
        ★
      </span>
    ))
  }
  
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-neutral-200">
          <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
          <div className="flex text-xl">{renderStars(Math.round(averageRating))}</div>
          <span className="text-neutral-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
        </div>
      )}
      
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-neutral-600 font-medium">No reviews yet</p>
          <p className="text-sm text-neutral-500 mt-2">Be the first to review this service</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-b-0">
              <div className="flex gap-4">
                <Avatar
                  src={review.reviewerAvatar}
                  name={review.reviewerName}
                  size="md"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{review.reviewerName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-500">{renderStars(review.rating)}</div>
                        <span className="text-sm text-neutral-600">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-neutral-700 mt-3 leading-relaxed">{review.comment}</p>
                  )}
                  {review.sellerResponse && (
                    <div className="mt-4 pl-4 border-l-4 border-primary-300 bg-primary-50 rounded-r-lg p-3">
                      <p className="text-sm font-semibold text-primary-700 mb-1">
                        Seller Response:
                      </p>
                      <p className="text-neutral-700">{review.sellerResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

