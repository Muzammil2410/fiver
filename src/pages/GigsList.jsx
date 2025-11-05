import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import GigsFilterBar from '../components/gigs/GigsFilterBar'
import GigCard from '../components/gigs/GigCard'
import Skeleton from '../components/ui/Skeleton'
import localStorageService from '../utils/localStorage'

export default function GigsList() {
  const [searchParams] = useSearchParams()
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  useEffect(() => {
    fetchGigs()
  }, [searchParams])
  
  const fetchGigs = async () => {
    setLoading(true)
    try {
      const params = {
        q: searchParams.get('q'),
        category: searchParams.get('category'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        sort: searchParams.get('sort') || 'best',
        deliveryTime: searchParams.get('deliveryTime'),
        level: searchParams.get('level'),
        page,
      }
      
      // Remove undefined params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key]
      })
      
      const response = await localStorageService.gigs.getAll(params)
      setGigs(response.data.gigs || [])
      setHasMore(response.data.hasMore || false)
    } catch (error) {
      console.error('Error fetching gigs:', error)
      setGigs([])
    } finally {
      setLoading(false)
    }
  }
  
  const handleLoadMore = () => {
    setPage((p) => p + 1)
    // In real app, append to existing gigs
  }
  
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Browse Gigs</h1>
      
      <GigsFilterBar />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="300px" />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">No gigs found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
          
          {hasMore && (
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
      )}
    </MainLayout>
  )
}

