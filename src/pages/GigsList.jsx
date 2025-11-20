import React, { useState, useEffect, useRef } from 'react'
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
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const isInitialLoadRef = useRef(true)
  const fetchingRef = useRef(false)
  
  // Refresh when navigating to this page (e.g., after creating a gig)
  useEffect(() => {
    // Only fetch if we're on the /gigs route
    if (location.pathname !== '/gigs') {
      return
    }
    
    // Reset initial load when navigating to this page
    console.log('🔄 useEffect triggered, resetting and fetching gigs')
    isInitialLoadRef.current = true
    setLoading(true)
    setGigs([]) // Clear previous gigs to show loading state
    
    // Reset fetching flag to allow new fetch
    fetchingRef.current = false
    
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
      console.log('⏸️ Fetch already in progress, skipping...')
      return
    }
    
    fetchingRef.current = true
    console.log('🔄 Starting fetch, fetchingRef set to true')
    
    // Show loading spinner only on initial load
    if (isInitialLoadRef.current) {
      setLoading(true)
    }
    
    console.log('🔄 Fetching gigs...', { isSeller, userId: user?.id })
    
    try {
      let response = null
      
      if (isSeller) {
        // For sellers: Get only their own gigs
        const params = {
          sellerId: user?.id,
          page,
        }
        console.log('📤 Fetching seller gigs with params:', params)
        response = await gigService.getAllGigs(params)
      } else {
        // For clients: Get all gigs with filters
        const params = {
          q: searchParams.get('q'),
          category: searchParams.get('category'),
          minPrice: searchParams.get('minPrice'),
          maxPrice: searchParams.get('maxPrice'),
          sort: searchParams.get('sort') || 'newest', // Backend maps 'newest' to 'createdAt'
          deliveryTime: searchParams.get('deliveryTime'),
          page,
        }
        
        // Remove undefined params
        Object.keys(params).forEach((key) => {
          if (!params[key]) delete params[key]
        })
        
        console.log('📤 Fetching all gigs with params:', params)
        response = await gigService.getAllGigs(params)
      }
      
      console.log('📥 Raw API response:', response)
      
      // Extract gigs from response - handle different response structures
      let fetchedGigs = []
      
      // Backend returns: { success: true, data: { gigs: [...], pagination: {...} } }
      // Try multiple paths to extract gigs
      if (response?.success === true && response?.data?.gigs && Array.isArray(response.data.gigs)) {
        fetchedGigs = response.data.gigs
        console.log('✅ Found gigs in response.data.gigs (with success):', fetchedGigs.length)
      } else if (response?.data?.gigs && Array.isArray(response.data.gigs)) {
        fetchedGigs = response.data.gigs
        console.log('✅ Found gigs in response.data.gigs (no success flag):', fetchedGigs.length)
      } else if (response?.data && Array.isArray(response.data) && !response.data.gigs) {
        // Response.data is directly an array
        fetchedGigs = response.data
        console.log('✅ Found gigs as direct array in response.data:', fetchedGigs.length)
      } else if (Array.isArray(response)) {
        fetchedGigs = response
        console.log('✅ Found gigs as direct array:', fetchedGigs.length)
      } else if (response?.gigs && Array.isArray(response.gigs)) {
        fetchedGigs = response.gigs
        console.log('✅ Found gigs in response.gigs:', fetchedGigs.length)
      } else {
        console.warn('⚠️ No gigs found in response. Response structure:', {
          hasSuccess: !!response?.success,
          hasData: !!response?.data,
          hasDataGigs: !!response?.data?.gigs,
          isDataArray: Array.isArray(response?.data),
          isResponseArray: Array.isArray(response),
          responseKeys: response ? Object.keys(response) : 'null',
          fullResponse: response
        })
      }
      
      console.log('✅ Final fetched gigs count:', fetchedGigs.length)
      
      // Always update state with fetched data
      if (Array.isArray(fetchedGigs) && fetchedGigs.length > 0) {
        console.log('✅ Setting gigs state with', fetchedGigs.length, 'gigs')
        console.log('✅ Sample gig data:', fetchedGigs[0])
        
        // Set gigs first
        setGigs(fetchedGigs)
        
        // ALWAYS set loading to false when we have gigs - do it immediately
        console.log('✅ Setting loading to false (have gigs)')
        setLoading(false)
        isInitialLoadRef.current = false
        
        // Update pagination if available
        if (response?.data?.pagination) {
          setHasMore(response.data.pagination.hasMore || false)
        } else if (response?.pagination) {
          setHasMore(response.pagination.hasMore || false)
        }
      } else if (Array.isArray(fetchedGigs)) {
        // Empty array
        console.log('⚠️ Fetched empty array of gigs')
        setGigs([])
        setLoading(false)
        isInitialLoadRef.current = false
      } else {
        // If response structure is unexpected, log and set empty array
        console.warn('⚠️ Unexpected response structure - not an array:', response)
        setGigs([])
        setLoading(false)
        isInitialLoadRef.current = false
      }
    } catch (error) {
      console.error('❌ Error fetching gigs:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      // Show error message
      if (isInitialLoadRef.current) {
        toast.error(error.message || 'Failed to fetch gigs. Please check if the server is running.')
        setGigs([])
      } else {
        // On subsequent errors, show a less intrusive message
        console.warn('Failed to refresh gigs:', error.message)
        // Don't clear existing gigs on refresh errors
      }
      isInitialLoadRef.current = false
    } finally {
      // Always reset fetching flag
      fetchingRef.current = false
      // Loading state is now managed in the try block after setting gigs
    }
  }
  
  const handleLoadMore = () => {
    setPage((p) => p + 1)
    // In real app, append to existing gigs
  }
  
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        {isSeller ? 'Your Gigs' : 'Browse Gigs'}
      </h1>
      
      {/* Only show filters for clients, not sellers */}
      {!isSeller && <GigsFilterBar />}
      
      {/* Debug info - can be removed in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <div>Debug: Loading={loading.toString()}, Gigs={gigs.length}, isSeller={isSeller.toString()}</div>
          {gigs.length > 0 && (
            <div className="mt-1">Sample: {gigs[0]?.title} (ID: {gigs[0]?._id || gigs[0]?.id})</div>
          )}
        </div>
      )}
      
      {/* Show gigs if we have them, regardless of loading state */}
      {gigs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {gigs.map((gig, index) => {
              const gigId = gig._id || gig.id
              if (!gigId) {
                console.warn('⚠️ Gig missing ID at index', index, ':', gig)
                return null
              }
              if (index < 3) {
                console.log(`🎨 Rendering gig ${index + 1}/${gigs.length}:`, gigId, gig.title?.substring(0, 50))
              }
              return (
                <GigCard key={gigId} gig={gig} />
              )
            })}
          </div>
          
          {!isSeller && hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Load More
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
        <div className="text-center py-12">
          <p className="text-neutral-600">
            {isSeller ? 'You haven\'t created any gigs yet.' : 'No gigs found. Try adjusting your filters.'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-2">
              Check console for API response details
            </p>
          )}
        </div>
      )}
    </MainLayout>
  )
}
