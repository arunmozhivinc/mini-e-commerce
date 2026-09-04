import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Check, Zap, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

// Helper to generate consistent visual marketplace rating & review count
const getMockRating = (id = '') => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const rating = (4.0 + (Math.abs(hash) % 9) * 0.1).toFixed(1);
  const reviews = 45 + (Math.abs(hash) % 450);
  return { rating, reviews };
};

const ProductCard = ({ product, variant = 'grid' }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const { rating, reviews } = getMockRating(product._id);

  // Derive MRP and discount percentage for visual marketplace density
  const originalPrice = Math.round((product.price * 1.35) * 100) / 100;
  const discountPercent = Math.max(10, Math.round(((originalPrice - product.price) / originalPrice) * 100));

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  // 1. CAROUSEL CARD VARIANT (Optimized for horizontal scrolling carousels on homepage)
  if (variant === 'carousel') {
    return (
      <div className="flex-shrink-0 w-48 sm:w-56 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col p-3 group relative select-none">
        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
            inWishlist
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} />
        </button>

        {/* Thumbnail */}
        <Link
          to={`/products/${product._id}`}
          className="relative aspect-square w-full rounded-md overflow-hidden bg-white flex items-center justify-center p-2 mb-2"
        >
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Link to={`/products/${product._id}`}>
              <h4 className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#2874f0] line-clamp-1 leading-snug">
                {product.name}
              </h4>
            </Link>

            {/* Rating pill */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {rating} <Star size={9} className="fill-white" />
              </span>
              <span className="text-[11px] text-slate-400">({reviews})</span>
            </div>

            {/* Price hierarchy */}
            <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
              <span className="text-sm sm:text-base font-black text-slate-900">
                ${product.price?.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-[11px] font-bold text-[#388e3c]">
                {discountPercent}% off
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#388e3c]">
              Free delivery
            </span>
            <button
              type="button"
              disabled={isOutOfStock || adding}
              onClick={handleAddToCart}
              className={`p-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                added
                  ? 'bg-emerald-50 text-[#388e3c]'
                  : isOutOfStock
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-[#2874f0] hover:bg-blue-50'
              }`}
            >
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. HORIZONTAL / SEARCH RESULT VARIANT (Flipkart desktop search & comparison row)
  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 group relative">
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
            inWishlist
              ? 'bg-rose-50 text-rose-500'
              : 'bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} />
        </button>

        <Link
          to={`/products/${product._id}`}
          className="w-full sm:w-48 h-44 sm:h-44 bg-slate-50 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center p-3"
        >
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Link to={`/products/${product._id}`}>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2874f0] transition-colors leading-snug">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-xs font-bold px-2 py-0.5 rounded">
                {rating} <Star size={10} className="fill-white" />
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {reviews} Ratings & Reviews
              </span>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                Apex Assured
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded">Bank Offer 10% Instant Discount</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">Free Delivery</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">
                ${product.price?.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-[#388e3c]">
                {discountPercent}% off
              </span>
            </div>

            <button
              type="button"
              disabled={isOutOfStock || adding}
              onClick={handleAddToCart}
              className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#ff9f00] hover:bg-[#f39700] text-white shadow-sm'
              }`}
            >
              {added ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : isOutOfStock ? (
                'Sold Out'
              ) : (
                <>
                  <ShoppingCart size={14} /> Add To Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. DEFAULT GRID CARD VARIANT (High-density marketplace grid card)
  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col p-3.5 sm:p-4 group relative">
      {/* Top action: Wishlist heart */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
          inWishlist
            ? 'bg-rose-50 text-rose-500 shadow-sm'
            : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm border border-slate-100'
        }`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={16} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} />
      </button>

      {/* Stock warning pill */}
      {isOutOfStock ? (
        <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Out of Stock
        </span>
      ) : product.stock <= 5 ? (
        <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Only {product.stock} Left
        </span>
      ) : null}

      {/* Product Image */}
      <Link
        to={`/products/${product._id}`}
        className="relative aspect-square w-full rounded-md overflow-hidden bg-white flex items-center justify-center p-3 mb-3 block"
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category Subtext */}
          {product.category && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 truncate">
              {product.category?.name || 'Catalog'}
            </p>
          )}

          {/* Title */}
          <Link to={`/products/${product._id}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#2874f0] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Ratings & Reviews Pill */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
              {rating} <Star size={10} className="fill-white" />
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({reviews})
            </span>
            <span className="ml-auto text-[10px] font-bold text-[#2874f0] bg-blue-50 px-1.5 py-0.5 rounded">
              Assured
            </span>
          </div>

          {/* Pricing Block */}
          <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-slate-900">
              ${product.price?.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 line-through">
              ${originalPrice.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-[#388e3c]">
              {discountPercent}% off
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-1">
            Free delivery on order
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isOutOfStock || adding}
            onClick={handleAddToCart}
            className={`w-full py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#ff9f00] hover:bg-[#f39700] text-white shadow-sm hover:shadow'
            }`}
          >
            {added ? (
              <>
                <Check size={14} /> Added to Cart
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingCart size={14} /> Add To Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
