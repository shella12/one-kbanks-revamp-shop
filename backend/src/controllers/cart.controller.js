import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { validationResult } from 'express-validator';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findByUser(req.user.id);
    
    if (!cart) {
      cart = await Cart.createForUser(req.user.id);
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
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

    const { productId, quantity = 1, variant } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found or inactive',
          status: 404
        }
      });
    }

    // Check stock for physical products
    if (product.category === 'merch') {
      if (variant) {
        const variantOption = product.variants
          ?.find(v => v.name === variant.name)
          ?.options.find(o => o.value === variant.value);
        
        if (!variantOption || variantOption.stock < quantity) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Insufficient stock for selected variant',
              status: 400
            }
          });
        }
      } else if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Insufficient stock',
            status: 400
          }
        });
      }
    }

    // Get or create cart
    let cart = await Cart.findByUser(req.user.id);
    if (!cart) {
      cart = await Cart.createForUser(req.user.id);
    }

    // Determine price (variant price or product price)
    let price = product.price;
    if (variant) {
      const variantOption = product.variants
        ?.find(v => v.name === variant.name)
        ?.options.find(o => o.value === variant.value);
      if (variantOption) {
        price = variantOption.price;
      }
    }

    // Add item to cart
    await cart.addItem(productId, quantity, price, variant);

    // Populate and return updated cart
    const updatedCart = await Cart.findByUser(req.user.id);
    
    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
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

    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findByUser(req.user.id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found',
          status: 404
        }
      });
    }

    // Find the item
    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found in cart',
          status: 404
        }
      });
    }

    // Check stock for physical products
    const product = await Product.findById(item.product);
    if (product.category === 'merch') {
      if (item.variant) {
        const variantOption = product.variants
          ?.find(v => v.name === item.variant.name)
          ?.options.find(o => o.value === item.variant.value);
        
        if (!variantOption || variantOption.stock < quantity) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Insufficient stock for selected variant',
              status: 400
            }
          });
        }
      } else if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Insufficient stock',
            status: 400
          }
        });
      }
    }

    // Update quantity
    await cart.updateItemQuantity(itemId, quantity);

    // Return updated cart
    const updatedCart = await Cart.findByUser(req.user.id);
    
    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findByUser(req.user.id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found',
          status: 404
        }
      });
    }

    // Remove item
    await cart.removeItem(itemId);

    // Return updated cart
    const updatedCart = await Cart.findByUser(req.user.id);
    
    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByUser(req.user.id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found',
          status: 404
        }
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      data: { message: 'Cart cleared successfully' }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = async (req, res, next) => {
  try {
    const cart = await Cart.findByUser(req.user.id);
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalPrice: 0,
          itemCount: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    next(error);
  }
};