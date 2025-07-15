import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware for product creation/update
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['course', 'merch', 'ebook', 'consultation']).withMessage('Invalid category'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/category/:category', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), productValidation, createProduct);
router.put('/:id', protect, authorize('admin'), productValidation, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;