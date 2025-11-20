import React, { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import GigDetailsModal from '../components/gigs/GigDetailsModal'
import PriceRangeInputs from '../components/gigs/PriceRangeInputs'
import Input from '../components/ui/Input'
import * as gigService from '../services/gigs'
import Skeleton from '../components/ui/Skeleton'
import { toast } from '../utils/toast'

export default function Marketplace() {
  const [gigs, setGigs] = useState([])
  const [filteredGigs, setFilteredGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGig, setSelectedGig] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedNiche, setSelectedNiche] = useState('')

  // Get all unique niches/tags
  const allNiches = Array.from(
    new Set(ALL_GIGS.flatMap(gig => gig.tags || []))
  ).sort()

  useEffect(() => {
    loadGigs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [gigs, search, minPrice, maxPrice, selectedNiche])

  const loadGigs = async () => {
    setLoading(true)
    try {
      const response = await gigService.getAllGigs()
      const data = response.data.gigs || []
      setGigs(data)
      setFilteredGigs(data)
    } catch (error) {
      console.error('Error loading gigs:', error)
      toast.error(error.message || 'Failed to load gigs')
      setGigs([])
      setFilteredGigs([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...gigs]

    // Search filter
    if (search) {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        (gig) =>
          gig.title.toLowerCase().includes(query) ||
          gig.description?.toLowerCase().includes(query) ||
          gig.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Price filters
    if (minPrice) {
      const min = parseFloat(minPrice)
      if (!isNaN(min)) {
        filtered = filtered.filter((gig) => gig.price >= min)
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice)
      if (!isNaN(max)) {
        filtered = filtered.filter((gig) => gig.price <= max)
      }
    }

    // Niche filter
    if (selectedNiche) {
      filtered = filtered.filter((gig) =>
        gig.tags?.includes(selectedNiche)
      )
    }

    setFilteredGigs(filtered)
  }

  const handleGigClick = (gig) => {
    setSelectedGig(gig)
    setShowDetailsModal(true)
  }

  // Custom GigCard that opens modal instead of navigating
  const MarketplaceGigCard = ({ gig }) => {
    return (
      <div
        className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-neutral-200"
        onClick={() => handleGigClick(gig)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleGigClick(gig)
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View gig: ${gig.title}`}
      >
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 min-h-[280px]">
          {gig.image || gig.coverImage ? (
            <img
              src={gig.image || gig.coverImage}
              alt={gig.title}
              className="w-full h-full object-cover"
            />
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
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
              <span className="text-sm font-medium text-neutral-600">
                {gig.seller?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-neutral-900 truncate">
                {gig.seller?.name || 'Seller'}
              </p>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-neutral-900 mb-4 line-clamp-2 min-h-[3.5rem] text-lg leading-snug">
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
                </>
              ) : (
                <span className="text-xs text-neutral-500">No reviews yet</span>
              )}
            </div>
            <div className="text-lg font-bold text-neutral-900">
              <span className="text-primary-600">PKR {gig.price?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Search
            </label>
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gigs..."
            />
          </div>

          {/* Price Range */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Price Range
            </label>
            <PriceRangeInputs
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
          </div>

          {/* Niche Dropdown */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Niche / Tags
            </label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Niches</option>
              {allNiches.map((niche) => (
                <option key={niche} value={niche}>
                  {niche}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-neutral-600">
        Showing {filteredGigs.length} of {gigs.length} gigs
      </div>

      {/* Gigs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="300px" />
          ))}
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">No gigs found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGigs.map((gig) => (
            <MarketplaceGigCard key={gig._id || gig.id} gig={gig} />
          ))}
        </div>
      )}

      {/* Gig Details Modal */}
      <GigDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedGig(null)
        }}
        gig={selectedGig}
      />
    </MainLayout>
  )
}

