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
} from 'lucide-react';
import { orderAPI } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getOrderById(id);
        setOrder(res.data?.data?.order);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error || 'Order Not Found'}</h2>
        <Link to="/orders">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Back to My Orders
          </Button>
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

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <Badge status={order.status}>{order.status}</Badge>
            <Badge status={order.paymentStatus}>Payment: {order.paymentStatus}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar size={13} />
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Order Tracking Status
        </h3>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 transition-all duration-500 z-0"
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                >
                  {isDone ? <Check size={16} /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-[11px] font-semibold text-center whitespace-nowrap hidden sm:block ${
                    isDone ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ordered Items */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
            Items in this Shipment ({order.items?.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item, index) => (
              <div key={index} className="py-4 flex items-center gap-4">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Qty: {item.quantity} × ${item.price?.toFixed(2)}
                  </p>
                </div>
                <span className="text-xs font-black text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span className="font-semibold text-slate-900">${order.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost?.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-xl font-black text-slate-900">${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
              <MapPin size={16} className="text-brand-600" />
              <span>Delivery Address</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">{order.shippingAddress?.fullName}</strong> <br />
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.zipCode} <br />
              {order.shippingAddress?.country} <br />
              <span className="text-slate-400 mt-1 block">
                Phone: {order.shippingAddress?.phone}
              </span>
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
              <CreditCard size={16} className="text-brand-600" />
              <span>Payment Details</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-semibold text-slate-800">Stripe Card</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className="font-bold capitalize text-slate-900">{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
