import React from 'react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function SellerGigRow({ gig, onEdit, onDelete, onToggleActive }) {
  const displayImage = gig.image || gig.coverImage || (gig.images && gig.images.length > 0 ? gig.images[0] : null)

  return (
    <tr className="border-b border-neutral-200 hover:bg-neutral-50">
      {/* Thumbnail */}
      <td className="px-4 py-3">
        <div className="w-16 h-16 rounded overflow-hidden bg-neutral-100">
          {displayImage ? (
            <img
              src={displayImage}
              alt={gig.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
              No Image
            </div>
          )}
        </div>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <div className="max-w-xs">
          <h3 className="font-semibold text-neutral-900 truncate">{gig.title}</h3>
          {gig.tags && gig.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {gig.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="text-xs text-neutral-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <span className="font-semibold text-primary-600">
          PKR {gig.price?.toLocaleString() || '0'}
        </span>
      </td>

      {/* Rating */}
      <td className="px-4 py-3">
        {gig.rating ? (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-medium">{gig.rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-500">({gig.reviewCount || 0})</span>
          </div>
        ) : (
          <span className="text-xs text-neutral-500">No reviews</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge variant={gig.active ? 'success' : 'default'}>
          {gig.active ? 'Active' : 'Inactive'}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Toggle Active/Inactive */}
          <button
            onClick={() => onToggleActive(gig.id)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              gig.active
                ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                : 'bg-success-100 text-success-700 hover:bg-success-200'
            }`}
            title={gig.active ? 'Unpublish' : 'Publish'}
          >
            {gig.active ? 'Unpublish' : 'Publish'}
          </button>

          {/* Edit Button */}
          <Button
            variant="secondary"
            className="text-xs px-2 py-1"
            onClick={() => onEdit(gig)}
          >
            Edit
          </Button>

          {/* Delete Button */}
          <Button
            variant="danger"
            className="text-xs px-2 py-1"
            onClick={() => onDelete(gig.id)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  )
}

