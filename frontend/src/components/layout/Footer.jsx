import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* Feature highlights */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">Ultra-Fast Delivery</h5>
              <p className="text-xs text-slate-500">Free priority shipping on orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">Secure Stripe Checkout</h5>
              <p className="text-xs text-slate-500">Encrypted PCI-compliant card processing</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">Redis & BullMQ Queued</h5>
              <p className="text-xs text-slate-500">Real-time background notifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <ShoppingBag size={18} />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900">
            Apex<span className="text-brand-600">Cart</span>
          </span>
          <span className="text-xs text-slate-400 ml-2">
            © {new Date().getFullYear()} MERN Microservices Platform
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
          <span>React.js</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>Node & Express</span>
          <span>•</span>
          <span>MongoDB</span>
          <span>•</span>
          <span>Redis</span>
          <span>•</span>
          <span>BullMQ</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
