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
      <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Our freelancers will take it from here
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
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
                  className="flex-1 h-14 text-lg pl-6 pr-4 border-0 bg-transparent focus:outline-none focus:ring-0 text-neutral-900 placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  className="h-14 px-6 bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center justify-center rounded-r-lg"
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
          <div className="mb-12">
            <p className="text-sm text-white/80 mb-4">Popular Services:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, idx) => (
                <Link
                  key={idx}
                  to={`/gigs?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all border border-white/20 hover:border-white/40"
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <svg
                    className="w-4 h-4"
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
      <div className="bg-white py-8 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <p className="text-neutral-600 font-medium">Trusted by:</p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {trustedBy.map((company, idx) => (
                <div
                  key={idx}
                  className="text-neutral-400 hover:text-neutral-600 font-semibold text-lg transition-colors cursor-pointer"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose BrandName?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Connect with talented freelancers and get your projects done right
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of satisfied clients and freelancers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/gigs">
              <Button
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-neutral-100 px-8 py-3 text-lg"
              >
                Browse Services
              </Button>
            </Link>
            <Link to="/seller-login">
              <Button
                className="bg-white/10 text-white border-2 border-white hover:bg-white/20 px-8 py-3 text-lg"
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
