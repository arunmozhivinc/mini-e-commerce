import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  User,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles,
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

  // Active accordion step (1: Login, 2: Address, 3: Summary, 4: Payment)
  const [currentStep, setCurrentStep] = useState(2);

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
  const totalMRP = Math.round(subtotal * 1.35 * 100) / 100;
  const totalSavings = Math.round((totalMRP - subtotal) * 100) / 100;

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

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    setCurrentStep(3); // Proceed to Order Summary step
  };

  const handleProceedToPayment = () => {
    setCurrentStep(4); // Proceed to Payment step
  };

  const handleCreateOrderAndPay = async (e) => {
    e.preventDefault();
    setServerError('');
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setCurrentStep(2);
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
    <div className="min-h-screen bg-[#f1f3f6] pb-16">
      {/* Checkout Minimal Top Header */}
      <div className="bg-[#2874f0] text-white py-3 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 italic text-xl font-black">
            Apex<span className="text-[#ffe500]">Cart</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-white/90">
            <Lock size={14} className="text-[#ffe500]" /> 100% Safe & Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-5">
        {serverError && (
          <div className="mb-5 p-4 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Accordion 4-Step Checkout Flow (Flipkart Style) */}
          <div className="lg:col-span-8 space-y-3">
            {/* STEP 1: LOGIN / ACCOUNT */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3.5 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#2874f0] text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                    Login / Account
                  </h3>
                  <CheckCircle2 size={16} className="text-[#388e3c]" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {user?.name} ({user?.email})
                </span>
              </div>
            </div>

            {/* STEP 2: DELIVERY ADDRESS */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div
                onClick={() => setCurrentStep(2)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  currentStep === 2 ? 'bg-[#2874f0] text-white' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                      currentStep === 2
                        ? 'bg-white text-[#2874f0]'
                        : 'bg-[#2874f0] text-white'
                    }`}
                  >
                    2
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Delivery Address
                  </h3>
                  {currentStep > 2 && <CheckCircle2 size={16} className="text-[#388e3c]" />}
                </div>

                {currentStep !== 2 && address.addressLine1 && (
                  <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
                    {address.fullName}, {address.city}
                  </span>
                )}
              </div>

              {currentStep === 2 && (
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <p className="text-xs text-slate-500">
                      Enter the address where you would like your order delivered.
                    </p>
                    <button
                      type="button"
                      onClick={fillSampleAddress}
                      className="px-3 py-1 rounded border border-[#2874f0] text-[#2874f0] hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Autofill Demo Address
                    </button>
                  </div>

                  <form onSubmit={handleAddressSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Full Recipient Name"
                        placeholder="Alex Johnson"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        error={errors.fullName}
                        icon={User}
                      />
                      <Input
                        label="10-Digit Mobile Number"
                        placeholder="+1 (555) 000-0000"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        error={errors.phone}
                        icon={Phone}
                      />
                    </div>

                    <Input
                      label="Street Address / Building Name"
                      placeholder="742 Evergreen Terrace"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      error={errors.addressLine1}
                      icon={MapPin}
                    />

                    <Input
                      label="Apartment, Suite, Landmark (Optional)"
                      placeholder="Apt 4B, Near Central Park"
                      value={address.addressLine2}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="City"
                        placeholder="Springfield"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        error={errors.city}
                      />
                      <Input
                        label="State / Province"
                        placeholder="IL"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        error={errors.state}
                      />
                      <Input
                        label="Pincode / Postal Code"
                        placeholder="62704"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        error={errors.zipCode}
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="px-8 py-3 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-95"
                      >
                        Deliver Here
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* STEP 3: ORDER SUMMARY */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div
                onClick={() => {
                  if (currentStep > 2) setCurrentStep(3);
                }}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  currentStep === 3 ? 'bg-[#2874f0] text-white' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                      currentStep === 3
                        ? 'bg-white text-[#2874f0]'
                        : 'bg-[#2874f0] text-white'
                    }`}
                  >
                    3
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Order Summary
                  </h3>
                  {currentStep > 3 && <CheckCircle2 size={16} className="text-[#388e3c]" />}
                </div>

                <span className="text-xs font-semibold">
                  {items.length} item{items.length === 1 ? '' : 's'}
                </span>
              </div>

              {currentStep === 3 && (
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <div key={item._id} className="py-3 flex items-center gap-4">
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-16 h-16 rounded object-contain border border-slate-100 p-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Quantity: {item.quantity} • Free delivery eligible
                          </p>
                          <p className="text-xs font-black text-slate-900 mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Order confirmation email will be sent to <strong>{user?.email}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="px-8 py-3 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-95"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: PAYMENT OPTIONS */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div
                className={`p-3.5 flex items-center justify-between ${
                  currentStep === 4 ? 'bg-[#2874f0] text-white' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                      currentStep === 4
                        ? 'bg-white text-[#2874f0]'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    4
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Payment Options
                  </h3>
                </div>
              </div>

              {currentStep === 4 && (
                <div className="p-4 sm:p-6 space-y-5">
                  <div className="p-4 rounded border-2 border-[#2874f0] bg-blue-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#2874f0] text-white flex items-center justify-center">
                        <CreditCard size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Stripe Test Sandbox Payment
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Visa, Mastercard, AMEX & Net Banking in Sandbox Mode
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#2874f0] bg-blue-100 px-2 py-0.5 rounded">
                      Verified Secure
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-[#388e3c]" />
                      256-Bit SSL Encrypted Payment with Stripe Webhooks
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Sparkles size={16} className="text-[#2874f0]" />
                      Real-time BullMQ background order processing
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleCreateOrderAndPay}
                      className="w-full sm:w-auto px-10 py-3.5 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-sm font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? 'Initiating Payment...' : `Pay $${grandTotal.toFixed(2)} with Stripe`}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Price Details Summary Sidebar */}
          <div className="lg:col-span-4 sticky top-20 space-y-3">
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Price Details
                </h3>
              </div>

              <div className="p-4 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Price ({items.length} item{items.length === 1 ? '' : 's'})</span>
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
                  <span className="font-black text-slate-900">Total Payable</span>
                  <span className="text-lg font-black text-slate-900">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border-t border-emerald-100 text-center">
                <p className="text-xs font-bold text-[#388e3c]">
                  Your Total Savings on this order is ${totalSavings.toFixed(2)}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-md bg-white border border-slate-200 text-xs text-slate-500">
              <ShieldCheck size={26} className="text-[#2874f0] flex-shrink-0" />
              <p className="text-[11px] leading-snug">
                Safe and Secure Payments. Easy returns. 100% Authentic products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
