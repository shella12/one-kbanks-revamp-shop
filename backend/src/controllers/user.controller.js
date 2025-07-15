import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import { validationResult } from 'express-validator';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          status: 400,
          details: errors.array()
        }
      });
    }

    const { name, phoneNumber, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phoneNumber,
        address
      },
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

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
export const getUserOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images thumbnail slug');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
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

// @desc    Get single order
// @route   GET /api/users/orders/:id
// @access  Private
export const getUserOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product', 'name images thumbnail slug');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          status: 404
        }
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/users/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          status: 404
        }
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order cannot be cancelled at this stage',
          status: 400
        }
      });
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      notes: 'Cancelled by customer',
      updatedBy: req.user.id
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total orders
    const totalOrders = await Order.countDocuments({ user: userId });

    // Total spent
    const totalSpent = await Order.aggregate([
      { $match: { user: userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent orders
    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'name images thumbnail');

    // Favorite categories
    const favoriteCategories = await Order.aggregate([
      { $match: { user: userId, paymentStatus: 'paid' } },
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
          count: { $sum: '$items.quantity' },
          spent: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        ordersByStatus,
        recentOrders,
        favoriteCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
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

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    // Check if user has pending orders
    const pendingOrders = await Order.countDocuments({
      user: req.user.id,
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete account with pending orders',
          status: 400
        }
      });
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      data: { message: 'Account deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};