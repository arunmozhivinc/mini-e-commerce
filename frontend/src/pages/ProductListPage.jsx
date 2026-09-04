import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Home,
} from 'lucide-react';
import { productAPI } from '../services/api';
import { FALLBACK_PRODUCTS } from '../utils/fallbackProducts';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/ui/Button';

const SORT_OPTIONS = [
  { label: 'Relevance', value: '-createdAt' },
  { label: 'Popularity', value: '-stock' },
  { label: 'Price -- Low to High', value: 'price' },
  { label: 'Price -- High to Low', value: '-price' },
  { label: 'Newest First', value: '-createdAt' },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters State
  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [sort, setSort] = useState('-createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'horizontal'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state when URL params change
  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [urlCategory, urlSearch]);

  // Fetch categories once
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const res = await productAPI.getCategories();
        if (isMounted) {
          setCategories(res.data?.data?.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products
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
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await productAPI.getProducts(params);
      const data = res.data?.data;
      let items = data?.products && data.products.length > 0 ? data.products : FALLBACK_PRODUCTS;

      // Apply filters if fallback items are used
      if (selectedCategory) {
        items = items.filter((p) => p.category?._id === selectedCategory || p.category === selectedCategory || p.category?.slug === selectedCategory);
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
      }
      if (inStockOnly) {
        items = items.filter((item) => item.stock > 0);
      }
      setProducts(items);
      setPagination(data?.pagination || { page: 1, pages: Math.max(1, Math.ceil(items.length / 12)), total: items.length });
    } catch (err) {
      console.warn('Failed to load products from API, falling back to seed catalog:', err.message);
      let items = [...FALLBACK_PRODUCTS];
      if (selectedCategory) {
        items = items.filter((p) => p.category?._id === selectedCategory || p.category === selectedCategory || p.category?.slug === selectedCategory);
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
      }
      if (inStockOnly) {
        items = items.filter((item) => item.stock > 0);
      }
      setProducts(items);
      setPagination({ page: 1, pages: Math.max(1, Math.ceil(items.length / 12)), total: items.length });
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, sort, minPrice, maxPrice, inStockOnly]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSort('-createdAt');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating(null);
    setInStockOnly(false);
    setSearchParams({});
  };

  const currentCategoryObj = categories.find((c) => c._id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-5">
      {/* 1. Breadcrumbs */}
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-[#2874f0] flex items-center gap-1">
          <Home size={13} /> Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-[#2874f0]">
          Products
        </Link>
        {currentCategoryObj && (
          <>
            <span>/</span>
            <span className="text-slate-800 font-bold">{currentCategoryObj.name}</span>
          </>
        )}
        {search && (
          <>
            <span>/</span>
            <span className="text-slate-800 font-bold">Search: "{search}"</span>
          </>
        )}
      </nav>

      {/* 2. Main Marketplace 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column: Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20">
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(catId) => {
              setSelectedCategory(catId);
              if (catId) setSearchParams({ category: catId });
              else setSearchParams({});
            }}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Right Column: Catalog Main View */}
        <main className="lg:col-span-9 space-y-3">
          {/* Top Sort & Results Bar (Flipkart style) */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {search
                    ? `Results for "${search}"`
                    : currentCategoryObj
                      ? currentCategoryObj.name
                      : 'All Products'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  (Showing {products.length > 0 ? (pagination.page - 1) * 12 + 1 : 0} –{' '}
                  {Math.min(pagination.page * 12, pagination.total)} of {pagination.total} products)
                </p>
              </div>

              {/* View Switcher & Mobile Filter Button */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <SlidersHorizontal size={14} className="text-[#2874f0]" /> Filters
                </button>

                <div className="hidden sm:flex items-center border border-slate-200 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${viewMode === 'grid'
                      ? 'bg-blue-50 text-[#2874f0]'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('horizontal')}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${viewMode === 'horizontal'
                      ? 'bg-blue-50 text-[#2874f0]'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Flipkart-Style Sort Tabs */}
            <div className="pt-2.5 flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar text-xs">
              <span className="font-bold text-slate-900 whitespace-nowrap">Sort By:</span>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sort === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSort(opt.value)}
                    className={`whitespace-nowrap pb-0.5 transition-colors cursor-pointer ${isActive
                      ? 'text-[#2874f0] font-bold border-b-2 border-[#2874f0]'
                      : 'text-slate-600 hover:text-[#2874f0]'
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Results */}
          {error ? (
            <div className="bg-white rounded-md border border-slate-200 p-8 text-center my-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Error Loading Products</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{error}</p>
              <Button variant="fk-outline" size="sm" onClick={() => fetchProducts(pagination.page)}>
                <RefreshCw size={14} className="mr-1.5" /> Try Again
              </Button>
            </div>
          ) : (
            <ProductGrid
              products={products}
              loading={loading}
              viewMode={viewMode}
              onResetFilters={handleResetFilters}
            />
          )}

          {/* Flipkart-Style Pagination Bar */}
          {!loading && pagination.pages > 1 && (
            <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <p className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
                <span className="font-bold text-slate-900">{pagination.pages}</span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => fetchProducts(pagination.page - 1)}
                  className="px-3.5 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {/* Page numbers */}
                {[...Array(pagination.pages)].map((_, i) => {
                  const pNum = i + 1;
                  // Show current, first, last, or adjacent pages
                  if (
                    pNum === 1 ||
                    pNum === pagination.pages ||
                    Math.abs(pNum - pagination.page) <= 1
                  ) {
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => fetchProducts(pNum)}
                        className={`w-8 h-8 rounded text-xs font-bold transition-colors cursor-pointer ${pNum === pagination.page
                          ? 'bg-[#2874f0] text-white'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  if (
                    (pNum === 2 && pagination.page > 3) ||
                    (pNum === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                  ) {
                    return (
                      <span key={pNum} className="text-slate-400 text-xs px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => fetchProducts(pagination.page + 1)}
                  className="px-3.5 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Slide-Up Filter Modal / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-white w-full max-h-[80vh] rounded-t-2xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black uppercase text-slate-900">Filters</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                onReset={handleResetFilters}
              />
            </div>

            <div className="p-3 border-t border-slate-200 flex gap-2 bg-slate-50">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded border border-slate-300 text-xs font-bold text-slate-700"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded bg-[#2874f0] text-white text-xs font-bold shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
