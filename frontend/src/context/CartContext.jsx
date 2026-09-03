import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      const cartData = res.data?.data?.cart;
      if (cartData) {
        setItems(cartData.items || []);
        setSubtotal(cartData.subtotal || 0);
        setItemCount(cartData.itemCount || 0);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      return false;
    }
    try {
      const res = await cartAPI.addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity,
      });
      const cartData = res.data?.data?.cart;
      if (cartData) {
        setItems(cartData.items || []);
        setSubtotal(cartData.subtotal || 0);
        setItemCount(cartData.itemCount || 0);
      }
      return true;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartAPI.updateItem(itemId, quantity);
      const cartData = res.data?.data?.cart;
      if (cartData) {
        setItems(cartData.items || []);
        setSubtotal(cartData.subtotal || 0);
        setItemCount(cartData.itemCount || 0);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartAPI.removeItem(itemId);
      const cartData = res.data?.data?.cart;
      if (cartData) {
        setItems(cartData.items || []);
        setSubtotal(cartData.subtotal || 0);
        setItemCount(cartData.itemCount || 0);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const value = {
    items,
    subtotal,
    itemCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
