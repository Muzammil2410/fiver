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
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <option value="design">Design</option>
            <option value="development">Development</option>
            <option value="writing">Writing</option>
            <option value="marketing">Marketing</option>
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
          </select>
        </div>
      </div>
      
      {/* Experience Level */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Experience Level
        </label>
        <div className="flex flex-wrap gap-2">
          {['Beginner', 'Intermediate', 'Expert'].map((level) => {
            const isSelected = searchParams.get('level') === level.toLowerCase()
            return (
              <button
                key={level}
                type="button"
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams)
                  if (isSelected) {
                    newParams.delete('level')
                  } else {
                    newParams.set('level', level.toLowerCase())
                  }
                  setSearchParams(newParams)
                }}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {level}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

