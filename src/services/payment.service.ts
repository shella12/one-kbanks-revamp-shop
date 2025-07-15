import apiClient from './api';

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface BillingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface PaymentIntentData {
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  orderSummary: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      variant?: {
        name: string;
        value: string;
      };
    }>;
  };
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  created: number;
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
}

class PaymentService {
  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResponse> {
    const response = await apiClient.post<PaymentIntentResponse>('/payment/create-intent', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to create payment intent');
  }

  async confirmPayment(data: ConfirmPaymentData): Promise<any> {
    const response = await apiClient.post('/payment/confirm', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to confirm payment');
  }

  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    const response = await apiClient.get<PaymentMethodsResponse>('/payment/methods');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw response.error || new Error('Failed to get payment methods');
  }

  async savePaymentMethod(paymentMethodId: string): Promise<void> {
    const response = await apiClient.post('/payment/save-method', { paymentMethodId });
    
    if (!response.success) {
      throw response.error || new Error('Failed to save payment method');
    }
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatCardBrand(brand: string): string {
    const brandMap: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay',
      'unknown': 'Unknown'
    };
    
    return brandMap[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  }

  getCardIcon(brand: string): string {
    const iconMap: { [key: string]: string } = {
      'visa': '💳',
      'mastercard': '💳',
      'amex': '💳',
      'discover': '💳',
      'diners': '💳',
      'jcb': '💳',
      'unionpay': '💳',
      'unknown': '💳'
    };
    
    return iconMap[brand] || '💳';
  }
}

export default new PaymentService();