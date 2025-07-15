import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@1000banks.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'admin',
      isEmailVerified: true
    });

    // Create sample products
    const sampleProducts = [
      {
        name: 'Complete Financial Freedom Course',
        description: 'Master the fundamentals of personal finance, investing, and wealth building with our comprehensive course designed for beginners and intermediates.',
        price: 297,
        comparePrice: 397,
        category: 'course',
        subcategory: 'financial-education',
        images: [
          { url: '/api/placeholder/600/400', publicId: 'course-1' }
        ],
        thumbnail: { url: '/api/placeholder/400/300', publicId: 'course-1-thumb' },
        stock: 0, // Digital product
        features: [
          '12 comprehensive modules',
          '50+ video lessons',
          'Downloadable resources',
          'Community access',
          'Lifetime updates'
        ],
        tags: ['finance', 'investing', 'beginner', 'wealth'],
        courseContent: {
          duration: '12 weeks',
          modules: [
            {
              title: 'Financial Fundamentals',
              description: 'Learn the basics of budgeting, saving, and debt management',
              lessons: [
                { title: 'Creating Your First Budget', duration: '15 min', type: 'video' },
                { title: 'Emergency Fund Essentials', duration: '12 min', type: 'video' },
                { title: 'Debt Elimination Strategies', duration: '20 min', type: 'video' }
              ]
            },
            {
              title: 'Investment Basics',
              description: 'Understanding stocks, bonds, and other investment vehicles',
              lessons: [
                { title: 'Stock Market Fundamentals', duration: '25 min', type: 'video' },
                { title: 'Portfolio Diversification', duration: '18 min', type: 'video' },
                { title: 'Risk Management', duration: '22 min', type: 'video' }
              ]
            }
          ],
          level: 'beginner',
          certificate: true
        },
        rating: { average: 4.8, count: 156 },
        sold: 1234,
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: 'Advanced Trading Masterclass',
        description: 'Take your trading skills to the next level with advanced strategies, risk management, and market analysis techniques.',
        price: 497,
        comparePrice: 697,
        category: 'course',
        subcategory: 'trading',
        images: [
          { url: '/api/placeholder/600/400', publicId: 'course-2' }
        ],
        thumbnail: { url: '/api/placeholder/400/300', publicId: 'course-2-thumb' },
        stock: 0,
        features: [
          '8 intensive modules',
          'Live trading sessions',
          'Personal mentorship',
          'Trading tools included',
          '1-year support'
        ],
        tags: ['trading', 'advanced', 'stocks', 'crypto'],
        courseContent: {
          duration: '8 weeks',
          modules: [
            {
              title: 'Advanced Technical Analysis',
              description: 'Master chart patterns, indicators, and market psychology',
              lessons: [
                { title: 'Chart Pattern Recognition', duration: '30 min', type: 'video' },
                { title: 'Advanced Indicators', duration: '25 min', type: 'video' }
              ]
            }
          ],
          level: 'advanced',
          certificate: true
        },
        rating: { average: 4.9, count: 89 },
        sold: 456,
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: '1000Banks Premium Hoodie',
        description: 'Comfortable, high-quality hoodie with the 1000Banks logo. Perfect for showing your commitment to financial freedom.',
        price: 79,
        comparePrice: 99,
        category: 'merch',
        subcategory: 'apparel',
        images: [
          { url: '/api/placeholder/600/400', publicId: 'hoodie-1' }
        ],
        thumbnail: { url: '/api/placeholder/400/300', publicId: 'hoodie-1-thumb' },
        stock: 100,
        sku: '1KB-HOODIE-001',
        features: [
          '100% cotton blend',
          'Machine washable',
          'Comfortable fit',
          'Durable print'
        ],
        tags: ['apparel', 'hoodie', 'cotton', 'comfortable'],
        variants: [
          {
            name: 'Size',
            options: [
              { value: 'S', price: 79, stock: 20, sku: '1KB-HOODIE-001-S' },
              { value: 'M', price: 79, stock: 30, sku: '1KB-HOODIE-001-M' },
              { value: 'L', price: 79, stock: 25, sku: '1KB-HOODIE-001-L' },
              { value: 'XL', price: 79, stock: 20, sku: '1KB-HOODIE-001-XL' },
              { value: 'XXL', price: 84, stock: 5, sku: '1KB-HOODIE-001-XXL' }
            ]
          },
          {
            name: 'Color',
            options: [
              { value: 'Black', price: 79, stock: 50, sku: '1KB-HOODIE-001-BLACK' },
              { value: 'Navy', price: 79, stock: 30, sku: '1KB-HOODIE-001-NAVY' },
              { value: 'Gray', price: 79, stock: 20, sku: '1KB-HOODIE-001-GRAY' }
            ]
          }
        ],
        rating: { average: 4.6, count: 234 },
        sold: 567,
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      },
      {
        name: 'Financial Freedom Ebook',
        description: 'A comprehensive guide to achieving financial independence. Learn the strategies used by millionaires to build wealth.',
        price: 29,
        comparePrice: 39,
        category: 'ebook',
        subcategory: 'guides',
        images: [
          { url: '/api/placeholder/600/400', publicId: 'ebook-1' }
        ],
        thumbnail: { url: '/api/placeholder/400/300', publicId: 'ebook-1-thumb' },
        stock: 0, // Digital product
        features: [
          '200+ pages',
          'Instant download',
          'PDF format',
          'Bonus worksheets',
          'Mobile friendly'
        ],
        tags: ['ebook', 'financial-freedom', 'wealth', 'guide'],
        rating: { average: 4.7, count: 89 },
        sold: 1456,
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      },
      {
        name: 'One-on-One Financial Consultation',
        description: 'Get personalized financial advice from our experts. 60-minute session to discuss your financial goals and create a custom plan.',
        price: 199,
        category: 'consultation',
        subcategory: 'personal',
        images: [
          { url: '/api/placeholder/600/400', publicId: 'consultation-1' }
        ],
        thumbnail: { url: '/api/placeholder/400/300', publicId: 'consultation-1-thumb' },
        stock: 0, // Service
        features: [
          '60-minute session',
          'Personal financial review',
          'Custom action plan',
          'Follow-up email summary',
          'Q&A session'
        ],
        tags: ['consultation', 'personal', 'financial-planning', 'advice'],
        rating: { average: 4.9, count: 45 },
        sold: 123,
        isActive: true,
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        name: '1000Banks T-Shirt',
        description: 'Comfortable cotton t-shirt with inspiring financial freedom message. Show your commitment to building wealth.',
        price: 29,
        comparePrice: 35,
        category: 'merch',
        subcategory: 'apparel',
        images: [
          { url: '/api/placeholder/600/400', publicId: 'tshirt-1' }
        ],
        thumbnail: { url: '/api/placeholder/400/300', publicId: 'tshirt-1-thumb' },
        stock: 150,
        sku: '1KB-TSHIRT-001',
        features: [
          '100% cotton',
          'Pre-shrunk',
          'Soft feel',
          'Durable print'
        ],
        tags: ['apparel', 'tshirt', 'cotton', 'comfortable'],
        variants: [
          {
            name: 'Size',
            options: [
              { value: 'S', price: 29, stock: 25, sku: '1KB-TSHIRT-001-S' },
              { value: 'M', price: 29, stock: 40, sku: '1KB-TSHIRT-001-M' },
              { value: 'L', price: 29, stock: 35, sku: '1KB-TSHIRT-001-L' },
              { value: 'XL', price: 29, stock: 30, sku: '1KB-TSHIRT-001-XL' },
              { value: 'XXL', price: 32, stock: 20, sku: '1KB-TSHIRT-001-XXL' }
            ]
          }
        ],
        rating: { average: 4.5, count: 178 },
        sold: 789,
        isActive: true,
        isFeatured: false,
        createdBy: adminUser._id
      }
    ];

    await Product.insertMany(sampleProducts);
    
    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${sampleProducts.length} products`);
    console.log(`👤 Admin user: ${adminUser.email}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  seedData();
});