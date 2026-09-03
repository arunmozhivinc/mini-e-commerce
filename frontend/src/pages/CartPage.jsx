import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <EmptyState
          title="Sign in to view your cart"
          description="Your cart items are saved to your account so you can access them anywhere."
          actionLabel="Sign In"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          actionLabel="Explore Products"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const grandTotal = Math.round((subtotal + tax + shipping) * 100) / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your items and proceed to checkout
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {items.map((item) => (
            <div key={item._id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Product Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Price */}
              <div className="flex-1 text-center sm:text-left">
                <Link
                  to={`/products/${item.product}`}
                  className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unit Price: ${item.price?.toFixed(2)}
                </p>
                <p className="text-sm font-black text-slate-900 mt-2 sm:hidden">
                  Total: ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    if (item.quantity > 1) {
                      updateQuantity(item._id, item.quantity - 1);
                    } else {
                      removeItem(item._id);
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="p-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Item Subtotal on Desktop */}
              <div className="hidden sm:block text-right min-w-[80px]">
                <span className="text-sm font-black text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeItem(item._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm sticky top-24">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            {subtotal < 50 && (
              <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2 rounded-lg">
                Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total</span>
            <span className="text-xl font-black text-slate-900">${grandTotal.toFixed(2)}</span>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/checkout')}
            className="w-full mt-6 text-sm py-3.5"
          >
            Proceed to Checkout <ArrowRight size={16} className="ml-2" />
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Guaranteed safe & secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
