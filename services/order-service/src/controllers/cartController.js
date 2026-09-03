const Cart = require('../models/Cart');
const { logger } = require('shared/src/index');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = { items: [], user: req.user.id };
    }
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({
      success: true,
      data: {
        cart: {
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      },
    });
  } catch (error) {
    logger.error('Get cart error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, name, price, image, quantity = 1 } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Product details are required' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if product already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        name,
        price,
        image: image || '',
        quantity,
      });
    }

    await cart.save();
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: {
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      },
    });
  } catch (error) {
    logger.error('Add to cart error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({
      success: true,
      data: {
        cart: {
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
        },
      },
    });
  } catch (error) {
    logger.error('Update cart error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: {
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
        },
      },
    });
  } catch (error) {
    logger.error('Remove cart item error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.json({
      success: true,
      message: 'Cart cleared',
      data: { cart: { items: [], subtotal: 0, itemCount: 0 } },
    });
  } catch (error) {
    logger.error('Clear cart error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
