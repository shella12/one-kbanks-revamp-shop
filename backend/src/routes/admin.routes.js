import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getSettings,
  updateSettings,
  getAnalytics
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users management
router.get('/users', getUsers);
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Invalid role')
], updateUserRole);
router.delete('/users/:id', deleteUser);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Analytics
router.get('/analytics', getAnalytics);

export default router;