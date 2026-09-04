import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear client-side cart on successful checkout
    clearCart();

    if (orderId) {
      const fetchOrder = async () => {
        try {
          const res = await orderAPI.getOrderById(orderId);
          setOrder(res.data?.data?.order);
        } catch (err) {
          console.error('Error fetching order details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Verifying payment status with payment gateway..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-10 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-md border border-slate-200 shadow-md p-6 sm:p-10 text-center">
        {/* Animated Verified Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#388e3c] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={40} />
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={12} /> Payment Confirmed
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Thank you for shopping with ApexCart. Your order has been placed and queued for instant dispatch.
        </p>

        {/* Order Info Card */}
        {order && (
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-md p-5 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Order ID
                </span>
                <p className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Amount Paid
                </span>
                <p className="text-sm sm:text-base font-black text-slate-900">
                  ${order.total?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Truck size={16} className="text-[#388e3c]" />
              <span>
                Estimated Delivery: <strong className="text-slate-900">Tomorrow by 5:00 PM</strong>
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Deliver to
              </span>
              <p className="text-xs text-slate-700 leading-snug">
                {order.shippingAddress?.fullName} • {order.shippingAddress?.addressLine1},{' '}
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.zipCode}
              </p>
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {orderId && (
            <Link
              to={`/orders/${orderId}`}
              className="w-full sm:w-auto px-8 py-3 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-2"
            >
              <Package size={16} /> Track Order
            </Link>
          )}
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
