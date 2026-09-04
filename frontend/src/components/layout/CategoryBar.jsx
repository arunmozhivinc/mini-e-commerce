import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Flame,
  Tv,
  Watch,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { productAPI } from '../../services/api';

// Fallback icon mapping based on name/slug
const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('elect') || n.includes('gadget') || n.includes('tech')) return Laptop;
  if (n.includes('phone') || n.includes('mobile')) return Smartphone;
  if (n.includes('fash') || n.includes('cloth') || n.includes('apparel')) return Shirt;
  if (n.includes('home') || n.includes('kitchen') || n.includes('decor')) return Home;
  if (n.includes('appliance') || n.includes('tv')) return Tv;
  if (n.includes('watch') || n.includes('wearable')) return Watch;
  if (n.includes('offer') || n.includes('deal')) return Flame;
  return ShoppingBag;
};

const CategoryBar = () => {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const activeCategoryId = searchParams.get('category');

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await productAPI.getCategories();
        const cats = res.data?.data?.categories || [];
        if (isMounted) {
          setCategories(cats);
        }
      } catch (err) {
        console.error('CategoryBar: Failed to load categories:', err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Preset marketplace shortcut categories if DB is empty or during loading
  const displayCategories = categories.length > 0
    ? categories
    : [
        { _id: 'electronics', name: 'Electronics', slug: 'electronics' },
        { _id: 'fashion-apparel', name: 'Fashion & Apparel', slug: 'fashion-apparel' },
        { _id: 'home-kitchen', name: 'Home & Kitchen', slug: 'home-kitchen' },
      ];

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar py-2 sm:py-3">
          {/* "All Products" link */}
          <Link
            to="/products"
            className={`group flex flex-col items-center flex-shrink-0 px-2 py-1 rounded-lg transition-all ${
              !activeCategoryId
                ? 'text-[#2874f0] font-bold'
                : 'text-slate-700 hover:text-[#2874f0] font-medium'
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-110 ${
                !activeCategoryId
                  ? 'bg-blue-50 text-[#2874f0] shadow-sm'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#2874f0]'
              }`}
            >
              <Sparkles size={20} />
            </div>
            <span className="text-[11px] sm:text-xs tracking-tight whitespace-nowrap">
              All Offers
            </span>
            {!activeCategoryId && (
              <span className="w-4 h-0.5 bg-[#2874f0] rounded-full mt-0.5" />
            )}
          </Link>

          {/* Dynamic Categories */}
          {displayCategories.map((cat) => {
            const IconComponent = getCategoryIcon(cat.name);
            const isActive = activeCategoryId === cat._id;

            return (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className={`group flex flex-col items-center flex-shrink-0 px-2 py-1 rounded-lg transition-all ${
                  isActive
                    ? 'text-[#2874f0] font-bold'
                    : 'text-slate-700 hover:text-[#2874f0] font-medium'
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-110 overflow-hidden ${
                    isActive
                      ? 'bg-blue-50 text-[#2874f0] ring-2 ring-[#2874f0]/20 shadow-sm'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#2874f0]'
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <IconComponent size={20} />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs tracking-tight whitespace-nowrap">
                  {cat.name}
                </span>
                {isActive && (
                  <span className="w-4 h-0.5 bg-[#2874f0] rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
