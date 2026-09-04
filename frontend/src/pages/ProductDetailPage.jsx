import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Heart,
  Tag,
  MapPin,
  Sparkles,
  ChevronRight,
  Share2,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { productAPI } from '../services/api';
import { FALLBACK_PRODUCTS } from '../utils/fallbackProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Pincode checker simulation
  const [pincode, setPincode] = useState('560103');
  const [pincodeChecked, setPincodeChecked] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProductById(id);
        const p = res.data?.data?.product;
        if (p && isMounted) {
          setProduct(p);
          setSelectedImage(p.images?.[0] || '');

          // Fetch similar products in same category
          try {
            const relRes = await productAPI.getProducts({
              category: p.category?._id || p.category,
              limit: 8,
            });
            if (isMounted) {
              const relItems = (relRes.data?.data?.products || []).filter(
                (item) => item._id !== id
              );
              setSimilarProducts(relItems.length > 0 ? relItems : FALLBACK_PRODUCTS.filter((item) => item._id !== id).slice(0, 6));
            }
          } catch (e) {
            if (isMounted) setSimilarProducts(FALLBACK_PRODUCTS.filter((item) => item._id !== id).slice(0, 6));
          }
        } else {
          // Check fallback products
          const fallback = FALLBACK_PRODUCTS.find((item) => item._id === id) || FALLBACK_PRODUCTS[0];
          if (fallback && isMounted) {
            setProduct(fallback);
            setSelectedImage(fallback.images?.[0] || '');
            setSimilarProducts(FALLBACK_PRODUCTS.filter((item) => item._id !== fallback._id).slice(0, 6));
          } else if (isMounted) {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.warn('Error fetching product from API, checking seed catalog:', err);
        const fallback = FALLBACK_PRODUCTS.find((item) => item._id === id) || FALLBACK_PRODUCTS[0];
        if (fallback && isMounted) {
          setProduct(fallback);
          setSelectedImage(fallback.images?.[0] || '');
          setSimilarProducts(FALLBACK_PRODUCTS.filter((item) => item._id !== fallback._id).slice(0, 6));
        } else if (isMounted) {
          setError('Failed to load product details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductAndRelated();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading product information..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">{error || 'Product Not Found'}</h2>
        <p className="text-sm text-slate-500 mb-6">
          The product you requested could not be located or may be out of stock.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#2874f0] text-white font-bold text-sm"
        >
          <ArrowLeft size={16} /> Return to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  const originalPrice = Math.round((product.price * 1.35) * 100) / 100;
  const discountPercent = Math.max(10, Math.round(((originalPrice - product.price) / originalPrice) * 100));

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    try {
      setAdding(true);
      await addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/checkout` } } });
      return;
    }
    try {
      setAdding(true);
      await addToCart(product, quantity);
      navigate('/checkout');
    } catch (err) {
      console.error(err);
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-[#2874f0]">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#2874f0]">
            Catalog
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/products?category=${product.category._id || product.category}`}
                className="hover:text-[#2874f0]"
              >
                {product.category?.name || 'Category'}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Flipkart-Style 2-Column Product Layout */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Gallery & High-Impact Action Buttons */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Thumbnail strip */}
              {product.images && product.images.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:max-h-96">
                  {product.images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onMouseEnter={() => setSelectedImage(imgUrl)}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded border-2 flex-shrink-0 p-1 cursor-pointer transition-all bg-white ${
                        selectedImage === imgUrl
                          ? 'border-[#2874f0] shadow-sm'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Preview Container */}
              <div className="relative flex-1 aspect-square rounded border border-slate-100 flex items-center justify-center p-4 bg-white">
                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inWishlist
                      ? 'bg-rose-50 text-rose-500 shadow'
                      : 'bg-white text-slate-400 hover:text-rose-500 shadow border border-slate-200'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={18} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                </button>

                <img
                  src={selectedImage || product.images?.[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-110 cursor-zoom-in"
                />
              </div>
            </div>

            {/* DUAL HIGH-IMPACT MARKETPLACE ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isOutOfStock || adding}
                onClick={handleAddToCart}
                className={`py-3.5 px-4 rounded font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#ff9f00] hover:bg-[#f39700] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isOutOfStock || adding}
                onClick={handleBuyNow}
                className={`py-3.5 px-4 rounded font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#fb641b] hover:bg-[#e65100] text-white'
                }`}
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Information & Marketplace Highlights */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              {/* Brand & Category pill */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-[#2874f0] uppercase tracking-wider">
                  {product.category?.name || 'Verified Marketplace Item'}
                </span>
                <span className="text-[11px] font-bold text-[#2874f0] bg-blue-50 px-2 py-0.5 rounded">
                  Apex Assured
                </span>
              </div>

              {/* Title */}
              <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Ratings and Reviews */}
              <div className="mt-2.5 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-xs font-bold px-2 py-0.5 rounded">
                  4.4 <Star size={11} className="fill-white" />
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  2,418 Ratings & 382 Reviews
                </span>
              </div>
            </div>

            {/* Special Price Callout Block */}
            <div className="border-t border-b border-slate-100 py-3">
              <span className="text-[11px] font-bold text-[#388e3c] uppercase tracking-wider">
                Special Price
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  ${product.price?.toFixed(2)}
                </span>
                <span className="text-sm sm:text-base text-slate-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#388e3c]">
                  {discountPercent}% off
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Inclusive of all taxes • Free shipping eligible
              </p>
            </div>

            {/* Available Bank Offers & Deals (Flipkart Hallmark) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Available Offers
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Tag size={15} className="text-[#388e3c] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Bank Offer:</strong> 10% instant discount on
                    Credit/Debit Card transactions up to $25.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Tag size={15} className="text-[#388e3c] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Special Price:</strong> Get extra 5% off on
                    checkout with coupon <strong>APEXFEST</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Tag size={15} className="text-[#388e3c] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Partner Offer:</strong> Sign up for ApexCart
                    Plus and earn 5% cashback on every order.
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Pincode Checker */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider min-w-[70px]">
                  Delivery
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        setPincodeChecked(false);
                      }}
                      placeholder="Enter Delivery Pincode"
                      className="border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#2874f0] w-44 font-mono font-bold text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPincodeChecked(true)}
                    className="text-xs font-bold text-[#2874f0] hover:underline cursor-pointer"
                  >
                    Check
                  </button>
                </div>
              </div>

              {pincodeChecked && (
                <div className="mt-2 pl-0 sm:pl-20 text-xs space-y-1">
                  <p className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Truck size={14} className="text-[#388e3c]" />
                    Delivery by Tomorrow, 5:00 PM |{' '}
                    <span className="text-[#388e3c] font-bold">Free</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    14 Days Replacement Policy • Cash on Delivery Available
                  </p>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider min-w-[70px]">
                  Quantity
                </span>
                <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  {product.stock <= 5 ? (
                    <span className="text-rose-600 font-bold">Only {product.stock} left in stock!</span>
                  ) : (
                    <span className="text-[#388e3c] font-semibold">In Stock</span>
                  )}
                </span>
              </div>
            )}

            {/* Product Highlights */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Highlights
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
                <li>100% Genuine product with brand warranty</li>
                <li>Tested and certified for long-lasting durability</li>
                <li>Quick setup and universal compatibility</li>
                <li>Packaged in tamper-proof protective retail box</li>
              </ul>
            </div>

            {/* Description & Specifications */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Product Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Similar Products Carousel */}
        {similarProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Similar Products
                </h3>
                <p className="text-xs text-slate-500">Customers who viewed this item also bought</p>
              </div>
              <Link
                to="/products"
                className="px-3.5 py-1.5 rounded bg-[#2874f0] text-white text-xs font-bold hover:bg-[#1a56db]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
              {similarProducts.map((item) => (
                <ProductCard key={item._id} product={item} variant="carousel" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="md:hidden fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-slate-200 p-2 shadow-xl flex gap-2">
        <button
          type="button"
          disabled={isOutOfStock || adding}
          onClick={handleAddToCart}
          className={`flex-1 py-3 rounded font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 shadow ${
            added
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-slate-200 text-slate-400'
              : 'bg-[#ff9f00] text-white'
          }`}
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          {added ? 'Added' : 'Add to Cart'}
        </button>

        <button
          type="button"
          disabled={isOutOfStock || adding}
          onClick={handleBuyNow}
          className={`flex-1 py-3 rounded font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 shadow ${
            isOutOfStock ? 'bg-slate-200 text-slate-400' : 'bg-[#fb641b] text-white'
          }`}
        >
          <Zap size={16} /> Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
