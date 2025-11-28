import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
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
  
  return (
    <MainLayout fullWidth>
      {/* Hero Section */}
      <div className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden py-12 sm:py-0">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-48 h-48 sm:w-72 sm:h-72 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-64 h-64 sm:w-96 sm:h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
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
      
      {/* Features Section */}
      <div className="bg-neutral-50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Why Choose BrandName?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-2">
              Connect with talented freelancers and get your projects done right
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
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
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-neutral-600">
                Get your projects completed quickly with our pool of expert freelancers
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success-600"
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
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Quality Assured
              </h3>
              <p className="text-neutral-600">
                Work with verified professionals who deliver exceptional results
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-neutral-600">
                Safe and secure payment processing with multiple options
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to get started?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
            Join thousands of satisfied clients and freelancers
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/gigs" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary-600 hover:bg-neutral-100 px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg"
              >
                Browse Services
              </Button>
            </Link>
            <Link to="/seller-login" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-white/10 text-white border-2 border-white hover:bg-white/20 px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg"
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
