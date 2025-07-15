import apiClient from './api';
import { User } from './auth.service';
import { Product } from './product.service';

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    newUsersThisMonth: number;
    newOrdersThisMonth: number;
  };
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      product: {
        name: string;
      };
      quantity: number;
    }>;
  }>;
  topProducts: Product[];
  lowStockProducts: Product[];
  dailyRevenue: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    revenue: number;
    orders: number;
  }>;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserFilters {
  search?: string;
  role?: 'user' | 'admin';
  page?: number;
  limit?: number;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  shippingCost: number;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
  featuredCategories: string[];
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface AnalyticsData {
  salesData: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    sales: number;
    orders: number;
  }>;
  categoryPerformance: Array<{
    _id: string;
    revenue: number;
    quantity: number;
  }>;
  userGrowth: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    newUsers: number;
  }>;
}

class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch dashboard stats');
  }

  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<UsersResponse>(
      `/admin/users?${params.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch users');
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
    const response = await apiClient.put<User>(`/admin/users/${userId}/role`, { role });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to update user role');
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    
    if (!response.success) {
      throw response.error || new Error('Failed to delete user');
    }
  }

  async getSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<SystemSettings>('/admin/settings');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch settings');
  }

  async updateSettings(settings: SystemSettings): Promise<SystemSettings> {
    const response = await apiClient.put<SystemSettings>('/admin/settings', settings);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to update settings');
  }

  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>(`/admin/analytics?period=${period}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch analytics');
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  formatDateTime(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
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

  getRoleColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-green-100 text-green-800',
    };
    
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  }
}

export default new AdminService();