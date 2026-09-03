import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle2, ChevronRight } from 'lucide-react';
import { orderAPI } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await orderAPI.getAllOrders(params);
      setOrders(res.data?.data?.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus, orderNumber) => {
    try {
      setUpdatingId(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      setFeedbackMessage(`Order #${orderNumber} updated to ${newStatus}. BullMQ notification queued!`);
      setTimeout(() => setFeedbackMessage(''), 4000);
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Customer Orders Management">
      <div className="space-y-6">
        {/* Status Toast Alert */}
        {feedbackMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Total results: <strong className="text-slate-900">{orders.length}</strong>
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <LoadingSpinner message="Loading orders..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Order #</th>
                    <th className="py-3.5 px-5">Customer & Items</th>
                    <th className="py-3.5 px-5">Amount</th>
                    <th className="py-3.5 px-5">Payment</th>
                    <th className="py-3.5 px-5">Order Status</th>
                    <th className="py-3.5 px-5">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50">
                        {/* Order ID & date */}
                        <td className="py-3.5 px-5">
                          <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Customer & items */}
                        <td className="py-3.5 px-5">
                          <p className="font-bold text-slate-800">
                            {order.shippingAddress?.fullName || 'Customer'}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {order.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          ${order.total?.toFixed(2)}
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-5">
                          <Badge status={order.paymentStatus}>{order.paymentStatus}</Badge>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5">
                          <Badge status={order.status}>{order.status}</Badge>
                        </td>

                        {/* Update status selector */}
                        <td className="py-3.5 px-5">
                          <select
                            disabled={updatingId === order._id}
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value, order.orderNumber)
                            }
                            className="bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
