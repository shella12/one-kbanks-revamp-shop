import apiClient from './api';
import { Product } from './product.service';

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  itemCount: number;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface UpdateCartItemData {
  quantity: number;
}

class CartService {
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/cart');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch cart');
  }

  async getCartSummary(): Promise<CartSummary> {
    const response = await apiClient.get<CartSummary>('/cart/summary');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch cart summary');
  }

  async addToCart(data: AddToCartData): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/items', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to add item to cart');
  }

  async updateCartItem(itemId: string, data: UpdateCartItemData): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to update cart item');
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to remove item from cart');
  }

  async clearCart(): Promise<void> {
    const response = await apiClient.delete('/cart');
    
    if (!response.success) {
      throw response.error || new Error('Failed to clear cart');
    }
  }

  // Helper methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  calculateTax(subtotal: number, taxRate: number = 0.08): number {
    return subtotal * taxRate;
  }

  calculateShipping(subtotal: number, freeShippingThreshold: number = 100): number {
    return subtotal >= freeShippingThreshold ? 0 : 10;
  }

  calculateTotal(subtotal: number, tax: number, shipping: number): number {
    return subtotal + tax + shipping;
  }
}

export default new CartService();