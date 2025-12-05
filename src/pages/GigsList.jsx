import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import GigsFilterBar from '../components/gigs/GigsFilterBar'
import GigCard from '../components/gigs/GigCard'
import Skeleton from '../components/ui/Skeleton'
import * as gigService from '../services/gigs'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'

export default function GigsList() {
  const user = useAuthStore((state) => state.user)
  const isSeller = user?.role === 'freelancer'
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [visibleGigs, setVisibleGigs] = useState([])
  const isInitialLoadRef = useRef(true)
  const fetchingRef = useRef(false)
  const renderBatchRef = useRef(null)
  const BATCH_SIZE = 12 // Render 12 gigs at a time
  const BATCH_DELAY = 16 // ~60fps (16ms per frame)
  
  // Refresh when navigating to this page (e.g., after creating a gig)
  useEffect(() => {
    // Only fetch if we're on the /gigs or /seller-gigs route
    if (location.pathname !== '/gigs' && location.pathname !== '/seller-gigs') {
      return
    }
    
    // Reset initial load when navigating to this page or filters change
    isInitialLoadRef.current = true
    setLoading(true)
    setGigs([]) // Clear previous gigs to show loading state
    setVisibleGigs([]) // Clear visible gigs for progressive rendering
    
    // Reset fetching flag to allow new fetch
    fetchingRef.current = false
    
    // Reset page to 1 when filters change
    setPage(1)
    
    // Call fetchGigs
    const loadGigs = async () => {
      await fetchGigs()
    }
    loadGigs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, searchParams.toString(), user?.id, isSeller])
  
  // Refresh gigs when component becomes visible (only once, not continuously)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !fetchingRef.current && !isInitialLoadRef.current) {
        // Only refresh if page becomes visible and we're not already loading
        fetchGigs()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  const fetchGigs = async () => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      // console.log('⏸️ Fetch already in progress, skipping...')
      return
    }
    
    fetchingRef.current = true
    // console.log('🔄 Starting fetch, fetchingRef set to true')
    
    // Show loading spinner only on initial load
    if (isInitialLoadRef.current) {
      setLoading(true)
    }
    
    // Determine if this is seller-gigs route (sellers viewing their own gigs)
    const isSellerGigsRoute = location.pathname === '/seller-gigs'
    
    // console.log('🔄 Fetching gigs...', { isSeller, isSellerGigsRoute, userId: user?.id })
    
    try {
      let response = null
      
      // For sellers on /seller-gigs route: Get only their own gigs (requires auth)
      // For clients on /gigs route: Get all gigs (no auth required)
      // For sellers on /gigs route: Get all gigs (browse mode, no auth required)
      if (isSeller && isSellerGigsRoute) {
        // Get user ID - handle both _id (MongoDB) and id formats
        const userId = user?._id || user?.id
        
        if (!userId) {
          toast.error('User ID not found. Please login again.')
          setLoading(false)
          fetchingRef.current = false
          return
        }
        
        // For sellers: Get only their own gigs
        const params = {
          sellerId: userId.toString(),
          page,
        }
        // console.log('📤 Fetching seller gigs with params:', params)
        response = await gigService.getAllGigs(params)
      } else {
        // For clients: Get all gigs with filters
        const params = {
          q: searchParams.get('q'),
          category: searchParams.get('category'),
          minPrice: searchParams.get('minPrice'),
          maxPrice: searchParams.get('maxPrice'),
          sort: searchParams.get('sort') || 'newest',
          deliveryTime: searchParams.get('deliveryTime'),
          level: searchParams.get('level'),
          page,
        }
        
        // Remove undefined/empty params
        Object.keys(params).forEach((key) => {
          if (!params[key] || params[key] === '') delete params[key]
        })
        
        // Map sort values to backend format
        if (params.sort) {
          const sortMap = {
            'best': 'newest',
            'newest': 'newest',
            'price_asc': 'price-asc',
            'price_desc': 'price-desc',
            'rating': 'rating'
          }
          params.sort = sortMap[params.sort] || params.sort
        }
        
        // console.log('📤 Fetching all gigs with params:', params)
        response = await gigService.getAllGigs(params)
      }
      
      // Extract gigs from response - optimized parsing
      let fetchedGigs = []
      
      // Log response for debugging
      console.log('📦 API Response:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        hasGigs: !!response?.data?.gigs,
        success: response?.success,
        responseKeys: response ? Object.keys(response) : [],
        dataKeys: response?.data ? Object.keys(response.data) : []
      })
      
      // Check if response indicates failure
      if (response?.success === false) {
        console.warn('⚠️ API returned success: false', response)
        // Even on failure, try to extract gigs if available
        if (response?.data?.gigs && Array.isArray(response.data.gigs)) {
          fetchedGigs = response.data.gigs
        }
      } else {
        // Backend returns: { success: true, data: { gigs: [...], pagination: {...} } }
        // Optimized: check most common path first
        if (response?.data?.gigs && Array.isArray(response.data.gigs)) {
          fetchedGigs = response.data.gigs
        } else if (response?.data && Array.isArray(response.data) && !response.data.gigs) {
          fetchedGigs = response.data
        } else if (Array.isArray(response)) {
          fetchedGigs = response
        } else if (response?.gigs && Array.isArray(response.gigs)) {
          fetchedGigs = response.gigs
        }
      }
      
      console.log('✅ Final fetched gigs count:', fetchedGigs.length)
      
      // Always update state with fetched data
      if (Array.isArray(fetchedGigs)) {
        // Set gigs (even if empty)
        setGigs(fetchedGigs)
        
        if (fetchedGigs.length > 0) {
          // Progressive rendering - render in batches for better performance
          setVisibleGigs([]) // Reset visible gigs
          renderGigsProgressively(fetchedGigs)
        } else {
          // Empty array - clear visible gigs
          setVisibleGigs([])
        }
        
        // ALWAYS set loading to false - do it immediately
        setLoading(false)
        isInitialLoadRef.current = false
        
        // Update pagination if available
        if (response?.data?.pagination) {
          setHasMore(response.data.pagination.hasMore || false)
        } else if (response?.pagination) {
          setHasMore(response.pagination.hasMore || false)
        }
      } else {
        // If response structure is unexpected, log and set empty array
        console.warn('⚠️ Unexpected response structure - not an array:', response)
        setGigs([])
        setVisibleGigs([])
        setLoading(false)
        isInitialLoadRef.current = false
      }
    } catch (error) {
      console.error('❌ Error fetching gigs:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })
      // Show error message
      if (isInitialLoadRef.current) {
        toast.error(error.message || 'Failed to fetch gigs. Please check if the server is running.')
        setGigs([])
        setLoading(false)
      } else {
        // On subsequent errors, show a less intrusive message
        console.warn('Failed to refresh gigs:', error.message)
        // Don't clear existing gigs on refresh errors
      }
      isInitialLoadRef.current = false
      fetchingRef.current = false
    } finally {
      // Always reset fetching flag
      fetchingRef.current = false
      // Ensure loading is false
      if (isInitialLoadRef.current) {
        setLoading(false)
      }
    }
  }
  
  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1)
    // In real app, append to existing gigs
  }, [])
  
  // Progressive rendering function - renders gigs in batches
  const renderGigsProgressively = useCallback((allGigs) => {
    // Clear any existing batch render
    if (renderBatchRef.current) {
      cancelAnimationFrame(renderBatchRef.current)
    }
    
    // Start with first batch immediately for instant feedback
    const firstBatch = allGigs.slice(0, BATCH_SIZE)
    setVisibleGigs(firstBatch)
    
    if (allGigs.length <= BATCH_SIZE) {
      return // All gigs rendered
    }
    
    // Use ref to track current index across renders
    const currentIndexRef = { current: BATCH_SIZE }
    
    const renderBatch = () => {
      const startIndex = currentIndexRef.current
      const endIndex = Math.min(startIndex + BATCH_SIZE, allGigs.length)
      const batch = allGigs.slice(0, endIndex)
      
      setVisibleGigs(batch)
      currentIndexRef.current = endIndex
      
      if (endIndex < allGigs.length) {
        // Schedule next batch
        renderBatchRef.current = requestAnimationFrame(renderBatch)
      } else {
        renderBatchRef.current = null
      }
    }
    
    // Schedule next batch
    renderBatchRef.current = requestAnimationFrame(renderBatch)
  }, [])
  
  // Update visible gigs when gigs change
  useEffect(() => {
    if (gigs.length > 0) {
      if (visibleGigs.length === 0 || visibleGigs.length !== gigs.length) {
        renderGigsProgressively(gigs)
      }
    } else {
      setVisibleGigs([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gigs.length])
  
  // Memoize filtered gigs with valid IDs
  const validGigs = useMemo(() => {
    return visibleGigs.filter((gig) => {
      const gigId = gig._id || gig.id
      return !!gigId
    })
  }, [visibleGigs])
  
  // Determine if this is seller-gigs route
  const isSellerGigsRoute = location.pathname === '/seller-gigs'
  
  return (
    <MainLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          {isSellerGigsRoute ? 'My Gigs' : 'Browse Gigs'}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          {isSellerGigsRoute 
            ? 'Manage and view all your created gigs' 
            : 'Discover amazing services from talented freelancers'}
        </p>
      </div>
      
      {/* Only show filters for clients on /gigs route, not for sellers on /seller-gigs */}
      {!isSellerGigsRoute && <GigsFilterBar />}
      
      {/* Debug info - commented out for production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <div>Debug: Loading={loading.toString()}, Gigs={gigs.length}, isSeller={isSeller.toString()}</div>
          {gigs.length > 0 && (
            <div className="mt-1">Sample: {gigs[0]?.title} (ID: {gigs[0]?._id || gigs[0]?.id})</div>
          )}
        </div>
      )} */}
      
      {/* Show gigs if we have them, regardless of loading state */}
      {gigs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {validGigs.map((gig) => {
              const gigId = gig._id || gig.id
              return <GigCard key={gigId} gig={gig} />
            })}
            {/* Show skeletons for remaining gigs that haven't rendered yet */}
            {visibleGigs.length < gigs.length && (
              <>
                {Array.from({ length: Math.min(BATCH_SIZE, gigs.length - visibleGigs.length) }).map((_, i) => (
                  <Skeleton key={`skeleton-${i}`} variant="rectangular" height="400px" />
                ))}
              </>
            )}
          </div>
          
          {!isSeller && hasMore && (
            <div className="text-center mt-8 sm:mt-12">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Load More Gigs
              </button>
            </div>
          )}
        </>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="300px" />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl sm:text-7xl mb-4">
              {isSeller ? '🎯' : '🔍'}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
              {isSeller ? 'No gigs created yet' : 'No gigs found'}
            </h3>
            <p className="text-base sm:text-lg text-neutral-600 mb-4">
              {isSeller 
                ? 'Start creating your first gig to showcase your services' 
                : 'Try adjusting your filters or search terms'}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-500 mt-2">
                Check console for API response details
              </p>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}
