import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import GigCard from '../components/gigs/GigCard'
import EditGigModal from '../components/gigs/EditGigModal'
import * as gigService from '../services/gigs'
import { useAuthStore } from '../store/useAuthStore'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { toast } from '../utils/toast'

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingGig, setEditingGig] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadGigs()
  }, [user])

  const loadGigs = async () => {
    setLoading(true)
    try {
      // Get only current seller's gigs from API
      const response = await gigService.getAllGigs({ sellerId: user?.id })
      setGigs(response.data.gigs || [])
    } catch (error) {
      console.error('Error loading gigs:', error)
      toast.error(error.message || 'Failed to load gigs')
      setGigs([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (gig, e) => {
    e?.stopPropagation()
    e?.preventDefault()
    setEditingGig(gig)
    setShowEditModal(true)
  }

  const handleSave = async (updatedGig) => {
    try {
      const gigId = updatedGig._id || updatedGig.id
      // Remove _id from update data if present (MongoDB doesn't allow updating _id)
      const { _id, id, ...updateData } = updatedGig
      await gigService.updateGig(gigId, updateData)
      toast.success('Gig updated successfully!')
      await loadGigs()
      setShowEditModal(false)
      setEditingGig(null)
    } catch (error) {
      console.error('Error saving gig:', error)
      toast.error(error.message || 'Failed to update gig')
    }
  }

  const handleDelete = async (gigId, e) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await gigService.deleteGig(gigId)
        toast.success('Gig deleted successfully!')
        await loadGigs()
      } catch (error) {
        console.error('Error deleting gig:', error)
        toast.error(error.message || 'Failed to delete gig')
      }
    }
  }

  const handleToggleActive = async (gigId, e) => {
    e?.stopPropagation()
    e?.preventDefault()
    try {
      await gigService.toggleGigStatus(gigId)
      toast.success('Gig status updated!')
      await loadGigs()
    } catch (error) {
      console.error('Error toggling gig status:', error)
      toast.error(error.message || 'Failed to update gig status')
    }
  }

  // Custom GigCard with seller controls overlay
  const SellerGigCard = ({ gig }) => {
    return (
      <div className="relative group">
        <GigCard gig={gig} />
        {/* Seller Controls Overlay */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            className="px-2 py-1 text-xs bg-white text-neutral-900 rounded-md shadow-md hover:bg-neutral-100 transition-colors"
            onClick={(e) => handleEdit(gig, e)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-xs bg-white text-danger-600 rounded-md shadow-md hover:bg-danger-50 transition-colors"
            onClick={(e) => handleDelete(gig._id || gig.id, e)}
          >
            Delete
          </button>
          <button
            className={`px-2 py-1 text-xs bg-white rounded-md shadow-md transition-colors ${
              gig.active
                ? 'text-warning-600 hover:bg-warning-50'
                : 'text-primary-600 hover:bg-primary-50'
            }`}
            onClick={(e) => handleToggleActive(gig._id || gig.id, e)}
          >
            {gig.active ? 'Unpublish' : 'Publish'}
          </button>
        </div>
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              gig.active
                ? 'bg-success-100 text-success-700'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            {gig.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Gigs</h1>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-neutral-600">
        {gigs.length === 0 
          ? 'No gigs created yet' 
          : `Showing ${gigs.length} ${gigs.length === 1 ? 'gig' : 'gigs'}`}
      </div>

      {/* Gigs Grid - Same layout as Browse Gigs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="300px" />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-neutral-600 text-lg mb-4">You haven't created any gigs yet.</p>
          <p className="text-neutral-500 mb-4">Create your first gig to get started!</p>
          <Button onClick={() => navigate('/create-gig')}>
            Create Your First Gig
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <SellerGigCard key={gig._id || gig.id} gig={gig} />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditGigModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingGig(null)
        }}
        gig={editingGig}
        onSave={handleSave}
      />
    </MainLayout>
  )
}
