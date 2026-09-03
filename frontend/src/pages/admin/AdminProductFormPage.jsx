import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import { productAPI } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
    images: [''],
    featured: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const catRes = await productAPI.getCategories();
        setCategories(catRes.data?.data?.categories || []);

        if (isEditMode) {
          const prodRes = await productAPI.getProductById(id);
          const p = prodRes.data?.data?.product;
          if (p) {
            setFormData({
              name: p.name || '',
              description: p.description || '',
              price: p.price?.toString() || '',
              stock: p.stock?.toString() || '',
              category: p.category?._id || p.category || '',
              sku: p.sku || '',
              images: p.images && p.images.length > 0 ? p.images : [''],
              featured: !!p.featured,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load product data:', err);
        setServerError('Could not fetch product information.');
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [id, isEditMode]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errs.price = 'Please enter a valid price';
    }
    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock, 10) < 0) {
      errs.stock = 'Please enter a valid stock level';
    }
    if (!formData.category) errs.category = 'Category selection is required';
    if (!formData.images[0]?.trim()) errs.image = 'At least one primary image URL is required';
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
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category: formData.category,
        sku: formData.sku?.trim() || undefined,
        images: formData.images.filter((img) => img.trim().length > 0),
        featured: formData.featured,
      };

      if (isEditMode) {
        await productAPI.updateProduct(id, payload);
      } else {
        await productAPI.createProduct(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Save product error:', err);
      setServerError(
        err.response?.data?.message || 'Failed to save product. Please check the inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    if (formData.images.length === 1) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <AdminLayout title="Product Editor">
        <LoadingSpinner message="Loading product data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditMode ? 'Edit Product' : 'Create New Product'}>
      <div className="max-w-3xl mx-auto">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Product Title"
              placeholder="e.g. Wireless Over-Ear Headphones"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-colors"
                placeholder="Detailed specifications, features, and dimensions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Price ($ USD)"
                type="number"
                step="0.01"
                min="0"
                placeholder="49.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                error={errors.price}
              />

              <Input
                label="Stock Level"
                type="number"
                min="0"
                placeholder="100"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                error={errors.stock}
              />

              <Input
                label="SKU Code"
                placeholder="ELEC-WLS-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Product Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-colors"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.category}</p>
              )}
            </div>

            {/* Image URLs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Product Image URLs
                </label>
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                >
                  + Add Another Image
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imgUrl}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      icon={ImageIcon}
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(idx)}
                        className="px-2.5 py-2 text-rose-500 hover:text-rose-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.image && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.image}</p>
              )}
            </div>

            {/* Featured checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Feature on homepage banner
              </label>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link to="/admin/products">
                <Button variant="ghost" size="md">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" size="md" loading={submitting}>
                <Save size={16} className="mr-1.5" />
                {isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductFormPage;
