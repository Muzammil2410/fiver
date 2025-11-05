import React, { useState, useEffect } from 'react'
import Avatar from '../ui/Avatar'
import localStorageService from '../../utils/localStorage'

export default function ReviewList({ gigId }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  
  useEffect(() => {
    fetchReviews()
  }, [gigId])
  
  const fetchReviews = async () => {
    try {
      const response = await localStorageService.reviews.getByGigId(gigId)
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
    <div className="space-y-4">
      {averageRating > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          <div className="flex">{renderStars(Math.round(averageRating))}</div>
          <span className="text-neutral-600">({reviews.length} reviews)</span>
        </div>
      )}
      
      {reviews.length === 0 ? (
        <p className="text-neutral-600">No reviews yet</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border-b border-neutral-200 pb-4">
            <div className="flex gap-4">
              <Avatar
                src={review.reviewerAvatar}
                name={review.reviewerName}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{review.reviewerName}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-neutral-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-700">{review.comment}</p>
                {review.sellerResponse && (
                  <div className="mt-3 pl-4 border-l-2 border-primary-200">
                    <p className="text-sm font-medium text-neutral-600 mb-1">
                      Seller Response:
                    </p>
                    <p className="text-neutral-700">{review.sellerResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

