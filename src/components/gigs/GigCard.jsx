import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import * as reviewService from '../../services/reviews'

function GigCard({ gig }) {
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [orderCount, setOrderCount] = useState(gig.orderCount || 0)
  
  const handleClick = useCallback(() => {
    navigate(`/gigs/${gig._id || gig.id}`)
  }, [navigate, gig._id, gig.id])
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])
  
  // Get the cover image or first image - memoized
  const displayImage = useMemo(() => {
    return gig.coverImage || (gig.images && gig.images.length > 0 ? gig.images[0] : null)
  }, [gig.coverImage, gig.images])
  
  // Get the lowest package price or base price - memoized
  const lowestPrice = useMemo(() => {
    if (gig.packages && gig.packages.length > 0) {
      const prices = gig.packages.map((pkg) => pkg.price).filter((p) => p > 0)
      return prices.length > 0 ? Math.min(...prices) : gig.price
    }
    return gig.price
  }, [gig.packages, gig.price])
  
  // Determine seller level badge - memoized
  const sellerLevel = useMemo(() => {
    const level = gig.seller?.level
    if (level === 'Expert' || level === 'Top Rated') {
      return { text: 'Top Rated', diamonds: 3 }
    } else if (level === 'Intermediate' || level === 'Level 2') {
      return { text: 'Level 2', diamonds: 2 }
    } else if (level === 'Beginner' || level === 'Level 1') {
      return { text: 'Level 1', diamonds: 1 }
    }
    return { text: level || 'Level 2', diamonds: 2 }
  }, [gig.seller?.level])
  
  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])
  
  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])
  
  // Fetch reviews and calculate average rating in real-time
  useEffect(() => {
    const gigId = gig._id || gig.id
    if (!gigId) return
    
    const fetchReviewData = async () => {
      try {
        const response = await reviewService.getReviewsByGigId(gigId)
        const avgRating = response.data?.averageRating || 0
        setAverageRating(avgRating)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    
    // Fetch immediately
    fetchReviewData()
    
    // Update order count from gig prop
    if (gig.orderCount !== undefined) {
      setOrderCount(gig.orderCount)
    }
    
    // Poll for updates every 3 seconds for real-time updates
    const interval = setInterval(() => {
      fetchReviewData()
      // Order count will be updated when gig prop changes
    }, 3000)
    
    return () => clearInterval(interval)
  }, [gig._id, gig.id, gig.orderCount])
  
  // Update order count when gig prop changes
  useEffect(() => {
    if (gig.orderCount !== undefined) {
      setOrderCount(gig.orderCount)
    }
  }, [gig.orderCount])
  
  return (
    <div
      className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-neutral-200"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View gig: ${gig.title}`}
    >
      {/* Cover Image - Prominent Background */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 min-h-[280px]">
        {displayImage ? (
          <>
            {/* Placeholder while loading */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse" />
            )}
            {/* Actual image with native lazy loading */}
            <img
              src={displayImage}
              alt={gig.title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              decoding="async"
              style={{ contentVisibility: 'auto' }}
            />
            {/* Error state */}
            {imageError && (
              <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                <span className="text-neutral-400 text-sm">Image failed to load</span>
              </div>
            )}
            {/* Heart icon for save/favorite (top right) */}
            <button
              className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Implement favorite functionality
              }}
              aria-label="Save gig"
            >
              <svg
                className="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200">
            <span className="text-neutral-400 text-sm">No Image</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Seller Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            src={gig.seller?.avatar}
            name={gig.seller?.name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-neutral-900 truncate">
              {gig.seller?.name || 'Seller'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-neutral-600">{sellerLevel.text}</span>
              {[...Array(sellerLevel.diamonds)].map((_, i) => (
                <svg
                  key={i}
                  className="w-3 h-3 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="font-semibold text-neutral-900 mb-4 line-clamp-2 min-h-[3.5rem] text-lg leading-snug">
          {gig.title}
        </h3>
        
        {/* Rating and Price */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-base">★</span>
            <span className="text-sm font-semibold text-neutral-900">
              {orderCount || 0}
            </span>
            <span className="text-sm font-semibold text-yellow-500">
              ({Math.round(averageRating) || 0})
            </span>
          </div>
          <div className="text-lg font-bold text-neutral-900">
            {lowestPrice ? (
              <>
                From <span className="text-primary-600">PKR {lowestPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-primary-600">PKR N/A</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize component with custom comparison for better performance
export default React.memo(GigCard, (prevProps, nextProps) => {
  // Only re-render if gig ID or critical data changes
  const prevId = prevProps.gig?._id || prevProps.gig?.id
  const nextId = nextProps.gig?._id || nextProps.gig?.id
  
  if (prevId !== nextId) return false
  
  // Check if critical fields changed
  return (
    prevProps.gig?.title === nextProps.gig?.title &&
    prevProps.gig?.coverImage === nextProps.gig?.coverImage &&
    prevProps.gig?.price === nextProps.gig?.price &&
    prevProps.gig?.rating === nextProps.gig?.rating &&
    prevProps.gig?.active === nextProps.gig?.active
  )
})

