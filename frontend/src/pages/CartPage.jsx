import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Heart,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { addToWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-md border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2874f0] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={30} />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1">Missing Cart Items?</h2>
          <p className="text-xs text-slate-500 mb-6">
            Log in to view items you added previously and checkout seamlessly across your devices.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}
            className="w-full py-2.5 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-xs font-bold uppercase tracking-wider shadow"
          >
            Login to Account
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-md border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-blue-50 text-[#2874f0] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Your Shopping Cart is Empty!</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            Explore our curated selection of electronics, fashion, and home goods to find great deals.
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 rounded bg-[#2874f0] hover:bg-[#1a56db] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing breakdown
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const grandTotal = Math.round((subtotal + tax + shipping) * 100) / 100;

  // Approximate original MRP for savings calculation
  const totalMRP = Math.round(subtotal * 1.35 * 100) / 100;
  const totalSavings = Math.round((totalMRP - subtotal) * 100) / 100;

  const handleSaveForLater = (item) => {
    addToWishlist({
      _id: item.product,
      name: item.name,
      price: item.price,
      images: [item.image],
    });
    removeItem(item._id);
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Marketplace 2-Column Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* LEFT COLUMN: Cart Items & Delivery Address Preview */}
          <div className="lg:col-span-8 space-y-3">
            {/* Delivery address preview strip */}
            <div className="bg-white rounded-md border border-slate-200 p-3 sm:p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin size={18} className="text-[#2874f0]" />
                <span className="text-xs text-slate-700">
                  Deliver to:{' '}
                  <strong className="text-slate-900 font-bold">
                    {user?.name || 'Customer'} (Bengaluru, 560103)
                  </strong>
                </span>
              </div>
              <Link
                to="/checkout"
                className="text-xs font-bold text-[#2874f0] hover:underline whitespace-nowrap"
              >
                Change Address
              </Link>
            </div>

            {/* Cart Items List Card */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              <div className="p-3.5 sm:p-4 bg-slate-50/70 flex items-center justify-between border-b border-slate-100">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  ApexCart ({itemCount} item{itemCount === 1 ? '' : 's'})
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              {/* Each Cart Item */}
              {items.map((item) => {
                const itemMRP = Math.round(item.price * 1.35 * 100) / 100;
                const itemDiscount = Math.max(10, Math.round(((itemMRP - item.price) / itemMRP) * 100));

                return (
                  <div
                    key={item._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5"
                  >
                    {/* Item Thumbnail & Quantity controls */}
                    <div className="flex flex-col items-center gap-3 sm:w-28 flex-shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded border border-slate-100 bg-white p-2 flex items-center justify-center">
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Quantity pill */}
                      <div className="flex items-center border border-slate-200 rounded bg-white shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item._id, item.quantity - 1);
                            } else {
                              removeItem(item._id);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900 border-x border-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <Link
                            to={`/products/${item.product}`}
                            className="text-sm font-semibold text-slate-900 hover:text-[#2874f0] transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                            Delivery by Tomorrow | <span className="text-[#388e3c]">Free</span>
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1">
                          Seller: Apex Retail Services • Apex Assured
                        </p>

                        {/* Price Hierarchy */}
                        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ${(itemMRP * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-[#388e3c]">
                            {itemDiscount}% Off
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Flipkart style: SAVE FOR LATER, REMOVE) */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => handleSaveForLater(item)}
                          className="text-slate-700 hover:text-[#2874f0] cursor-pointer flex items-center gap-1"
                        >
                          <Heart size={14} /> Save for Later
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          className="text-slate-700 hover:text-rose-600 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Place Order bar (Desktop) */}
              <div className="hidden sm:flex justify-end p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20 shadow-md">
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="px-10 py-3.5 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-sm font-bold uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  Place Order <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Price Details Card (Flipkart Sticky Sidebar) */}
          <div className="lg:col-span-4 sticky top-20 space-y-3">
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Price Details
                </h3>
              </div>

              <div className="p-4 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Price ({itemCount} item{itemCount === 1 ? '' : 's'})</span>
                  <span className="font-bold text-slate-900">${totalMRP.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-[#388e3c]">
                  <span>Discount</span>
                  <span className="font-bold">-${totalSavings.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  <span className="font-bold">
                    {shipping === 0 ? (
                      <span className="text-[#388e3c]">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-black text-slate-900">Total Amount</span>
                  <span className="text-lg font-black text-slate-900">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Green Savings Callout Banner */}
              <div className="p-3 bg-emerald-50 border-t border-emerald-100 text-center">
                <p className="text-xs font-bold text-[#388e3c]">
                  You will save ${totalSavings.toFixed(2)} on this order!
                </p>
              </div>
            </div>

            {/* Safe & Secure Guarantee */}
            <div className="flex items-center gap-2.5 p-3 rounded-md bg-white border border-slate-200 text-xs text-slate-500">
              <ShieldCheck size={26} className="text-[#2874f0] flex-shrink-0" />
              <p className="text-[11px] leading-snug">
                Safe and Secure Payments. Easy returns. 100% Authentic products.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom "Place Order" Bar */}
      <div className="sm:hidden fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Total Payable
          </span>
          <span className="text-base font-black text-slate-900">${grandTotal.toFixed(2)}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="py-2.5 px-6 rounded bg-[#fb641b] text-white text-xs font-bold uppercase tracking-wider shadow"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CartPage;
