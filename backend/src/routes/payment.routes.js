import express from 'express';
import { body } from 'express-validator';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  savePaymentMethod,
  handleWebhook
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const createPaymentIntentValidation = [
  body('shippingAddress').optional().isObject().withMessage('Shipping address must be an object'),
  body('billingAddress').optional().isObject().withMessage('Billing address must be an object')
];

const confirmPaymentValidation = [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('shippingAddress').optional().isObject().withMessage('Shipping address must be an object'),
  body('billingAddress').optional().isObject().withMessage('Billing address must be an object')
];

const savePaymentMethodValidation = [
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
];

// Webhook route (no auth required, raw body needed for signature verification)
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-intent', createPaymentIntentValidation, createPaymentIntent);
router.post('/confirm', confirmPaymentValidation, confirmPayment);
router.get('/methods', getPaymentMethods);
router.post('/save-method', savePaymentMethodValidation, savePaymentMethod);

export default router;