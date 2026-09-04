import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please provide a valid email';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@example.com');
    setPassword('Admin123!');
  };

  const fillDemoCustomer = () => {
    setEmail('john@example.com');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] bg-[#f1f3f6] flex items-center justify-center p-3 sm:p-6">
      {/* Flipkart-Style Split-Screen Auth Card */}
      <div className="max-w-3xl w-full bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* LEFT COLUMN: Flipkart Royal Blue Informational Banner (40%) */}
        <div className="md:col-span-5 bg-[#2874f0] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Login
            </h2>
            <p className="mt-3 text-sm text-blue-100 leading-relaxed font-normal">
              Get access to your Orders, Wishlist, and Recommendations.
            </p>
          </div>

          <div className="relative z-10 pt-10">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-4">
              <ShoppingBag size={48} className="text-[#ffe500]" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
              <Sparkles size={14} className="text-[#ffe500]" />
              <span>ApexCart Verified Marketplace</span>
            </div>
          </div>

          {/* Background decorative circles */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* RIGHT COLUMN: Auth Form & Actions (60%) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {serverError && (
              <div className="mb-5 p-3.5 rounded bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Enter Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                error={errors.email}
                icon={Mail}
                autoComplete="email"
              />

              <Input
                label="Enter Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                error={errors.password}
                icon={Lock}
                autoComplete="current-password"
              />

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By continuing, you agree to ApexCart's{' '}
                <span className="text-[#2874f0] font-semibold hover:underline cursor-pointer">
                  Terms of Use
                </span>{' '}
                and{' '}
                <span className="text-[#2874f0] font-semibold hover:underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-4"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
                Quick Test Credentials
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="py-1.5 px-3 rounded border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer"
                >
                  Admin Credentials
                </button>
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  className="py-1.5 px-3 rounded border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer"
                >
                  Customer Credentials
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center">
            <Link
              to="/register"
              className="text-xs font-bold text-[#2874f0] hover:underline"
            >
              New to ApexCart? Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
