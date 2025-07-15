import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Revenue stats
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const weeklyRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Order stats
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    // Product stats
    const topProducts = await Product.aggregate([
      { $match: { sold: { $gt: 0 } } },
      { $sort: { sold: -1 } },
      { $limit: 10 }
    ]);

    const lowStockProducts = await Product.find({
      category: 'merch',
      stock: { $lt: 10 },
      isActive: true
    }).limit(10);

    // Growth stats
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newOrdersThisMonth = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Daily revenue for chart (last 30 days)
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          activeUsers,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          weeklyRevenue: weeklyRevenue[0]?.total || 0,
          newUsersThisMonth,
          newOrdersThisMonth
        },
        ordersByStatus,
        recentOrders,
        topProducts,
        lowStockProducts,
        dailyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Search filter
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot change your own role',
          status: 400
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete your own account',
          status: 400
        }
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    // Also delete user's cart
    await Cart.deleteOne({ user: userId });

    res.status(200).json({
      success: true,
      data: { message: 'User deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res, next) => {
  try {
    // This would typically come from a Settings model
    // For now, we'll return some basic settings
    const settings = {
      siteName: '1000Banks',
      siteDescription: 'Financial Freedom Academy',
      currency: 'USD',
      taxRate: 0.08,
      freeShippingThreshold: 100,
      shippingCost: 10,
      allowRegistration: true,
      requireEmailVerification: false,
      maintenanceMode: false,
      featuredCategories: ['course', 'merch'],
      socialLinks: {
        twitter: 'https://twitter.com/1000banks',
        facebook: 'https://facebook.com/1000banks',
        instagram: 'https://instagram.com/1000banks',
        youtube: 'https://youtube.com/1000banks'
      },
      contactInfo: {
        email: 'info@1000banks.com',
        phone: '+1-555-0123',
        address: '123 Finance St, Money City, FC 12345'
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    // In a real app, this would update a Settings model
    // For now, we'll just return the updated settings
    const updatedSettings = req.body;

    res.status(200).json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Sales analytics
    const salesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Product category performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: dateFilter }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        salesData,
        categoryPerformance,
        userGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};