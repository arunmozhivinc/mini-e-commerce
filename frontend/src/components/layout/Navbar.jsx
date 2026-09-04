import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Bell,
  User,
  LogOut,
  Shield,
  Package,
  Search,
  ChevronDown,
  Sparkles,
  Star,
  X,
  Menu,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';

const POPULAR_SEARCHES = [
  'Wireless Headphones',
  'Smartphones',
  'Running Shoes',
  'Mechanical Keyboard',
  'Chef Knife Set',
  'Denim Jacket',
];

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const {
    notifications,
    unreadCount,
    isPushSubscribed,
    markAsRead,
    markAllAsRead,
    subscribeToPush,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (query) => {
    setSearchQuery(query);
    setIsSearchFocused(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-md">
      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Mobile Hamburger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 md:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo with Flipkart-inspired 'Plus' badge */}
            <Link to="/" className="flex flex-col group py-1">
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white flex items-center leading-none">
                Apex<span className="text-[#ffe500]">Cart</span>
              </span>
              <span className="text-[10px] italic text-slate-100 flex items-center gap-0.5 tracking-wide hover:underline leading-tight">
                Explore <span className="text-[#ffe500] font-bold">Plus</span>
                <Sparkles size={10} className="text-[#ffe500] fill-[#ffe500]" />
              </span>
            </Link>
          </div>

          {/* Flipkart-Style Large Search Bar */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-2xl relative"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Products, Brands and More"
                className="w-full h-10 pl-4 pr-11 bg-white text-slate-900 text-sm placeholder:text-slate-500 rounded-sm shadow-inner outline-none focus:ring-2 focus:ring-[#ffe500]/70 transition-all font-normal"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-[#2874f0] hover:text-[#1a56db] cursor-pointer"
                aria-label="Submit search"
              >
                <Search size={19} className="stroke-[2.5]" />
              </button>
            </form>

            {/* Search Suggestions Flyout */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800 animate-in fade-in duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#2874f0]" /> Popular Searches
                  </span>
                  <span className="text-[11px] text-slate-400">Instant Results</span>
                </div>
                <div className="divide-y divide-slate-50 py-1">
                  {POPULAR_SEARCHES.map((term, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(term)}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-50/80 hover:text-[#2874f0] flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <span className="flex items-center gap-2.5">
                        <Search size={14} className="text-slate-400 group-hover:text-[#2874f0]" />
                        {term}
                      </span>
                      <ArrowRight size={13} className="text-slate-300 group-hover:text-[#2874f0] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <Link
                    to="/products"
                    onClick={() => setIsSearchFocused(false)}
                    className="font-bold text-[#2874f0] hover:underline"
                  >
                    View All Products in Catalog →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsSearchFocused(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-5 sm:gap-7">
            {/* User Login/Account Button */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 font-semibold text-sm hover:text-[#ffe500] transition-colors py-1 cursor-pointer"
                >
                  <span className="truncate max-w-[120px]">{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Account Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 divide-y divide-slate-100 animate-in fade-in duration-150">
                    <div className="px-4 py-3 bg-slate-50/70">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2874f0] capitalize">
                          {user?.role} Account
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <Sparkles size={11} /> Apex Plus Member
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors"
                      >
                        <User size={16} className="text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors"
                      >
                        <Package size={16} className="text-slate-400" />
                        Orders & Returns
                      </Link>

                      <Link
                        to="/account?tab=wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] transition-colors"
                      >
                        <Heart size={16} className="text-slate-400" />
                        Wishlist ({wishlistCount})
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
                        >
                          <Shield size={16} className="text-indigo-600" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-[#2874f0] hover:bg-blue-50 px-6 py-1.5 rounded-sm text-sm font-bold tracking-wide shadow-sm transition-all"
              >
                Login
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              to={isAuthenticated ? '/account?tab=wishlist' : '/login'}
              className="flex items-center gap-1.5 font-semibold text-sm hover:text-[#ffe500] transition-colors relative py-1"
              title="Wishlist"
            >
              <Heart size={19} />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 font-semibold text-sm hover:text-[#ffe500] transition-colors relative py-1"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#fb641b] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#2874f0]">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

            {/* Notifications Flyout */}
            {isAuthenticated && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800 animate-in fade-in duration-150">
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Marketplace Alerts
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-[#2874f0] hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {!isPushSubscribed && (
                      <div className="bg-blue-50 p-2.5 border-b border-blue-100 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#1a56db] font-medium text-[11px]">
                          Enable real-time push alerts?
                        </span>
                        <button
                          type="button"
                          onClick={subscribeToPush}
                          className="px-2.5 py-1 rounded bg-[#2874f0] text-white text-[10px] font-bold hover:bg-[#1a56db]"
                        >
                          Enable
                        </button>
                      </div>
                    )}

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => !notif.read && markAsRead(notif._id)}
                            className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                              !notif.read ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-[#2874f0] flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Right Action Icons */}
          <div className="flex items-center gap-2.5 md:hidden">
            <Link to="/cart" className="relative p-1.5 text-white">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-[#fb641b] text-white text-[9px] font-black flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white text-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="bg-[#2874f0] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black">
                  {user ? user.name?.charAt(0).toUpperCase() : <User size={18} />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">
                    {user ? user.name : 'Welcome, Guest'}
                  </p>
                  <p className="text-[10px] text-slate-200">
                    {user ? user.email : 'Sign in to access your orders'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-2">
              <div className="py-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Sparkles size={16} className="text-[#2874f0]" />
                  Explore Marketplace
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ShoppingBag size={16} className="text-[#2874f0]" />
                  All Products
                </Link>
              </div>

              <div className="py-2">
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Package size={16} className="text-slate-500" />
                  My Orders
                </Link>
                <Link
                  to="/account?tab=wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Heart size={16} className="text-slate-500" />
                  My Wishlist ({wishlistCount})
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} className="text-slate-500" />
                  My Profile & Addresses
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                  >
                    <Shield size={16} className="text-indigo-600" />
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="p-4">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-rose-50 text-rose-700 font-bold text-xs"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 px-4 text-center rounded bg-[#2874f0] text-white font-bold text-xs"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 px-4 text-center rounded border border-[#2874f0] text-[#2874f0] font-bold text-xs"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
