const Product = require('../models/Product');
const { cacheGet, cacheInvalidate, logger } = require('shared/src/index');

const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE = 600; // 10 minutes

/**
 * GET /api/products
 * List products with search, category filter, sort, and pagination
 */
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = '-createdAt',
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    // Build cache key from query params
    const cacheKey = `products:p${pageNum}:l${limitNum}:c${category || 'all'}:s${search || ''}:sort${sort}:min${minPrice || ''}:max${maxPrice || ''}`;

    const data = await cacheGet(cacheKey, CACHE_TTL_LIST, async () => {
      // Build query
      const query = {};

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$text = { $search: search };
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      return {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get products error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

/**
 * GET /api/products/:id
 * Get single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    const product = await cacheGet(cacheKey, CACHE_TTL_SINGLE, async () => {
      return Product.findById(id).populate('category', 'name slug').lean();
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    logger.error('Get product error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

/**
 * POST /api/products (Admin only)
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, images, category, stock, sku, featured } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      images,
      category,
      stock,
      sku,
      featured,
    });

    const populated = await Product.findById(product._id).populate('category', 'name slug');

    // Invalidate product list cache
    await cacheInvalidate('products:*');

    logger.info(`Product created: ${name}`);
    res.status(201).json({ success: true, data: { product: populated } });
  } catch (error) {
    logger.error('Create product error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product with this SKU already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

/**
 * PUT /api/products/:id (Admin only)
 * Update a product
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Regenerate slug if name changed
    if (updates.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Invalidate caches
    await cacheInvalidate('products:*');
    await cacheInvalidate(`product:${id}`);

    logger.info(`Product updated: ${product.name}`);
    res.json({ success: true, data: { product } });
  } catch (error) {
    logger.error('Update product error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

/**
 * DELETE /api/products/:id (Admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Invalidate caches
    await cacheInvalidate('products:*');
    await cacheInvalidate(`product:${id}`);

    logger.info(`Product deleted: ${product.name}`);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    logger.error('Delete product error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

/**
 * PATCH /api/products/:id/stock (Admin only)
 */
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock quantity is required' });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await cacheInvalidate(`product:${id}`);
    await cacheInvalidate('products:*');

    res.json({ success: true, data: { product } });
  } catch (error) {
    logger.error('Update stock error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock };
