/**
 * Razorpay API Service
 * Handles all interactions with Razorpay REST APIs
 */

import { razorpayConfig } from './config';
import type {
  RazorpayCustomer,
  CreateCustomerRequest,
  RazorpayOrder,
  CreateOrderRequest,
  RazorpayPayment,
  CapturePaymentRequest,
  RazorpayRefund,
  CreateRefundRequest,
  RazorpayCollection,
  RazorpayError
} from './types';

class RazorpayAPIService {
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    const config = razorpayConfig.getConfig();
    this.baseUrl = config.baseUrl;
    this.authHeader = razorpayConfig.getAuthHeader();
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as RazorpayError;
        throw new Error(`Razorpay API Error: ${error.error.description} (${error.error.code})`);
      }

      return data as T;
    } catch (error) {
      console.error('Razorpay API request failed:', error);
      throw error;
    }
  }

  // Customer APIs
  async createCustomer(customerData: CreateCustomerRequest): Promise<RazorpayCustomer> {
    return this.makeRequest<RazorpayCustomer>('/customers', 'POST', customerData);
  }

  async getCustomer(customerId: string): Promise<RazorpayCustomer> {
    return this.makeRequest<RazorpayCustomer>(`/customers/${customerId}`);
  }

  async updateCustomer(customerId: string, updateData: Partial<CreateCustomerRequest>): Promise<RazorpayCustomer> {
    return this.makeRequest<RazorpayCustomer>(`/customers/${customerId}`, 'PUT', updateData);
  }

  async getAllCustomers(count?: number, skip?: number): Promise<RazorpayCollection<RazorpayCustomer>> {
    const params = new URLSearchParams();
    if (count) params.append('count', count.toString());
    if (skip) params.append('skip', skip.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<RazorpayCollection<RazorpayCustomer>>(`/customers${query}`);
  }

  // Order APIs
  async createOrder(orderData: CreateOrderRequest): Promise<RazorpayOrder> {
    return this.makeRequest<RazorpayOrder>('/orders', 'POST', orderData);
  }

  async getOrder(orderId: string): Promise<RazorpayOrder> {
    return this.makeRequest<RazorpayOrder>(`/orders/${orderId}`);
  }

  async getAllOrders(count?: number, skip?: number): Promise<RazorpayCollection<RazorpayOrder>> {
    const params = new URLSearchParams();
    if (count) params.append('count', count.toString());
    if (skip) params.append('skip', skip.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<RazorpayCollection<RazorpayOrder>>(`/orders${query}`);
  }

  async getOrderPayments(orderId: string): Promise<RazorpayCollection<RazorpayPayment>> {
    return this.makeRequest<RazorpayCollection<RazorpayPayment>>(`/orders/${orderId}/payments`);
  }

  // Payment APIs
  async getPayment(paymentId: string): Promise<RazorpayPayment> {
    return this.makeRequest<RazorpayPayment>(`/payments/${paymentId}`);
  }

  async capturePayment(paymentId: string, captureData: CapturePaymentRequest): Promise<RazorpayPayment> {
    return this.makeRequest<RazorpayPayment>(`/payments/${paymentId}/capture`, 'POST', captureData);
  }

  async getAllPayments(count?: number, skip?: number): Promise<RazorpayCollection<RazorpayPayment>> {
    const params = new URLSearchParams();
    if (count) params.append('count', count.toString());
    if (skip) params.append('skip', skip.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<RazorpayCollection<RazorpayPayment>>(`/payments${query}`);
  }

  // Refund APIs
  async createRefund(paymentId: string, refundData?: CreateRefundRequest): Promise<RazorpayRefund> {
    return this.makeRequest<RazorpayRefund>(`/payments/${paymentId}/refund`, 'POST', refundData);
  }

  async getRefund(paymentId: string, refundId: string): Promise<RazorpayRefund> {
    return this.makeRequest<RazorpayRefund>(`/payments/${paymentId}/refunds/${refundId}`);
  }

  async getAllRefunds(paymentId: string): Promise<RazorpayCollection<RazorpayRefund>> {
    return this.makeRequest<RazorpayCollection<RazorpayRefund>>(`/payments/${paymentId}/refunds`);
  }

  // Utility Methods
  async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    try {
      const crypto = await import('crypto');
      const config = razorpayConfig.getConfig();
      
      const expectedSignature = crypto
        .createHmac('sha256', config.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Payment signature verification failed:', error);
      return false;
    }
  }

  async verifyWebhookSignature(
    webhookBody: string,
    webhookSignature: string,
    webhookSecret?: string
  ): Promise<boolean> {
    try {
      const crypto = await import('crypto');
      const config = razorpayConfig.getConfig();
      const secret = webhookSecret || config.webhookSecret;
      
      if (!secret) {
        console.warn('Webhook secret not configured - skipping verification');
        return true;
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(webhookBody)
        .digest('hex');

      return expectedSignature === webhookSignature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

export const razorpayAPI = new RazorpayAPIService();
export default razorpayAPI;