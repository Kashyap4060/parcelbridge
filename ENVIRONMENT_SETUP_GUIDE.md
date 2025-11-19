# Environment Setup for Razorpay Integration

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Razorpay Configuration (Required for payment API)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase (Required for database operations)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Razorpay Credentials

### 1. Sign up for Razorpay
- Go to [razorpay.com](https://razorpay.com)
- Create an account and complete verification

### 2. Get API Keys
- Login to Razorpay Dashboard
- Go to Settings → API Keys
- Generate Test Keys (for development)
- Copy the Key ID and Key Secret

### 3. Set up Webhook (Optional for now)
- Go to Settings → Webhooks
- Add webhook URL: `http://localhost:3000/api/payments/webhook`
- Select events: payment.captured, payment.failed, order.paid
- Save and copy the webhook secret

## Testing the Setup

### 1. Test with Debug API
The code is currently set to use `/api/payments/orders-debug` which returns mock data.

### 2. Check Environment Variables
```bash
# In your terminal, check if variables are loaded
echo $RAZORPAY_KEY_ID
```

### 3. Switch to Real API
Once you have Razorpay keys configured, change this line in `src/lib/razorpayUtils.ts`:

```typescript
// Change from:
const response = await fetch('/api/payments/orders-debug', {

// To:
const response = await fetch('/api/payments/orders', {
```

## Testing Payment Flow

### 1. Test Cards (Razorpay Test Mode)
```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure: 4000 0000 0000 0002
```

### 2. Test UPI (Razorpay Test Mode)
```
Success: success@razorpay
Failure: failure@razorpay
```

## Troubleshooting

### Common Issues

1. **"Payment system not configured"**
   - Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET
   - Check .env.local file exists and has correct values

2. **"Database error"**
   - Missing Supabase environment variables
   - Check SUPABASE_SERVICE_ROLE_KEY is set

3. **"Parcel request not found"**
   - Database schema mismatch
   - Run the database migration scripts

4. **"Amount must be between ₹1 and ₹50,000"**
   - This should be fixed with the recent updates
   - If still occurring, the amount calculation has an issue

### Debug Steps

1. **Check Server Logs**
   ```bash
   # In your terminal running the dev server
   # Look for console.error messages
   ```

2. **Check Network Tab**
   - Open browser dev tools → Network
   - Look at the request/response for /api/payments/orders

3. **Test Debug Endpoint**
   - The debug endpoint should work without any external dependencies
   - If it fails, there's a basic setup issue

4. **Check Database Tables**
   - Ensure parcel_requests table exists
   - Ensure user_profiles table exists
   - Run the database migration if needed

## Next Steps

1. **Get Razorpay Credentials**: Sign up and get test API keys
2. **Test Debug Flow**: Ensure the debug endpoint works
3. **Add Environment Variables**: Add Razorpay keys to .env.local
4. **Switch to Real API**: Change the endpoint in razorpayUtils.ts
5. **Test Real Payment**: Try a test payment with Razorpay test cards

---

The debug API will help us identify if the issue is with:
- Basic request structure ✓
- Environment variables ❌ 
- Database queries ❌
- Razorpay API calls ❌

Once the debug version works, we can isolate and fix the real API issues step by step.