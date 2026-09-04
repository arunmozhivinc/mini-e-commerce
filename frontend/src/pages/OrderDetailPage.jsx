import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  Download,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { orderAPI } from '../services/api';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getOrderById(id);
        if (isMounted) {
          setOrder(res.data?.data?.order);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        if (isMounted) setError('Unable to load order details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error || 'Order Not Found'}</h2>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-[#2874f0] text-white font-bold text-xs"
        >
          <ArrowLeft size={14} /> Back to My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStepIndex = Math.max(0, steps.findIndex((s) => s.key === order.status));

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-[#2874f0]">
            Home
          </Link>
          <span>/</span>
          <Link to="/orders" className="hover:text-[#2874f0]">
            My Orders
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">{order.orderNumber}</span>
        </nav>

        {/* Order Header Summary */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <Badge status={order.status}>{order.status}</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleString()} • Payment:{' '}
              <strong className="text-slate-700 capitalize">{order.paymentStatus}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Download Invoice
            </button>
          </div>
        </div>

        {/* Visual Shipment Tracking Progress Stepper (Flipkart Style) */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 sm:p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
            Delivery Status Timeline
          </h3>

          <div className="relative flex items-center justify-between max-w-2xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 w-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#388e3c] transition-all duration-500 z-0"
              style={{
                width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
              }}
            />

            {steps.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-[#388e3c] text-white shadow'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                  >
                    {isDone ? <Check size={14} /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap text-center ${
                      isDone ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column Order Details Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* Left: Ordered Items */}
          <div className="lg:col-span-8 bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Items in this Shipment ({order.items?.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, index) => (
                <div key={index} className="py-4 flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="w-16 h-16 rounded border border-slate-100 object-contain p-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Quantity: {item.quantity} • Unit Price: ${item.price?.toFixed(2)}
                      </p>
                      <span className="text-[11px] text-[#388e3c] font-bold">
                        14-Day Return Window Active
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Delivery Address & Price Details */}
          <div className="lg:col-span-4 space-y-3">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <MapPin size={15} className="text-[#2874f0]" />
                <span>Delivery Address</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">{order.shippingAddress?.fullName}</strong> <br />
                {order.shippingAddress?.addressLine1}
                {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.zipCode} <br />
                {order.shippingAddress?.country} <br />
                <span className="text-slate-500 mt-1 block">
                  Phone: {order.shippingAddress?.phone}
                </span>
              </p>
            </div>

            {/* Price Details Card */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 space-y-3 text-xs text-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                Price Breakdown
              </h4>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-bold text-slate-900">${order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold">
                  {order.shippingCost === 0 ? (
                    <span className="text-[#388e3c]">FREE</span>
                  ) : (
                    `$${order.shippingCost?.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-baseline text-sm">
                <span className="font-black text-slate-900">Total Paid</span>
                <span className="text-base font-black text-slate-900">
                  ${order.total?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-3 bg-white rounded-md border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={20} className="text-[#2874f0] flex-shrink-0" />
              <span>Verified payment processed via Stripe Webhook backend architecture</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
