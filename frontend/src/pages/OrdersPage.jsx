import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Calendar, ChevronRight } from 'lucide-react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <LoadingSpinner size="lg" message="Loading your order history..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review past purchases, shipment statuses, and payment receipts
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders placed yet"
          description="You haven't made any purchases with ApexCart yet. Browse our catalog to place your first order!"
          actionLabel="Explore Products"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {order.orderNumber}
                  </span>
                  <Badge status={order.status}>{order.status}</Badge>
                  <Badge status={order.paymentStatus}>
                    Payment: {order.paymentStatus}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0)} item
                    {order.items?.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Thumbnails preview */}
                <div className="flex gap-2 pt-2 overflow-x-auto">
                  {order.items?.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                      title={item.name}
                    />
                  ))}
                  {order.items?.length > 4 && (
                    <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center">
                      +{order.items.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 gap-2">
                <span className="text-xl font-black text-slate-900">
                  ${order.total?.toFixed(2)}
                </span>
                <Link to={`/orders/${order._id}`}>
                  <Button variant="outline" size="sm">
                    Details <ChevronRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
