import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['course', 'merch', 'ebook', 'consultation'],
    lowercase: true
  },
  subcategory: {
    type: String
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String
  }],
  thumbnail: {
    url: String,
    publicId: String
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  features: [String],
  tags: [String],
  
  // For courses
  courseContent: {
    duration: String, // e.g., "12 weeks"
    modules: [{
      title: String,
      description: String,
      lessons: [{
        title: String,
        duration: String,
        type: { type: String, enum: ['video', 'text', 'quiz'] }
      }]
    }],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    certificate: {
      type: Boolean,
      default: false
    }
  },
  
  // For physical products (merch)
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [{
      value: String, // e.g., "XL", "Black"
      price: Number,
      stock: Number,
      sku: String
    }]
  }],
  
  // Product metrics
  sold: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
productSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
  if (this.category === 'course' || this.category === 'ebook') return true;
  return this.stock > 0;
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;