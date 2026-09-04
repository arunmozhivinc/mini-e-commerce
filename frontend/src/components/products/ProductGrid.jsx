import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

const ProductGrid = ({
  products = [],
  loading = false,
  viewMode = 'grid',
  onResetFilters,
}) => {
  if (loading) {
    if (viewMode === 'horizontal') {
      return (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse flex flex-col sm:flex-row gap-4"
            >
              <div className="w-full sm:w-48 h-44 bg-slate-200 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="pt-4 mt-auto flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded w-28" />
                  <div className="h-9 bg-slate-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 animate-pulse flex flex-col"
          >
            <div className="aspect-square bg-slate-100 rounded w-full mb-3" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-4/5" />
              <div className="h-3 bg-slate-200 rounded w-2/5" />
              <div className="h-5 bg-slate-200 rounded w-3/5 mt-3" />
              <div className="pt-3 mt-auto">
                <div className="h-8 bg-slate-200 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-md border border-slate-200 p-8 sm:p-12 text-center">
        <EmptyState
          icon={ShoppingBag}
          title="Sorry, no products found!"
          description="We couldn't find any items matching your current filters. Please try adjusting your filters or search keywords."
          actionLabel={onResetFilters ? 'Clear All Filters' : undefined}
          onAction={onResetFilters}
        />
      </div>
    );
  }

  if (viewMode === 'horizontal') {
    return (
      <div className="space-y-3">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} variant="horizontal" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} variant="grid" />
      ))}
    </div>
  );
};

export default ProductGrid;
