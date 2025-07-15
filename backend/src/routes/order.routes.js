import express from 'express';
import { body } from 'express-validator';
import {
  getOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllOrders);
router.get('/admin/stats', authorize('admin'), getOrderStats);
router.put('/:id/status', authorize('admin'), [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], updateOrderStatus);

export default router;