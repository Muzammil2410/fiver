import React from 'react'
import Input from '../ui/Input'

export default function PriceRangeInputs({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Min Price
        </label>
        <Input
          type="number"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          placeholder="Min"
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Max Price
        </label>
        <Input
          type="number"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          placeholder="Max"
          min="0"
        />
      </div>
    </div>
  )
}

