import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../ui/EmptyState';

const ProductGrid = ({ products = [], loading = false, onResetFilters }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse flex flex-col"
          >
            <div className="aspect-square bg-slate-200 w-full" />
            <div className="p-5 space-y-3 flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-16" />
                <div className="h-8 bg-slate-200 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your search criteria or category filter to discover other items."
        actionLabel={onResetFilters ? 'Reset Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
