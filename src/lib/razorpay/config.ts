/**
 * Razorpay Configuration
 * Handles API keys, environment setup, and basic validation
 */

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  baseUrl: string;
  currency: string;
  isTestMode: boolean;
}

class RazorpayConfiguration {
  private config: RazorpayConfig;

  constructor() {
    this.config = {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      baseUrl: 'https://api.razorpay.com/v1',
      currency: 'INR',
      isTestMode: process.env.NODE_ENV !== 'production' || (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ?? false)
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.keyId) {
      throw new Error('RAZORPAY_KEY_ID is required in environment variables');
    }
    if (!this.config.keySecret) {
      throw new Error('RAZORPAY_KEY_SECRET is required in environment variables');
    }
    if (!this.config.webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET not found - webhook verification will be disabled');
    }
  }

  public getConfig(): RazorpayConfig {
    return { ...this.config };
  }

  public getAuthHeader(): string {
    const credentials = Buffer.from(`${this.config.keyId}:${this.config.keySecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  public isConfigured(): boolean {
    return !!(this.config.keyId && this.config.keySecret);
  }

  public getPublicConfig() {
    return {
      keyId: this.config.keyId,
      currency: this.config.currency,
      isTestMode: this.config.isTestMode
    };
  }
}

export const razorpayConfig = new RazorpayConfiguration();
export default razorpayConfig;