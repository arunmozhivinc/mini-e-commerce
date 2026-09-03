import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  User,
  MapPin,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [existingOrderId, setExistingOrderId] = useState(null);

  if (items.length === 0 && !existingOrderId) {
    navigate('/cart');
    return null;
  }

  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const grandTotal = Math.round((subtotal + tax + shipping) * 100) / 100;

  const validate = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Full recipient name is required';
    if (!address.addressLine1.trim()) errs.addressLine1 = 'Street address is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state.trim()) errs.state = 'State / Province is required';
    if (!address.zipCode.trim()) errs.zipCode = 'ZIP / Postal code is required';
    if (!address.phone.trim()) errs.phone = 'Phone number is required';
    return errs;
  };

  const handleCreateOrderAndPay = async (e) => {
    e.preventDefault();
    setServerError('');
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setSubmitting(true);
      let targetOrderId = existingOrderId;

      // 1. Create order only if not already created
      if (!targetOrderId) {
        const orderRes = await orderAPI.createOrder({
          shippingAddress: address,
        });

        const order = orderRes.data?.data?.order;
        if (!order) {
          throw new Error('Could not create order');
        }
        targetOrderId = order._id;
        setExistingOrderId(order._id);
      }

      // 2. Request Stripe / Sandbox Checkout Session
      const paymentRes = await paymentAPI.createCheckoutSession(targetOrderId);
      const { url } = paymentRes.data?.data || {};

      if (url) {
        window.location.href = url;
      } else {
        navigate(`/payment/success?order_id=${targetOrderId}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setServerError(
        err.response?.data?.message ||
          'Payment initiation failed. Please ensure all backend microservices are running.'
      );
      setSubmitting(false);
    }
  };

  const fillSampleAddress = () => {
    setAddress({
      fullName: user?.name || 'Alex Johnson',
      addressLine1: '742 Evergreen Terrace',
      addressLine2: 'Suite 101',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      country: 'United States',
      phone: '+1 (555) 019-2834',
    });
    setErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Checkout & Payment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your delivery details and choose your payment method
        </p>
      </div>

      {serverError && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleCreateOrderAndPay}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Shipping Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Shipping Information</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fillSampleAddress}
                type="button"
                className="text-xs"
              >
                Autofill Demo Address
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Recipient Name"
                placeholder="Alex Johnson"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                error={errors.fullName}
                icon={User}
              />

              <Input
                label="Street Address"
                placeholder="123 Market St"
                value={address.addressLine1}
                onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                error={errors.addressLine1}
                icon={MapPin}
              />

              <Input
                label="Apartment, suite, etc. (optional)"
                placeholder="Apt 4B"
                value={address.addressLine2}
                onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="City"
                  placeholder="New York"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  error={errors.city}
                />
                <Input
                  label="State / Province"
                  placeholder="NY"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  error={errors.state}
                />
                <Input
                  label="ZIP Code"
                  placeholder="10001"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  error={errors.zipCode}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  error={errors.phone}
                  icon={Phone}
                />
              </div>
            </div>

            {/* Payment Method Selector Banner */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Payment Method
              </h4>
              <div className="p-4 rounded-2xl border-2 border-brand-500 bg-brand-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Stripe Test Checkout (Hosted)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports Visa, Mastercard, AMEX in Test Sandbox Mode
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-100/80 px-2.5 py-1 rounded-md">
                  Sandbox Active
                </span>
              </div>
            </div>
          </div>

          {/* Right: Order Review */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
              Review Order ({items.length} unique items)
            </h3>

            {/* Mini items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {items.map((item) => (
                <div key={item._id} className="py-3 flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {item.quantity} × ${item.price?.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Due</span>
                <span className="text-2xl font-black text-slate-900">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              loading={submitting}
              className="w-full py-4 text-sm"
            >
              Pay ${grandTotal.toFixed(2)} with Stripe <ArrowRight size={16} className="ml-2" />
            </Button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Stripe Webhook signature verified backend processing</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
