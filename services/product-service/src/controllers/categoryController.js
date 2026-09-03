const Category = require('../models/Category');
const { cacheGet, cacheInvalidate, logger } = require('shared/src/index');

const CACHE_TTL = 600; // 10 minutes

const getCategories = async (req, res) => {
  try {
    const categories = await cacheGet('categories:all', CACHE_TTL, async () => {
      return Category.find().sort({ name: 1 }).lean();
    });

    res.json({ success: true, data: { categories } });
  } catch (error) {
    logger.error('Get categories error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await Category.create({ name, slug, description, image });
    await cacheInvalidate('categories:*');

    logger.info(`Category created: ${name}`);
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    logger.error('Create category error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: { category } });
  } catch (error) {
    logger.error('Get category error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
};

module.exports = { getCategories, createCategory, getCategoryById };
