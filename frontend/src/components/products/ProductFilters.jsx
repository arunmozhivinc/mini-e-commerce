import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ProductFilters = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  sort,
  setSort,
  categories = [],
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Bar */}
        <div className="md:col-span-5">
          <Input
            placeholder="Search products by title, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        {/* Category Select */}
        <div className="md:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="md:col-span-3 flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>

          {(search || selectedCategory || sort !== '-createdAt') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              title="Reset Filters"
              className="p-2 text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <X size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            !selectedCategory
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat._id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
