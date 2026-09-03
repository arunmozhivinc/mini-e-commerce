import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProductById(id);
        const p = res.data?.data?.product;
        if (p) {
          setProduct(p);
          setSelectedImage(p.images?.[0] || '');
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error || 'Product Not Found'}</h2>
        <p className="text-sm text-slate-500 mb-6">
          The product you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <span>/</span>
        <span className="text-slate-400">{product.category?.name || 'Category'}</span>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                    selectedImage === imgUrl
                      ? 'border-brand-600 ring-2 ring-brand-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info and Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              {product.category && (
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-lg">
                  {product.category?.name}
                </span>
              )}
              {product.sku && (
                <span className="text-[11px] font-mono text-slate-400">SKU: {product.sku}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price & Stock Display */}
            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-3xl font-black text-slate-900">
                ${product.price?.toFixed(2)}
              </span>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Out of Stock
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Description
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer text-base font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3.5 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer text-base font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Total: ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <Button
              size="lg"
              variant={added ? 'secondary' : 'primary'}
              disabled={isOutOfStock || adding}
              loading={adding}
              onClick={handleAddToCart}
              className="w-full text-base py-3.5"
            >
              {added ? (
                <>
                  <Check size={18} className="text-emerald-400 mr-2" /> Added to Your Cart
                </>
              ) : isOutOfStock ? (
                'Temporarily Out of Stock'
              ) : (
                <>
                  <ShoppingCart size={18} className="mr-2" /> Add {quantity} to Cart
                </>
              )}
            </Button>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center">
              <div className="p-2 rounded-xl bg-slate-50">
                <Truck size={16} className="mx-auto text-slate-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 block">Fast Delivery</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <ShieldCheck size={16} className="mx-auto text-slate-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 block">Stripe Protected</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <RotateCcw size={16} className="mx-auto text-slate-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700 block">30-Day Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
