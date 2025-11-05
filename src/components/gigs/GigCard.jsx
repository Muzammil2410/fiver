import React from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

export default function GigCard({ gig }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate(`/gigs/${gig.id}`)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  
  // Get the cover image or first image
  const displayImage = gig.coverImage || (gig.images && gig.images.length > 0 ? gig.images[0] : null)
  
  // Get the lowest package price or base price
  const getLowestPrice = () => {
    if (gig.packages && gig.packages.length > 0) {
      const prices = gig.packages.map((pkg) => pkg.price).filter((p) => p > 0)
      return prices.length > 0 ? Math.min(...prices) : gig.price
    }
    return gig.price
  }
  
  const lowestPrice = getLowestPrice()
  
  // Determine seller level badge
  const getSellerLevel = () => {
    const level = gig.seller?.level
    if (level === 'Expert' || level === 'Top Rated') {
      return { text: 'Top Rated', diamonds: 3 }
    } else if (level === 'Intermediate' || level === 'Level 2') {
      return { text: 'Level 2', diamonds: 2 }
    } else if (level === 'Beginner' || level === 'Level 1') {
      return { text: 'Level 1', diamonds: 1 }
    }
    return { text: level || 'Level 2', diamonds: 2 }
  }
  
  const sellerLevel = getSellerLevel()
  
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
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={gig.title}
              className="w-full h-full object-cover"
            />
            {/* Heart icon for save/favorite (top right) */}
            <button
              className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
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
      <div className="p-4">
        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar
            src={gig.seller?.avatar}
            name={gig.seller?.name}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
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
        <h3 className="font-semibold text-neutral-900 mb-3 line-clamp-2 min-h-[3rem] text-base leading-snug">
          {gig.title}
        </h3>
        
        {/* Rating and Price */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1">
            {gig.rating ? (
              <>
                <span className="text-yellow-500 text-base">★</span>
                <span className="text-sm font-semibold text-neutral-900">
                  {gig.rating.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-500">
                  ({gig.reviewCount || 0})
                </span>
              </>
            ) : (
              <span className="text-xs text-neutral-500">No reviews yet</span>
            )}
          </div>
          <div className="text-base font-bold text-neutral-900">
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

