import apiClient from './api';
import { User } from './auth.service';

export interface UserProfile extends User {
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface UpdateProfileData {
  name: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface UserOrder {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      images: Array<{ url: string }>;
      thumbnail?: { url: string };
      slug: string;
    };
    name: string;
    price: number;
    quantity: number;
    variant?: {
      name: string;
      value: string;
    };
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDetails?: {
    stripePaymentId: string;
    receiptUrl: string;
  };
  shippingAddress?: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  status: string;
  statusHistory: Array<{
    status: string;
    date: string;
    notes?: string;
  }>;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: UserOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  recentOrders: UserOrder[];
  favoriteCategories: Array<{
    _id: string;
    count: number;
    spent: number;
  }>;
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/profile');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch profile');
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/users/profile', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to update profile');
  }

  async updateAvatar(avatar: string): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/users/avatar', { avatar });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to update avatar');
  }

  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<OrdersResponse>(
      `/users/orders?${params.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch orders');
  }

  async getOrder(orderId: string): Promise<UserOrder> {
    const response = await apiClient.get<UserOrder>(`/users/orders/${orderId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch order');
  }

  async cancelOrder(orderId: string): Promise<UserOrder> {
    const response = await apiClient.put<UserOrder>(`/users/orders/${orderId}/cancel`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to cancel order');
  }

  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/users/stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch user statistics');
  }

  async deleteAccount(): Promise<void> {
    const response = await apiClient.delete('/users/account');
    
    if (!response.success) {
      throw response.error || new Error('Failed to delete account');
    }
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  canCancelOrder(order: UserOrder): boolean {
    return ['pending', 'processing'].includes(order.status);
  }

  isOrderRefundable(order: UserOrder): boolean {
    return order.paymentStatus === 'paid' && 
           ['delivered'].includes(order.status) &&
           this.getDaysSinceOrder(order.createdAt) <= 30;
  }

  getDaysSinceOrder(orderDate: string): number {
    const now = new Date();
    const orderTime = new Date(orderDate);
    const diffTime = Math.abs(now.getTime() - orderTime.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      course: 'Courses',
      merch: 'Merchandise',
      ebook: 'E-books',
      consultation: 'Consultations',
    };
    
    return categoryNames[category] || category;
  }
}

export default new UserService();