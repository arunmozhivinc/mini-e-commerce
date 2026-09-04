import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please provide a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(password)) errs.password = 'Password must contain at least one number';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please check your info and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#f1f3f6] flex items-center justify-center p-3 sm:p-6">
      {/* Flipkart-Style Split-Screen Register Card */}
      <div className="max-w-3xl w-full bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* LEFT COLUMN: Blue Informational Banner */}
        <div className="md:col-span-5 bg-[#2874f0] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Looks like you're new here!
            </h2>
            <p className="mt-3 text-sm text-blue-100 leading-relaxed font-normal">
              Sign up with your email address to get started with ApexCart.
            </p>
          </div>

          <div className="relative z-10 pt-10">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-4">
              <ShoppingBag size={48} className="text-[#ffe500]" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
              <Sparkles size={14} className="text-[#ffe500]" />
              <span>Instant Welcome Coupons Available</span>
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* RIGHT COLUMN: Register Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {serverError && (
              <div className="mb-5 p-3.5 rounded bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                error={errors.name}
                icon={User}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
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
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                error={errors.password}
                icon={Lock}
                helperText="At least 6 characters with at least 1 number"
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                error={errors.confirmPassword}
                icon={Lock}
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded bg-[#fb641b] hover:bg-[#e65100] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-4"
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </button>
            </form>
          </div>

          <div className="pt-6 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-[#2874f0] hover:underline"
            >
              Existing User? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
