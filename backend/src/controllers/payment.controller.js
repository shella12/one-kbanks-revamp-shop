import Stripe from 'stripe';
import Cart from '../models/Cart.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findByUser(req.user.id);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cart is empty',
          status: 400
        }
      });
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const shipping = subtotal >= 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create or update customer in Stripe
    const user = await User.findById(req.user.id);
    let stripeCustomer;

    try {
      if (user.stripeCustomerId) {
        stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        stripeCustomer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user._id.toString()
          }
        });
        
        // Save stripe customer ID
        user.stripeCustomerId = stripeCustomer.id;
        await user.save();
      }
    } catch (error) {
      console.error('Stripe customer error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create customer',
          status: 500
        }
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomer.id,
      metadata: {
        userId: req.user.id,
        cartId: cart._id.toString(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString()
      },
      shipping: shippingAddress ? {
        name: shippingAddress.name,
        address: {
          line1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: shippingAddress.country || 'US'
        }
      } : undefined
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total,
        currency: 'usd',
        orderSummary: {
          subtotal,
          tax,
          shipping,
          total,
          items: cart.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant
          }))
        }
      }
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    next(error);
  }
};

// @desc    Confirm payment and create order
// @route   POST /api/payment/confirm
// @access  Private
export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, shippingAddress, billingAddress } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Payment not successful',
          status: 400
        }
      });
    }

    // Get user's cart
    const cart = await Cart.findByUser(req.user.id);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cart is empty',
          status: 400
        }
      });
    }

    // Create order
    const orderData = {
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant
      })),
      subtotal: parseFloat(paymentIntent.metadata.subtotal),
      tax: parseFloat(paymentIntent.metadata.tax),
      shipping: parseFloat(paymentIntent.metadata.shipping),
      total: parseFloat(paymentIntent.metadata.total),
      paymentMethod: 'card',
      paymentStatus: 'paid',
      paymentDetails: {
        stripePaymentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer,
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url
      },
      shippingAddress,
      billingAddress,
      status: 'processing'
    };

    const order = await Order.create(orderData);

    // Update product sold counts
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { sold: item.quantity } }
      );
    }

    // Clear cart
    await cart.clearCart();

    res.status(201).json({
      success: true,
      data: {
        order,
        message: 'Payment successful and order created'
      }
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    next(error);
  }
};

// @desc    Get payment methods
// @route   GET /api/payment/methods
// @access  Private
export const getPaymentMethods = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(200).json({
        success: true,
        data: { paymentMethods: [] }
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    res.status(200).json({
      success: true,
      data: { paymentMethods: paymentMethods.data }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    next(error);
  }
};

// @desc    Save payment method
// @route   POST /api/payment/save-method
// @access  Private
export const savePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No Stripe customer found',
          status: 400
        }
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Payment method saved' }
    });
  } catch (error) {
    console.error('Save payment method error:', error);
    next(error);
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/payment/webhook
// @access  Public
export const handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};