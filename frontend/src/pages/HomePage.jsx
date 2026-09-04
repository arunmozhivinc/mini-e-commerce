import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { productAPI } from '../services/api';
import { FALLBACK_PRODUCTS } from '../utils/fallbackProducts';
import CategoryBar from '../components/layout/CategoryBar';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/ui/Button';

// High-impact promotional hero banners (marketplace themed)
const HERO_SLIDES = [
  {
    id: 1,
    title: 'Electronics Mega Carnival',
    subtitle: 'Flagship Laptops, Noise-Cancelling Audio & Smart Displays',
    discount: 'Up to 60% Off',
    badge: 'Limited Time Deal',
    bgGradient: 'from-[#0d47a1] via-[#1976d2] to-[#42a5f5]',
    ctaText: 'Shop Tech Deals',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'The Great Fashion Fest',
    subtitle: 'Trending Streetwear, Luxury Footwear & Premium Timepieces',
    discount: 'Min. 50% Off',
    badge: 'Trending Styles',
    bgGradient: 'from-[#880e4f] via-[#c2185b] to-[#ec407a]',
    ctaText: 'Explore Fashion',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Modern Home Makeover',
    subtitle: 'Ergonomic Cookware, Smart Lighting & Aesthetic Home Decor',
    discount: 'Starts from $19.99',
    badge: 'Best Value',
    bgGradient: 'from-[#1b5e20] via-[#388e3c] to-[#66bb6a]',
    ctaText: 'Upgrade Your Space',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
  },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer for "Deals of the Day"
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  // Carousel scroll container refs
  const dealsRef = useRef(null);
  const electronicsRef = useRef(null);
  const fashionRef = useRef(null);
  const homeRef = useRef(null);

  // Fetch catalog products
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProducts({ limit: 40 });
        const fetched = res.data?.data?.products;
        setProducts(fetched && fetched.length > 0 ? fetched : FALLBACK_PRODUCTS);
      } catch (err) {
        console.error('HomePage: Failed to load products from API, showing catalog preview:', err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Hero auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Timer countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const offset = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Categorize products
  const electronicsProducts = products.filter(
    (p) =>
      p.category?.slug?.includes('elect') ||
      p.category?.name?.toLowerCase().includes('elect') ||
      p.name?.toLowerCase().includes('headphone') ||
      p.name?.toLowerCase().includes('watch')
  );

  const fashionProducts = products.filter(
    (p) =>
      p.category?.slug?.includes('fash') ||
      p.category?.name?.toLowerCase().includes('fash') ||
      p.name?.toLowerCase().includes('shirt') ||
      p.name?.toLowerCase().includes('shoe')
  );

  const homeProducts = products.filter(
    (p) =>
      p.category?.slug?.includes('home') ||
      p.category?.name?.toLowerCase().includes('home') ||
      p.category?.slug?.includes('kitchen')
  );

  // Fallbacks if specific category has fewer than 2 items
  const displayElectronics = electronicsProducts.length >= 2 ? electronicsProducts : products.slice(0, 8);
  const displayFashion = fashionProducts.length >= 2 ? fashionProducts : products.slice(2, 10);
  const displayHome = homeProducts.length >= 2 ? homeProducts : products.slice(4, 12);
  const dealsProducts = products.slice(0, 10);

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* 1. Horizontal Category Strip (Flipkart hallmark) */}
      <CategoryBar />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4 space-y-4 sm:space-y-5">
        {/* 2. Hero Promotional Carousel */}
        <div className="relative rounded-md overflow-hidden shadow-sm bg-slate-900 aspect-[21/9] sm:aspect-[24/8] min-h-[220px]">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 flex items-center justify-between p-6 sm:p-12 bg-gradient-to-r ${
                slide.bgGradient
              } ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {/* Slide Left Content */}
              <div className="max-w-md sm:max-w-lg text-white z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
                  <Sparkles size={12} className="text-[#ffe500]" /> {slide.badge}
                </span>

                <h2 className="text-xl sm:text-4xl font-black tracking-tight leading-tight mb-1 sm:mb-2">
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2 mb-3 sm:mb-5">
                  {slide.subtitle}
                </p>

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-sm sm:text-2xl font-black text-[#ffe500] drop-shadow-sm">
                    {slide.discount}
                  </span>
                  <Link
                    to={slide.ctaLink}
                    className="bg-white text-slate-900 hover:bg-slate-100 px-4 sm:px-6 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                  >
                    {slide.ctaText} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Slide Right Image */}
              <div className="hidden sm:block relative w-64 h-64 lg:w-80 lg:h-80 flex-shrink-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover rounded-xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 border-2 border-white/20"
                />
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-14 bg-white/80 hover:bg-white text-slate-800 rounded-r flex items-center justify-center shadow-md cursor-pointer transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-14 bg-white/80 hover:bg-white text-slate-800 rounded-l flex items-center justify-center shadow-md cursor-pointer transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 3. Flipkart-Style "Deals of the Day" with Timer Widget & Carousel */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Flame size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Deals of the Day
                </h3>
                {/* Live Timer */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock size={13} className="text-slate-400" />
                  <span>Ends in:</span>
                  <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
              <Link
                to="/products"
                className="px-4 py-1.5 rounded bg-[#2874f0] text-white text-xs font-bold hover:bg-[#1a56db] shadow-sm transition-colors"
              >
                VIEW ALL
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel(dealsRef, 'left')}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel(dealsRef, 'right')}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel items */}
          <div
            ref={dealsRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pt-4 pb-1"
          >
            {loading
              ? [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-48 sm:w-56 h-72 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))
              : dealsProducts.map((product) => (
                  <ProductCard key={product._id} product={product} variant="carousel" />
                ))}
          </div>
        </div>

        {/* 4. Promotional Banner Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-md p-5 text-white flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                Apex Assured
              </span>
              <h4 className="text-base font-black mt-1">Smartphones & Laptops</h4>
              <p className="text-xs text-blue-100 mt-0.5">Top brand discounts up to 45%</p>
              <Link to="/products" className="inline-block mt-3 text-xs font-bold text-[#ffe500] hover:underline">
                Explore Tech →
              </Link>
            </div>
            <Sparkles size={38} className="text-[#ffe500] opacity-80" />
          </div>

          <div className="bg-gradient-to-r from-purple-700 to-pink-700 rounded-md p-5 text-white flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                Trend Alert
              </span>
              <h4 className="text-base font-black mt-1">Wardrobe Refresh</h4>
              <p className="text-xs text-pink-100 mt-0.5">Starting at just $14.99</p>
              <Link to="/products" className="inline-block mt-3 text-xs font-bold text-[#ffe500] hover:underline">
                Shop Fashion →
              </Link>
            </div>
            <Tag size={38} className="text-[#ffe500] opacity-80" />
          </div>

          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-md p-5 text-white flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                Best of Kitchen
              </span>
              <h4 className="text-base font-black mt-1">Cookware & Appliances</h4>
              <p className="text-xs text-amber-100 mt-0.5">Extra 15% off with card</p>
              <Link to="/products" className="inline-block mt-3 text-xs font-bold text-white hover:underline">
                Explore Home →
              </Link>
            </div>
            <Zap size={38} className="text-white opacity-80" />
          </div>
        </div>

        {/* 5. "Best of Electronics" Carousel Section */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Best of Electronics
              </h3>
              <p className="text-xs text-slate-500">Audio, wearables, compute and accessories</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/products"
                className="px-3.5 py-1.5 rounded bg-[#2874f0] text-white text-xs font-bold hover:bg-[#1a56db]"
              >
                VIEW ALL
              </Link>
              <button
                type="button"
                onClick={() => scrollCarousel(electronicsRef, 'left')}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 items-center justify-center text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(electronicsRef, 'right')}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 items-center justify-center text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={electronicsRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pt-4 pb-1"
          >
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-48 sm:w-56 h-72 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))
              : displayElectronics.map((product) => (
                  <ProductCard key={product._id} product={product} variant="carousel" />
                ))}
          </div>
        </div>

        {/* 6. "Trending Fashion & Wearables" Carousel Section */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Trending Fashion & Apparel
              </h3>
              <p className="text-xs text-slate-500">Curated styles, sneakers, and everyday essentials</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/products"
                className="px-3.5 py-1.5 rounded bg-[#2874f0] text-white text-xs font-bold hover:bg-[#1a56db]"
              >
                VIEW ALL
              </Link>
              <button
                type="button"
                onClick={() => scrollCarousel(fashionRef, 'left')}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 items-center justify-center text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(fashionRef, 'right')}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 items-center justify-center text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={fashionRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pt-4 pb-1"
          >
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-48 sm:w-56 h-72 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))
              : displayFashion.map((product) => (
                  <ProductCard key={product._id} product={product} variant="carousel" />
                ))}
          </div>
        </div>

        {/* 7. "Curated Home & Kitchen" Section */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Home & Living Essentials
              </h3>
              <p className="text-xs text-slate-500">Everything you need for an aesthetic, smart living space</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/products"
                className="px-3.5 py-1.5 rounded bg-[#2874f0] text-white text-xs font-bold hover:bg-[#1a56db]"
              >
                VIEW ALL
              </Link>
              <button
                type="button"
                onClick={() => scrollCarousel(homeRef, 'left')}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 items-center justify-center text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(homeRef, 'right')}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 items-center justify-center text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={homeRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pt-4 pb-1"
          >
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-48 sm:w-56 h-72 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))
              : displayHome.map((product) => (
                  <ProductCard key={product._id} product={product} variant="carousel" />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
