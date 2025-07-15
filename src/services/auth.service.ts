import apiClient from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
      return response.data;
    }
    
    throw response.error || new Error('Login failed');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
      return response.data;
    }
    
    throw response.error || new Error('Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      // Even if logout fails on server, clear local token
    } finally {
      apiClient.setToken(null);
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to get user');
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.put('/auth/updatepassword', {
      currentPassword,
      newPassword,
    });
    
    if (!response.success) {
      throw response.error || new Error('Failed to update password');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post('/auth/forgotpassword', { email });
    
    if (!response.success) {
      throw response.error || new Error('Failed to send reset email');
    }
  }

  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.put<AuthResponse>(`/auth/resetpassword/${token}`, {
      password,
    });
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
      return response.data;
    }
    
    throw response.error || new Error('Failed to reset password');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();