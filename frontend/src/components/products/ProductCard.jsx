import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

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

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col">
      {/* Product Image Container */}
      <Link
        to={`/products/${product._id}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100 block"
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge */}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {product.category?.name || 'Item'}
          </span>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Out of Stock
          </span>
        ) : product.stock < 10 ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Only {product.stock} Left
          </span>
        ) : null}
      </Link>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-lg font-black text-slate-900">
              ${product.price?.toFixed(2)}
            </span>
          </div>

          <Button
            size="sm"
            variant={added ? 'secondary' : 'primary'}
            disabled={isOutOfStock || adding}
            loading={adding}
            onClick={handleAddToCart}
            className="flex-shrink-0"
          >
            {added ? (
              <>
                <Check size={14} className="text-emerald-400 mr-1" /> Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingCart size={14} className="mr-1" /> Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
