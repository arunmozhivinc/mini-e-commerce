import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Check, RefreshCw } from 'lucide-react';
import { productAPI } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [savingStock, setSavingStock] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getProducts({ limit: 50, search: search.trim() });
      setProducts(res.data?.data?.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      setDeletingId(id);
      await productAPI.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStock = async (id) => {
    const stockVal = parseInt(stockInput, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      alert('Please enter a valid non-negative number for stock.');
      return;
    }
    try {
      setSavingStock(true);
      const res = await productAPI.updateStock(id, stockVal);
      const updated = res.data?.data?.product;
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock: updated.stock } : p))
      );
      setEditingStockId(null);
    } catch (err) {
      alert('Failed to update stock');
    } finally {
      setSavingStock(false);
    }
  };

  return (
    <AdminLayout title="Product Catalog Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="max-w-md w-full">
            <Input
              placeholder="Search products by title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <Link to="/admin/products/new">
            <Button variant="primary" size="md">
              <Plus size={16} className="mr-1.5" /> Add New Product
            </Button>
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <LoadingSpinner message="Loading products..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Product</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Price</th>
                    <th className="py-3.5 px-5">Stock Level</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        {/* Product info */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                              <span className="text-[10px] font-mono text-slate-400">
                                SKU: {p.sku || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-5 font-medium text-slate-700">
                          {p.category?.name || 'Uncategorized'}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          ${p.price?.toFixed(2)}
                        </td>

                        {/* Stock quick-edit */}
                        <td className="py-3.5 px-5">
                          {editingStockId === p._id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                className="w-16 px-2 py-1 border border-brand-500 rounded-lg text-xs font-bold text-slate-900 outline-none"
                                value={stockInput}
                                onChange={(e) => setStockInput(e.target.value)}
                                autoFocus
                              />
                              <button
                                type="button"
                                disabled={savingStock}
                                onClick={() => handleUpdateStock(p._id)}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                                title="Save stock"
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                  p.stock <= 0
                                    ? 'bg-rose-50 text-rose-700'
                                    : p.stock < 10
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {p.stock} units
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStockId(p._id);
                                  setStockInput(p.stock.toString());
                                }}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/products/${p._id}/edit`}>
                              <button
                                type="button"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 size={15} />
                              </button>
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === p._id}
                              onClick={() => handleDelete(p._id, p.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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

export default AdminProductsPage;
