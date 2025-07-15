import apiClient from './api';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: 'course' | 'merch' | 'ebook' | 'consultation';
  subcategory?: string;
  images: Array<{
    url: string;
    publicId?: string;
  }>;
  thumbnail?: {
    url: string;
    publicId?: string;
  };
  stock: number;
  sku?: string;
  features: string[];
  tags: string[];
  courseContent?: {
    duration: string;
    modules: Array<{
      title: string;
      description: string;
      lessons: Array<{
        title: string;
        duration: string;
        type: 'video' | 'text' | 'quiz';
      }>;
    }>;
    level: 'beginner' | 'intermediate' | 'advanced';
    certificate: boolean;
  };
  variants?: Array<{
    name: string;
    options: Array<{
      value: string;
      price: number;
      stock: number;
      sku: string;
    }>;
  }>;
  sold: number;
  rating: {
    average: number;
    count: number;
  };
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  discountPercentage?: number;
  isAvailable: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-low' | 'price-high' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: 'course' | 'merch' | 'ebook' | 'consultation';
  subcategory?: string;
  images: Array<{
    url: string;
    publicId?: string;
  }>;
  thumbnail?: {
    url: string;
    publicId?: string;
  };
  stock: number;
  sku?: string;
  features: string[];
  tags: string[];
  courseContent?: any;
  variants?: any[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
}

class ProductService {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<ProductsResponse>(
      `/products?${params.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch products');
  }

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch product');
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/slug/${slug}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch product');
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/featured');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch featured products');
  }

  async getProductsByCategory(category: string, page = 1, limit = 12): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(
      `/products/category/${category}?page=${page}&limit=${limit}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch products by category');
  }

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/products/categories');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to fetch categories');
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<Product>('/products', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to create product');
  }

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to update product');
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await apiClient.delete(`/products/${id}`);
    
    if (!response.success) {
      throw response.error || new Error('Failed to delete product');
    }
  }
}

export default new ProductService();