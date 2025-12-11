import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import GigCard from '../components/gigs/GigCard'
import Skeleton from '../components/ui/Skeleton'
import * as gigService from '../services/gigs'

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredGigs, setFeaturedGigs] = useState([])
  const [loadingGigs, setLoadingGigs] = useState(true)
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0)
  const [hoveredCardId, setHoveredCardId] = useState(null)
  
  useEffect(() => {
    // Fetch some featured gigs for the landing page
    const fetchFeaturedGigs = async () => {
      try {
        setLoadingGigs(true)
        const response = await gigService.getAllGigs({ page: 1, sort: 'newest' })
        const gigs = response?.data?.gigs || response?.gigs || []
        // Show first 6 gigs on landing page (3 per row on large screens)
        setFeaturedGigs(gigs.slice(0, 6))
      } catch (error) {
        console.error('Error fetching featured gigs:', error)
        setFeaturedGigs([])
      } finally {
        setLoadingGigs(false)
      }
    }
    
    fetchFeaturedGigs()
  }, [])
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/gigs?q=${encodeURIComponent(searchQuery)}`)
    }
  }
  
  const categories = [
    { name: 'Website Development', icon: '💻' },
    { name: 'Logo Design', icon: '🎨' },
    { name: 'Content Writing', icon: '✍️' },
    { name: 'Video Editing', icon: '🎬' },
    { name: 'SEO Services', icon: '📈' },
    { name: 'Social Media', icon: '📱' },
  ]
  
  const trustedBy = ['Meta', 'Google', 'Microsoft', 'Amazon', 'PayPal', 'Stripe']

  const categoryCards = [
    {
      id: 'programming-tech',
      name: 'Programming & Tech',
      link: '/gigs?category=programming-tech',
      bgClass: 'bg-white',
      hoverBgClass: '',
      borderClass: 'border-neutral-200',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <rect x="3" y="4" width="18" height="12" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 8h18" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="16" r="1.5" fill="currentColor" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          <circle cx="17" cy="16" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'graphics-design',
      name: 'Graphics & Design',
      link: '/gigs?category=graphics-design',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-purple-50',
      borderClass: 'border-neutral-200 hover:border-purple-300',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <rect x="4" y="4" width="16" height="16" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5" cy="5" r="0.8" fill="currentColor" />
          <circle cx="19" cy="5" r="0.8" fill="currentColor" />
          <circle cx="5" cy="19" r="0.8" fill="currentColor" />
          <circle cx="19" cy="19" r="0.8" fill="currentColor" />
          <path d="M12 7c-1.5 0-3 1.5-3 3s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 7l-2 2 2 2 2-2-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'digital-marketing',
      name: 'Digital Marketing',
      link: '/gigs?category=digital-marketing',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-pink-50',
      borderClass: 'border-neutral-200 hover:border-pink-300',
      icon: (
        <div className="relative w-full h-full">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="6" y="3" width="12" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5v2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'writing-translation',
      name: 'Writing & Translation',
      link: '/gigs?category=writing-translation',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-blue-50',
      borderClass: 'border-neutral-200 hover:border-blue-300',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <rect x="3" y="4" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="13" y="4" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <text x="6" y="9" fontSize="5" fill="currentColor" textAnchor="middle" fontFamily="serif" fontWeight="normal">文</text>
          <text x="16" y="9" fontSize="5" fill="currentColor" textAnchor="middle" fontWeight="bold">A</text>
        </svg>
      ),
    },
    {
      id: 'video-animation',
      name: 'Video & Animation',
      link: '/gigs?category=video-animation',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-red-50',
      borderClass: 'border-neutral-200 hover:border-red-300',
      icon: (
        <div className="relative w-full h-full">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="3" y="4" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="13" y="4" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'ai-services',
      name: 'AI Services',
      link: '/gigs?category=ai-services',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-indigo-50',
      borderClass: 'border-neutral-200 hover:border-indigo-300',
      icon: (
        <div className="relative w-full h-full">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 7h12M6 11h12M6 15h8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 5l-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'music-audio',
      name: 'Music & Audio',
      link: '/gigs?category=music-audio',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-yellow-50',
      borderClass: 'border-neutral-200 hover:border-yellow-300',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path d="M9 18V6l8-1v12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 16a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 14a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 12h2M3 10h2M3 14h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'business',
      name: 'Business',
      link: '/gigs?category=business',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-teal-50',
      borderClass: 'border-neutral-200 hover:border-teal-300',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <circle cx="6" cy="7" r="2" fill="currentColor" />
          <path d="M6 9v4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="2" fill="currentColor" />
          <path d="M12 9v4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="7" r="2" fill="currentColor" />
          <path d="M18 9v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'consulting',
      name: 'Consulting',
      link: '/gigs?category=consulting',
      bgClass: 'bg-white',
      hoverBgClass: 'hover:bg-cyan-50',
      borderClass: 'border-neutral-200 hover:border-cyan-300',
      icon: (
        <div className="relative w-full h-full">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="9" r="2" fill="currentColor" />
            <path d="M12 11v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
    },
  ]

  const categoryCardRef = useRef(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const checkScrollButtons = () => {
    const container = categoryCardRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollPrev(scrollLeft > 0)
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scrollCategories = (direction) => {
    const container = categoryCardRef.current
    if (!container) return

    const cardWidth = 160 + 24 // Card width + gap
    const scrollAmount = cardWidth * 3 // Scroll 3 cards at a time
    const currentScroll = container.scrollLeft
    const newScroll = direction === 'next' 
      ? currentScroll + scrollAmount
      : currentScroll - scrollAmount

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })

    // Update button states after scroll
    setTimeout(checkScrollButtons, 300)
  }

  useEffect(() => {
    checkScrollButtons()
    const container = categoryCardRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      return () => container.removeEventListener('scroll', checkScrollButtons)
    }
  }, [])
  
  return (
    <MainLayout fullWidth>
      {/* Hero Section */}
      <div className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden py-12 sm:py-0">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Animated decorative elements */}
          <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-48 h-48 sm:w-72 sm:h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-64 h-64 sm:w-96 sm:h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
            Our freelancers will take it from here
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Find the perfect freelancer for your project. Get quality work delivered fast.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
              <div className="flex-1 relative flex items-center bg-neutral-100 rounded-lg shadow-xl overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for any service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-12 sm:h-14 text-base sm:text-lg pl-4 sm:pl-6 pr-2 sm:pr-4 border-0 bg-transparent focus:outline-none focus:ring-0 text-neutral-900 placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  className="h-12 sm:h-14 px-4 sm:px-6 bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center justify-center rounded-r-lg"
                  aria-label="Search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          
          {/* Popular Categories */}
          <div className="mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4">Popular Services:</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              {categories.map((category, idx) => (
                <Link
                  key={idx}
                  to={`/gigs?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium transition-all border border-white/20 hover:border-white/40"
                >
                  <span>{category.icon}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className="bg-white py-6 sm:py-8 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12">
            <p className="text-sm sm:text-base text-neutral-600 font-medium">Trusted by:</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
              {trustedBy.map((company, idx) => (
                <div
                  key={idx}
                  className="text-neutral-400 hover:text-neutral-600 font-semibold text-sm sm:text-base md:text-lg transition-colors cursor-pointer"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

          {/* Statistics Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
                Active Freelancers
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-800 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
                Completed Projects
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-success-600 to-success-800 bg-clip-text text-transparent mb-2">
                98%
              </div>
              <div className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
                Client Satisfaction
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
                Support Available
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            <div className="relative text-center group">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg z-10 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div className="pt-6 sm:pt-8 p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">Browse Services</h3>
                <p className="text-sm sm:text-base text-neutral-600">
                  Explore thousands of services from verified freelancers across various categories
                </p>
              </div>
            </div>
            
            <div className="relative text-center group">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg z-10 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div className="pt-6 sm:pt-8 p-4 sm:p-6 bg-gradient-to-br from-secondary-50 to-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-secondary-200 transition-colors">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">Choose & Order</h3>
                <p className="text-sm sm:text-base text-neutral-600">
                  Select the perfect package, place your order, and provide project requirements
                </p>
              </div>
            </div>
            
            <div className="relative text-center group sm:col-span-2 md:col-span-1">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg z-10 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div className="pt-6 sm:pt-8 p-4 sm:p-6 bg-gradient-to-br from-success-50 to-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-success-200 transition-colors">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">Get Results</h3>
                <p className="text-sm sm:text-base text-neutral-600">
                  Receive high-quality work on time and collaborate until you're completely satisfied
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Gigs Section */}
      {featuredGigs.length > 0 && (
        <div className="bg-gradient-to-b from-neutral-50 to-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  Featured Services
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
                Popular Services Right Now
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-2">
                Discover amazing services from talented freelancers
              </p>
            </div>
            
            {loadingGigs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height="400px" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8">
                  {featuredGigs.map((gig) => {
                    const gigId = gig._id || gig.id
                    return gigId ? <GigCard key={gigId} gig={gig} /> : null
                  })}
                </div>
                <div className="text-center mt-8">
                  <Link to="/gigs">
                    <Button
                      variant="primary"
                      className="px-8 py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Browse All Services
                      <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </div>

                {/* Category Cards Section */}
                <div className="bg-white py-8 sm:py-12 md:py-16 mt-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
                    {/* Navigation Buttons */}
                    {canScrollPrev && (
                      <button
                        onClick={() => scrollCategories('prev')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg border border-neutral-200 flex items-center justify-center transition-all duration-300 hover:bg-neutral-50 hover:shadow-xl hover:scale-110"
                        aria-label="Previous categories"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {canScrollNext && (
                      <button
                        onClick={() => scrollCategories('next')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg border border-neutral-200 flex items-center justify-center transition-all duration-300 hover:bg-neutral-50 hover:shadow-xl hover:scale-110"
                        aria-label="Next categories"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Category Cards Container */}
                    <div
                      ref={categoryCardRef}
                      className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scroll-smooth px-12 sm:px-14 md:px-16 scrollbar-hide"
                      onScroll={checkScrollButtons}
                    >
                      {categoryCards.map((card) => {
                        const isHovered = hoveredCardId === card.id
                        const isDefaultGreen = hoveredCardId === null && card.id === 'programming-tech'
                        const hasGreenBg = isHovered || isDefaultGreen
                        
                        return (
                          <Link
                            key={card.id}
                            to={card.link}
                            onMouseEnter={() => setHoveredCardId(card.id)}
                            onMouseLeave={() => setHoveredCardId(null)}
                            className={`group relative flex-shrink-0 w-[140px] sm:w-[150px] md:w-[160px] aspect-square rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border ${
                              hasGreenBg
                                ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-200 hover:border-green-400'
                                : `${card.bgClass} ${card.hoverBgClass || ''} ${card.borderClass}`
                            }`}
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-3 flex items-center justify-center">
                              {card.icon}
                            </div>
                            <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-neutral-900 text-center leading-tight">
                              {card.name}
                            </p>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-gradient-to-br from-neutral-50 via-white to-primary-50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Why Choose Us?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-2">
              Connect with talented freelancers and get your projects done right
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="group text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">
                Fast Delivery
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Get your projects completed quickly with our pool of expert freelancers who understand deadlines
              </p>
            </div>
            
            <div className="group text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success-400 to-success-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">
                Quality Assured
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Work with verified professionals who deliver exceptional results and exceed expectations
              </p>
            </div>
            
            <div className="group text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-100 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">
                Secure Payments
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Safe and secure payment processing with multiple options and buyer protection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              What Our Clients Say
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Real feedback from satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl sm:rounded-2xl shadow-lg border border-primary-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-3 sm:mb-4 italic">
                "Amazing platform! Found the perfect freelancer for my website project. The quality exceeded my expectations and delivery was super fast."
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs sm:text-sm">
                  JS
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base text-neutral-900">John Smith</div>
                  <div className="text-xs sm:text-sm text-neutral-600">Business Owner</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 bg-gradient-to-br from-secondary-50 to-white rounded-xl sm:rounded-2xl shadow-lg border border-secondary-100">
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-3 sm:mb-4 italic">
                "The best freelancing platform I've used. Professional sellers, clear communication, and outstanding results. Highly recommended!"
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-200 rounded-full flex items-center justify-center text-secondary-700 font-bold text-xs sm:text-sm">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base text-neutral-900">Sarah Miller</div>
                  <div className="text-xs sm:text-sm text-neutral-600">Marketing Director</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 bg-gradient-to-br from-success-50 to-white rounded-xl sm:rounded-2xl shadow-lg border border-success-100 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-3 sm:mb-4 italic">
                "Incredible experience from start to finish. The freelancer understood my vision perfectly and delivered beyond my expectations."
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-200 rounded-full flex items-center justify-center text-success-700 font-bold text-xs sm:text-sm">
                  MD
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base text-neutral-900">Mike Davis</div>
                  <div className="text-xs sm:text-sm text-neutral-600">Startup Founder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 py-16 sm:py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
              Join Us Today
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to get started?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied clients and freelancers building amazing projects together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link to="/gigs" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary-600 hover:bg-neutral-100 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Browse Services
              </Button>
            </Link>
            <Link to="/seller-login" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white/20 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
