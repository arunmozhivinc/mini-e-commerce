import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
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
    return <LoadingSpinner message="Verifying payment status with payment gateway..." />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Animated Success Icon */}
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 size={42} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
        <Sparkles size={12} />
        Payment Verified
      </div>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
        Thank You for Your Order!
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        Your payment has been successfully authorized and confirmed via our secure webhook. A background worker has queued your push and order notifications.
      </p>

      {/* Order Info Card */}
      {order && (
        <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 text-left shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Order Number
              </span>
              <p className="text-sm font-mono font-bold text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Amount Paid
              </span>
              <p className="text-sm font-black text-slate-900">${order.total?.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Shipping Address
            </span>
            <p className="text-xs text-slate-700 mt-1">
              {order.shippingAddress?.fullName} <br />
              {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city},{' '}
              {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Items Ordered ({order.items?.length || 0})
            </span>
            <div className="mt-2 divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-xs">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        {orderId && (
          <Link to={`/orders/${orderId}`}>
            <Button variant="primary">
              <Package size={16} className="mr-2" /> Track Order Status
            </Button>
          </Link>
        )}
        <Link to="/">
          <Button variant="outline">
            <ShoppingBag size={16} className="mr-2" /> Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
