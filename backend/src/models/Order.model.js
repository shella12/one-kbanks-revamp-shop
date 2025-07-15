import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variant: {
      name: String,
      value: String
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    code: String
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'bank_transfer']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    stripePaymentId: String,
    stripeCustomerId: String,
    receiptUrl: String
  },
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  trackingNumber: String,
  notes: String,
  statusHistory: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  deliveredAt: Date,
  cancelledAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.isNew) {
    next();
    return;
  }
  
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get count of orders today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await this.constructor.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const orderNum = String(count + 1).padStart(4, '0');
  this.orderNumber = `ORD${year}${month}${day}${orderNum}`;
  
  // Add initial status to history
  this.statusHistory.push({
    status: this.status,
    notes: 'Order created'
  });
  
  next();
});

// Update status history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date()
    });
    
    // Update specific dates
    if (this.status === 'delivered') {
      this.deliveredAt = new Date();
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    } else if (this.status === 'refunded') {
      this.refundedAt = new Date();
    }
  }
  next();
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  const days = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  return days;
});

const Order = mongoose.model('Order', orderSchema);

export default Order;