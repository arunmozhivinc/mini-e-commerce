import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { productAPI } from '../services/api';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/ui/Button';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productAPI.getCategories();
        setCategories(res.data?.data?.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when filters or page change
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 12,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;

      const res = await productAPI.getProducts(params);
      const data = res.data?.data;
      if (data) {
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Unable to load products right now. Please verify backend services are active.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSort('-createdAt');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 mb-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-brand-300 mb-4">
            <Sparkles size={14} />
            Redis-Cached High Performance Catalog
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Curated Goods for Modern Living.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Discover precision electronics, timeless fashion, and curated home goods with instant order tracking and secure Stripe checkout.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <ProductFilters
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sort={sort}
        setSort={setSort}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Error State */}
      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center my-8">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-rose-900 mb-1">Catalog Connection Issue</h3>
          <p className="text-xs text-rose-600 max-w-md mx-auto mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchProducts(pagination.page)}>
            <RefreshCw size={14} className="mr-1.5" /> Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Products Grid / Skeletons / Empty */}
          <ProductGrid
            products={products}
            loading={loading}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
              <p className="text-xs text-slate-500 font-medium">
                Showing page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
                <span className="font-bold text-slate-900">{pagination.pages}</span> ({pagination.total} total items)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => fetchProducts(pagination.page - 1)}
                >
                  <ChevronLeft size={16} /> Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => fetchProducts(pagination.page + 1)}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListPage;
