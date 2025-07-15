import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  getUserOrders,
  getUserOrder,
  cancelOrder,
  getUserStats,
  updateAvatar,
  deleteAccount
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('address').optional().isObject().withMessage('Address must be an object')
], updateProfile);

// Avatar route
router.put('/avatar', [
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], updateAvatar);

// Orders routes
router.get('/orders', getUserOrders);
router.get('/orders/:id', getUserOrder);
router.put('/orders/:id/cancel', cancelOrder);

// Statistics
router.get('/stats', getUserStats);

// Account deletion
router.delete('/account', deleteAccount);

export default router;