import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AccountPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const activeTab = searchParams.get('tab') || 'profile';

  // Saved addresses mock stored in local state/storage
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('apex_saved_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'addr-1',
        fullName: user?.name || 'Alex Johnson',
        phone: '+1 (555) 019-2834',
        type: 'HOME',
        addressLine: '742 Evergreen Terrace, Suite 101, Springfield, IL - 62704',
        isDefault: true,
      },
    ];
  });

  const [newAddrModal, setNewAddrModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    type: 'HOME',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.addressLine) return;
    const item = {
      id: `addr-${Date.now()}`,
      ...newAddr,
      isDefault: addresses.length === 0,
    };
    const updated = [item, ...addresses];
    setAddresses(updated);
    localStorage.setItem('apex_saved_addresses', JSON.stringify(updated));
    setNewAddrModal(false);
    setNewAddr({ fullName: '', phone: '', addressLine: '', type: 'HOME' });
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('apex_saved_addresses', JSON.stringify(updated));
  };

  const handleMoveToCart = async (product) => {
    await addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-5">
        {/* Marketplace 2-Column Account Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: User Profile Overview & Navigation Cards */}
          <aside className="lg:col-span-4 space-y-3">
            {/* User Greeting Card */}
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#2874f0] text-white flex items-center justify-center font-black text-lg shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-slate-400 block font-medium">Hello,</span>
                <h2 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h2>
                <span className="text-[10px] font-bold text-[#2874f0] bg-blue-50 px-2 py-0.5 rounded capitalize">
                  {user?.role} Account
                </span>
              </div>
            </div>

            {/* Navigation List Card */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden text-xs font-semibold">
              {/* My Orders */}
              <div className="p-3">
                <Link
                  to="/orders"
                  className="flex items-center justify-between text-slate-700 hover:text-[#2874f0] transition-colors py-1"
                >
                  <span className="flex items-center gap-3">
                    <Package size={17} className="text-[#2874f0]" />
                    MY ORDERS
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              </div>

              {/* Account Settings group */}
              <div className="p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Account Settings
                </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-[#2874f0] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <User size={16} /> Profile Information
                  </span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('addresses')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    activeTab === 'addresses'
                      ? 'bg-blue-50 text-[#2874f0] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <MapPin size={16} /> Manage Addresses ({addresses.length})
                  </span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* My Stuff group */}
              <div className="p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  My Stuff
                </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('wishlist')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    activeTab === 'wishlist'
                      ? 'bg-blue-50 text-[#2874f0] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Heart size={16} /> My Wishlist ({wishlist.length})
                  </span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('notifications')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-[#2874f0] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Bell size={16} /> All Notifications
                  </span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Logout Button */}
              <div className="p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-1.5 px-2 text-rose-600 hover:bg-rose-50 rounded transition-colors text-left cursor-pointer font-bold"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT: Content Area by Active Tab */}
          <main className="lg:col-span-8">
            {/* 1. TAB: PROFILE INFORMATION */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your identity, login email, and security settings
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <Input label="Full Name" value={user?.name || ''} readOnly />
                  <Input label="Email Address" value={user?.email || ''} readOnly />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Account Role
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded bg-blue-50 text-[#2874f0] text-xs font-bold capitalize">
                        {user?.role}
                      </span>
                      <span className="text-xs text-slate-400">
                        Restricted based on role privileges
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <Shield size={16} className="text-[#388e3c]" />
                  <span>Your account credentials are encrypted with bcrypt and JWT signatures.</span>
                </div>
              </div>
            )}

            {/* 2. TAB: MANAGE ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Manage Addresses
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Save multiple delivery addresses for seamless checkout
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewAddrModal(true)}
                    className="px-3 py-1.5 rounded bg-[#2874f0] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1a56db] cursor-pointer"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                </div>

                {/* Add address inline form */}
                {newAddrModal && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="bg-slate-50 border border-blue-200 rounded-md p-4 space-y-3"
                  >
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Add New Address
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Recipient Name"
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Mobile Number"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      placeholder="Street Address, City, State, ZIP"
                      value={newAddr.addressLine}
                      onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                      required
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setNewAddrModal(false)}
                        className="px-3 py-1.5 rounded border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded bg-[#2874f0] text-white text-xs font-bold"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved addresses list */}
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border border-slate-200 rounded-md p-4 hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {addr.type || 'HOME'}
                          </span>
                          <strong className="text-xs font-bold text-slate-900">
                            {addr.fullName}
                          </strong>
                          <span className="text-xs text-slate-500">{addr.phone}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.addressLine}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      My Wishlist ({wishlist.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Saved items ready to be moved to your shopping cart
                    </p>
                  </div>
                  {wishlist.length > 0 && (
                    <button
                      type="button"
                      onClick={clearWishlist}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Empty Wishlist
                    </button>
                  )}
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                      <Heart size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Your wishlist is empty!</h4>
                    <p className="text-xs text-slate-500 mb-5">
                      Explore more items and tap the heart icon to save products here.
                    </p>
                    <Link
                      to="/products"
                      className="inline-block px-6 py-2.5 rounded bg-[#2874f0] text-white text-xs font-bold"
                    >
                      Discover Products
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {wishlist.map((item) => (
                      <div
                        key={item._id}
                        className="py-4 flex flex-col sm:flex-row items-center gap-4 justify-between"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <img
                            src={
                              item.images?.[0] ||
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-16 h-16 rounded object-contain border border-slate-100 p-1 flex-shrink-0"
                          />
                          <div>
                            <Link
                              to={`/products/${item._id}`}
                              className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#2874f0] line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm font-black text-slate-900 mt-1">
                              ${item.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleMoveToCart(item)}
                            className="px-4 py-2 rounded bg-[#ff9f00] hover:bg-[#f39700] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag size={14} /> Move to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Notifications
                    </h3>
                    <p className="text-xs text-slate-500">Order updates, payment logs, and alerts</p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-[#2874f0] hover:underline cursor-pointer"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No notifications recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => !notif.read && markAsRead(notif._id)}
                        className={`py-3.5 px-3 rounded-md transition-colors cursor-pointer ${
                          !notif.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-slate-900">{notif.title}</strong>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
