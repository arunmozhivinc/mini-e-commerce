import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Star,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getUserOrders();
        setOrders(res.data?.data?.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch your orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your order history..." />
      </div>
    );
  }

  // Filter orders by search & status
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      !searchQuery.trim() ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus =
      statusFilter === 'ALL' || order.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-[#2874f0]">
            Home
          </Link>
          <span>/</span>
          <Link to="/account" className="hover:text-[#2874f0]">
            My Account
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">My Orders</span>
        </nav>

        {/* Top Search & Filter Bar (Flipkart Style) */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your orders by item title or order ID..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-xs outline-none focus:border-[#2874f0]"
            />
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs">
            {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#2874f0] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Listing */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-md border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2874f0] flex items-center justify-center mx-auto mb-3">
              <Package size={30} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No orders match your filter criteria. Try searching for something else.'
                : "You haven't placed any orders yet. Discover high-value products in our catalog!"}
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-2.5 rounded bg-[#2874f0] text-white text-xs font-bold uppercase tracking-wider"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isDelivered = order.status === 'delivered';
              const isShipped = order.status === 'shipped';

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-md border border-slate-200 hover:border-slate-300 shadow-sm transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Product preview & details */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* First product image */}
                    <img
                      src={
                        order.items?.[0]?.image ||
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded border border-slate-100 object-contain p-1 flex-shrink-0"
                    />

                    <div className="space-y-1 min-w-0">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#2874f0] transition-colors line-clamp-1"
                      >
                        {order.items?.[0]?.name || 'Marketplace Item'}
                        {order.items?.length > 1 && ` + ${order.items.length - 1} more item(s)`}
                      </Link>

                      <p className="text-[11px] text-slate-500">
                        Order ID: <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Center: Total price */}
                  <div className="md:text-center md:min-w-[100px]">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      ${order.total?.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-400 capitalize">
                      {order.paymentStatus} via Stripe
                    </span>
                  </div>

                  {/* Right: Delivery status indicator */}
                  <div className="md:min-w-[180px] space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isDelivered
                            ? 'bg-[#388e3c]'
                            : isShipped
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <strong className="text-xs font-bold text-slate-900 capitalize">
                        {order.status}
                      </strong>
                    </div>

                    <p className="text-[11px] text-slate-500 pl-4.5">
                      {isDelivered
                        ? 'Item has been successfully delivered'
                        : isShipped
                        ? 'Package is in transit with courier'
                        : 'Order is being processed'}
                    </p>
                  </div>

                  {/* Action link */}
                  <div className="pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-end">
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-1.5 rounded border border-[#2874f0] text-[#2874f0] hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      Track Order <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
