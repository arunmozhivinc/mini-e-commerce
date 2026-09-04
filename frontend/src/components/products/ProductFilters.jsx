import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Star,
  Check,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react';

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $25', min: '0', max: '25' },
  { label: '$25 to $50', min: '25', max: '50' },
  { label: '$50 to $100', min: '50', max: '100' },
  { label: 'Over $100', min: '100', max: '' },
];

const RATINGS = [
  { stars: 4, label: '4★ & above' },
  { stars: 3, label: '3★ & above' },
  { stars: 2, label: '2★ & above' },
];

const ProductFilters = ({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedRating,
  setSelectedRating,
  inStockOnly,
  setInStockOnly,
  onReset,
}) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = Boolean(
    selectedCategory || minPrice || maxPrice || selectedRating || inStockOnly
  );

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
      {/* Filters Header */}
      <div className="p-4 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#2874f0]" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-[#2874f0] hover:underline uppercase tracking-wide cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 1. CATEGORIES FILTER */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 cursor-pointer"
        >
          <span>Categories</span>
          {openSections.category ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {openSections.category && (
          <div className="space-y-1 mt-3">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                !selectedCategory
                  ? 'bg-blue-50 text-[#2874f0] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Categories</span>
              {!selectedCategory && <Check size={14} />}
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setSelectedCategory(cat._id)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCategory === cat._id
                    ? 'bg-blue-50 text-[#2874f0] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {selectedCategory === cat._id && <Check size={14} className="flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. PRICE RANGE FILTER */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 cursor-pointer"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {openSections.price && (
          <div className="space-y-2 mt-3">
            {PRICE_RANGES.map((range, index) => {
              const isSelected = minPrice === range.min && maxPrice === range.max;
              return (
                <label
                  key={index}
                  className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#2874f0]"
                >
                  <input
                    type="radio"
                    name="price_range"
                    checked={isSelected}
                    onChange={() => {
                      setMinPrice(range.min);
                      setMaxPrice(range.max);
                    }}
                    className="accent-[#2874f0] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{range.label}</span>
                </label>
              );
            })}

            {/* Custom Min / Max inputs */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="number"
                placeholder="Min $"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#2874f0]"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="number"
                placeholder="Max $"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#2874f0]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. CUSTOMER RATINGS FILTER */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 cursor-pointer"
        >
          <span>Customer Ratings</span>
          {openSections.rating ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {openSections.rating && (
          <div className="space-y-2 mt-3">
            {RATINGS.map((item) => (
              <label
                key={item.stars}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#2874f0]"
              >
                <input
                  type="radio"
                  name="rating_filter"
                  checked={selectedRating === item.stars}
                  onChange={() =>
                    setSelectedRating(selectedRating === item.stars ? null : item.stars)
                  }
                  className="accent-[#2874f0] w-3.5 h-3.5 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                    {item.stars} <Star size={9} className="fill-white" />
                  </span>
                  <span>& above</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. AVAILABILITY FILTER */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => toggleSection('availability')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 cursor-pointer"
        >
          <span>Availability</span>
          {openSections.availability ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {openSections.availability && (
          <div className="mt-3">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#2874f0]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#2874f0] w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
