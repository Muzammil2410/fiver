import React from 'react'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

export default function GigDetailsModal({ isOpen, onClose, gig }) {
  if (!gig) return null

  const displayImage = gig.image || gig.coverImage || (gig.images && gig.images.length > 0 ? gig.images[0] : null)
  const lowestPrice = gig.price || (gig.packages && gig.packages.length > 0 
    ? Math.min(...gig.packages.map(p => p.price).filter(p => p > 0))
    : 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={gig.title}
      size="xl"
    >
      <div className="space-y-6">
        {/* Image */}
        {displayImage && (
          <div className="w-full h-64 rounded-lg overflow-hidden bg-neutral-100">
            <img
              src={displayImage}
              alt={gig.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Seller Info */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
          <Avatar
            src={gig.seller?.avatar}
            name={gig.seller?.name}
            size="lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{gig.seller?.name || 'Seller'}</h3>
            <p className="text-sm text-neutral-600">{gig.seller?.title || 'Freelancer'}</p>
            {gig.seller?.level && (
              <Badge variant="primary" size="sm" className="mt-1">
                {gig.seller.level}
              </Badge>
            )}
          </div>
        </div>

        {/* Rating and Price */}
        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
          <div className="flex items-center gap-2">
            {gig.rating ? (
              <>
                <span className="text-yellow-500 text-xl">★</span>
                <span className="font-semibold text-lg">{gig.rating.toFixed(1)}</span>
                <span className="text-sm text-neutral-600">
                  ({gig.reviewCount || 0} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-neutral-500">No reviews yet</span>
            )}
          </div>
          <div className="text-2xl font-bold text-primary-600">
            PKR {lowestPrice.toLocaleString()}
          </div>
        </div>

        {/* Tags/Niche */}
        {gig.tags && gig.tags.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Tags / Niche</h4>
            <div className="flex flex-wrap gap-2">
              {gig.tags.map((tag, idx) => (
                <Badge key={idx} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-neutral-700 whitespace-pre-line">
            {gig.description || 'No description available.'}
          </p>
        </div>

        {/* Packages */}
        {gig.packages && gig.packages.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Packages</h4>
            <div className="space-y-2">
              {gig.packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-neutral-200 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-semibold">{pkg.name}</h5>
                    <span className="font-bold text-primary-600">
                      PKR {pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{pkg.description}</p>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Delivery: {pkg.deliveryTime} days</p>
                    <p>Revisions: {pkg.revisions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {gig.requirements && gig.requirements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Requirements</h4>
            <ul className="list-disc list-inside space-y-1 text-neutral-700">
              {gig.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {gig.skills && gig.skills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {gig.skills.map((skill, idx) => (
                <Badge key={idx} variant="default" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

