import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: central error capture
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear invalid session
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  getAllUsers: () => api.get('/api/auth/users'),
};

export const productAPI = {
  getProducts: (params) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  updateStock: (id, stock) => api.patch(`/api/products/${id}/stock`, { stock }),
  getCategories: () => api.get('/api/categories'),
  createCategory: (data) => api.post('/api/categories', data),
};

export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (item) => api.post('/api/cart', item),
  updateItem: (itemId, quantity) => api.put(`/api/cart/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/api/cart/${itemId}`),
  clearCart: () => api.delete('/api/cart'),
};

export const orderAPI = {
  createOrder: (data) => api.post('/api/orders', data),
  getUserOrders: (params) => api.get('/api/orders', { params }),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  getAllOrders: (params) => api.get('/api/orders/admin/all', { params }),
  updateOrderStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
};

export const paymentAPI = {
  createCheckoutSession: (orderId) => api.post('/api/payments/create', { orderId }),
  getPaymentStatus: (orderId) => api.get(`/api/payments/${orderId}`),
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/api/notifications', { params }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
  subscribePush: (subscription) => api.post('/api/notifications/subscribe', { subscription }),
  getPublicKey: () => api.get('/api/notifications/public-key'),
};

export default api;
