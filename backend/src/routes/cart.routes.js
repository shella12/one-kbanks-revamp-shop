import express from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Validation middleware
const addToCartValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('variant').optional().isObject().withMessage('Variant must be an object')
];

const updateCartItemValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/items', addToCartValidation, addToCart);
router.put('/items/:itemId', updateCartItemValidation, updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;