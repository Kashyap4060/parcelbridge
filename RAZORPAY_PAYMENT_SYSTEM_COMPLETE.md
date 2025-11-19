# Razorpay Payment Integration - Complete Setup Guide

## Overview
This document provides a complete guide to set up the Razorpay payment integration for Parcel-Bridge. The system handles parcel delivery fee collection with order creation, payment verification, webhook handling, and real-time status updates.

## Features Implemented

### Backend Services
- ✅ Razorpay configuration and API client
- ✅ Fee calculation service with Indian pricing structure  
- ✅ Order creation API with validation
- ✅ Payment verification with signature validation
- ✅ Webhook handler for real-time updates
- ✅ Database schema for payment records
- ✅ TypeScript interfaces for type safety

### Frontend Components
- ✅ Payment dialog with Razorpay integration
- ✅ Fee display component with breakdown
- ✅ Payment status tracking components
- ✅ Responsive UI with Tailwind CSS

## Environment Setup

### Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx        # Get from Razorpay Dashboard
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx       # Get from Razorpay Dashboard
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxx      # Set up webhook endpoint

# Optional - for production
RAZORPAY_LIVE_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_LIVE_KEY_SECRET=xxxxxxxxxxxxxxxx
NODE_ENV=production  # Use live keys when NODE_ENV=production
```

### Getting Razorpay Credentials

1. **Sign up at Razorpay**: Go to [razorpay.com](https://razorpay.com) and create an account
2. **Get API Keys**: 
   - Navigate to Settings → API Keys
   - Generate Test/Live API keys
   - Copy Key ID and Key Secret
3. **Set up Webhooks**:
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`
   - Get webhook secret

## Database Setup

Run the SQL schema to create payment tables:

```bash
# Apply the payment_records schema
psql -h your-host -U your-user -d your-database -f payment_records_schema.sql
```

Key tables created:
- `payment_records`: Stores all payment transactions
- Updates `parcel_requests` with payment status columns
- RLS policies for secure access
- Triggers for automatic status updates

## API Endpoints

### 1. Create Payment Order
```http
POST /api/payments/orders
Content-Type: application/json

{
  "parcelRequestId": "uuid",
  "senderId": "uuid", 
  "amount": 25000,  // Amount in paise (₹250.00)
  "currency": "INR",
  "description": "Parcel delivery Delhi to Mumbai",
  "feeBreakdown": {
    // Fee calculation details
  },
  "customerInfo": {
    "name": "Customer Name",
    "email": "customer@email.com", 
    "contact": "+919876543210"
  }
}
```

### 2. Verify Payment
```http
POST /api/payments/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx", 
  "razorpay_signature": "signature_xxx"
}
```

### 3. Webhook Handler
```http
POST /api/payments/webhook
X-Razorpay-Signature: webhook_signature
Content-Type: application/json

{
  // Razorpay webhook payload
}
```

## Fee Calculation Structure

### Weight Tiers
- **Light (0-2kg)**: ₹20 base fee
- **Medium (2-5kg)**: ₹40 base fee  
- **Heavy (5-10kg)**: ₹60 base fee
- **Extra Heavy (10kg+)**: ₹80 base fee

### Distance Slabs
- **0-100km**: ₹2/km
- **101-300km**: ₹3/km
- **301-500km**: ₹4/km
- **500km+**: ₹5/km

### Additional Charges
- **GST**: 18% on total amount
- **Urgent delivery**: +25% 
- **Fragile items**: +₹30
- **Insurance**: 2% of declared value

## Component Usage

### Payment Dialog
```tsx
import { PaymentDialog } from '@/components/payments';

<PaymentDialog
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  parcelRequestId="uuid"
  senderId="uuid"
  feeBreakdown={calculatedFee}
  parcelDetails={{
    pickupStation: "New Delhi",
    dropStation: "Mumbai Central", 
    weight: 2.5,
    description: "Documents"
  }}
  senderInfo={{
    name: "Sender Name",
    email: "sender@email.com",
    phone: "+919876543210"
  }}
  onPaymentSuccess={(data) => {
    // Handle success
  }}
/>
```

### Fee Display
```tsx
import { FeeDisplay } from '@/components/payments';

<FeeDisplay
  pickupStation="New Delhi"
  dropStation="Mumbai Central"
  weight={2.5}
  showPayButton={true}
  onFeeCalculated={(fee) => setCalculatedFee(fee)}
  onPayClick={(fee) => setShowPayment(true)}
/>
```

### Payment Status
```tsx
import { PaymentStatus, PaymentStatusBadge } from '@/components/payments';

<PaymentStatus
  status="captured"
  paymentId="pay_xxxxx"
  amount={25000}
  updatedAt="2024-01-15T10:30:00Z"
/>

<PaymentStatusBadge status="captured" />
```

## Security Features

### Payment Verification
- Razorpay signature validation using HMAC SHA256
- Order amount verification before processing
- User authentication checks
- Database transaction safety

### Webhook Security  
- Signature verification for all webhook events
- Idempotent webhook processing
- Rate limiting and error handling
- Secure environment variable management

## Testing

### Test Mode Setup
1. Use test API keys (starting with `rzp_test_`)
2. Use test payment methods from Razorpay docs
3. Test webhook events using Razorpay webhook simulator

### Test Cards
```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
OTP: 4000 0000 0000 3220
```

## Production Deployment

### Before Going Live
1. ✅ Replace test keys with live keys
2. ✅ Set up production webhook URLs
3. ✅ Configure SSL certificates
4. ✅ Set up monitoring and alerts
5. ✅ Test payment flow end-to-end
6. ✅ Configure rate limiting

### Monitoring
- Payment success/failure rates
- Webhook delivery status  
- Database performance
- Error logging and alerts

## Integration Steps

### 1. Set Up Environment
```bash
# Install dependencies (already in package.json)
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Razorpay keys
```

### 2. Apply Database Schema
```sql
-- Run payment_records_schema.sql
-- Verify tables are created
-- Test RLS policies
```

### 3. Update Parcel Creation Flow
```tsx
// In your parcel request creation component
import { FeeDisplay, PaymentDialog } from '@/components/payments';

// Show fee calculation
// Integrate payment dialog
// Handle payment success/failure
```

### 4. Test Integration
```bash
# Start development server
npm run dev

# Test fee calculation
# Test payment flow
# Test webhook handling
```

## Troubleshooting

### Common Issues

**Payment Creation Fails**
- Check API keys are correct
- Verify parcel request exists
- Check user authentication

**Signature Verification Fails**  
- Ensure webhook secret is correct
- Check payload formatting
- Verify HMAC calculation

**Database Errors**
- Check RLS policies
- Verify foreign key constraints
- Ensure proper user permissions

### Debug Endpoints

```bash
# Check order creation
curl -X POST localhost:3000/api/payments/orders \
  -H "Content-Type: application/json" \
  -d '{"parcelRequestId":"uuid",...}'

# Test webhook  
curl -X POST localhost:3000/api/payments/webhook \
  -H "X-Razorpay-Signature: test_signature" \
  -d '{...webhook_payload}'
```

## Next Steps

1. **UI Integration**: Integrate payment components into parcel request flow
2. **Testing**: Complete end-to-end testing with real payments
3. **Monitoring**: Set up production monitoring and alerts  
4. **Documentation**: Update user-facing documentation
5. **Mobile**: Ensure payment flow works on mobile browsers

## Support

- **Razorpay Docs**: [razorpay.com/docs](https://razorpay.com/docs)
- **Integration Guide**: [razorpay.com/docs/payments](https://razorpay.com/docs/payments)
- **Webhook Guide**: [razorpay.com/docs/webhooks](https://razorpay.com/docs/webhooks)

---

✅ **Payment system is ready for integration and testing!**