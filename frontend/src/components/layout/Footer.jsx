import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  CreditCard,
  Headphones,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#172337] text-white text-xs mt-16 border-t border-slate-700 pb-16 md:pb-0">
      {/* Top Value Assurance Strip */}
      <div className="border-b border-slate-700/60 bg-[#121c2c] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-[#2874f0] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">100% Authentic</p>
              <p className="text-[11px] text-slate-400">Verified products directly sourced</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">14-Day Hassle Free Return</p>
              <p className="text-[11px] text-slate-400">Easy pickup & instant refund</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[#ff9f00] flex items-center justify-center flex-shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">Free Express Shipping</p>
              <p className="text-[11px] text-slate-400">On all qualified orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">100% Secure Payments</p>
              <p className="text-[11px] text-slate-400">Encrypted Stripe PCI DSS checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-700/60 pb-10">
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              About
            </h5>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li><Link to="/" className="hover:underline">Contact Us</Link></li>
              <li><Link to="/" className="hover:underline">About Us</Link></li>
              <li><Link to="/" className="hover:underline">Careers</Link></li>
              <li><Link to="/" className="hover:underline">ApexCart Stories</Link></li>
              <li><Link to="/" className="hover:underline">Press Releases</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Help & Support
            </h5>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li><Link to="/orders" className="hover:underline">Payments & Billing</Link></li>
              <li><Link to="/orders" className="hover:underline">Shipping & Tracking</Link></li>
              <li><Link to="/orders" className="hover:underline">Cancellation & Returns</Link></li>
              <li><Link to="/" className="hover:underline">FAQ</Link></li>
              <li><Link to="/" className="hover:underline">Report Infringement</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Consumer Policy
            </h5>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li><span className="cursor-pointer hover:underline">Return Policy</span></li>
              <li><span className="cursor-pointer hover:underline">Terms Of Use</span></li>
              <li><span className="cursor-pointer hover:underline">Security</span></li>
              <li><span className="cursor-pointer hover:underline">Privacy Notice</span></li>
              <li><span className="cursor-pointer hover:underline">Sitemap</span></li>
            </ul>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-slate-700/60 pt-6 md:pt-0 md:pl-6">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Mail Us
            </h5>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ApexCart Internet Private Limited,<br />
              Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
              Outer Ring Road, Bengaluru, 560103,<br />
              Karnataka, India
            </p>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-slate-700/60 pt-6 md:pt-0 md:pl-6">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Registered Office
            </h5>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ApexCart Commerce Hub,<br />
              CIN: U51109KA2012PTC066107<br />
              Telephone: 044-45614700 / 044-67415800<br />
              Support: 24x7 Customer Care
            </p>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-semibold">
            <span className="flex items-center gap-1.5 text-white">
              <Sparkles size={14} className="text-[#ffe500]" /> Become a Seller
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <ShoppingBag size={14} className="text-[#ffe500]" /> Gift Cards
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <Headphones size={14} className="text-[#ffe500]" /> Help Center
            </span>
          </div>

          <div>
            © {new Date().getFullYear()} ApexCart.com — Microservices Marketplace Platform
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
