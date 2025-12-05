import React from 'react'
import { useSearchParams } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function GigsFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || 'best'
  const deliveryTime = searchParams.get('deliveryTime') || ''
  
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Mobile: Stack all filters vertically, Desktop: Grid layout */}
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="social-media-management">Social Media Management</option>
            <option value="video-editing">Video Editing</option>
            <option value="logo-designing">Logo Designing</option>
            <option value="seo-expert">SEO Expert</option>
            <option value="website-development">Website Development</option>
            <option value="web-designer">Web Designer</option>
            <option value="wordpress-developer">WordPress Developer</option>
          </select>
        </div>
        
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Min Price
          </label>
          <Input
            type="number"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            placeholder="Min"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Max Price
          </label>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            placeholder="Max"
          />
        </div>
        
        {/* Delivery Time */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Delivery Time
          </label>
          <select
            value={deliveryTime}
            onChange={(e) => updateParam('deliveryTime', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Any</option>
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
        
        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Sort By
          </label>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="best">Best Match</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>
      
      {/* Experience Level */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-200">
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
          Experience Level
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'expert', label: 'Expert' }
          ].map(({ value, label }) => {
            const isSelected = searchParams.get('level') === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams)
                  if (isSelected) {
                    newParams.delete('level')
                  } else {
                    newParams.set('level', value)
                  }
                  setSearchParams(newParams)
                }}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

