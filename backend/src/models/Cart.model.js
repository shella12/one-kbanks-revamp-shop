import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  variant: {
    name: String,
    value: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastUpdated = new Date();
  next();
});

// Methods
cartSchema.methods.addItem = function(productId, quantity, price, variant) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    JSON.stringify(item.variant) === JSON.stringify(variant)
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price,
      variant
    });
  }

  return this.save();
};

cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Static methods
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId }).populate('items.product');
};

cartSchema.statics.createForUser = function(userId) {
  return this.create({ user: userId, items: [] });
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;