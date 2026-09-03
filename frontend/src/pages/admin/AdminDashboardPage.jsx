import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
} from 'lucide-react';
import { orderAPI, productAPI } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          orderAPI.getAllOrders({ limit: 10 }),
          productAPI.getProducts({ limit: 1 }),
        ]);

        setOrders(ordersRes.data?.data?.orders || []);
        setProductsCount(productsRes.data?.data?.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => (order.paymentStatus === 'completed' ? sum + order.total : sum),
    0
  );

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed'
  ).length;

  return (
    <AdminLayout title="Operations Overview">
      {loading ? (
        <LoadingSpinner message="Aggregating metrics..." />
      ) : (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Revenue
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-3">
                ${totalRevenue.toFixed(2)}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                Verified settled payments
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-3">{orders.length}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Across all customers</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Catalog Items
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-3">{productsCount}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Active listed SKUs</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Action Required
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-3">{pendingOrdersCount}</p>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                Pending fulfillment
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory & Order Controls</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your product catalog, adjust warehouse stock, or process shipments.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/products/new">
                <Button variant="primary" size="sm">
                  <Plus size={16} className="mr-1.5" /> Add New Product
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="outline" size="sm">
                  Manage All Orders <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Order #</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-5">Amount</th>
                    <th className="py-3.5 px-5">Payment</th>
                    <th className="py-3.5 px-5">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-800">
                          {order.shippingAddress?.fullName || 'Customer'}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          ${order.total?.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge status={order.paymentStatus}>{order.paymentStatus}</Badge>
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge status={order.status}>{order.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
