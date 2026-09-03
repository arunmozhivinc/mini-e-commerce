const express = require('express');
const router = express.Router();
const { getCategories, createCategory, getCategoryById } = require('../controllers/categoryController');
const { authenticate, authorize } = require('./middleware');

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize('admin'), createCategory);

module.exports = router;
