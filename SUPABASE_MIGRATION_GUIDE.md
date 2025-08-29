# 🚀 Firebase to Supabase Migration Guide

## Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)** and sign in/create account
2. **Click "New Project"**
3. **Project Details:**
   - Organization: Create new or use existing
   - Name: `parcel-bridge`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users (India - ap-south-1 recommended)
   - Pricing Plan: Start with Free tier

4. **Wait for project creation** (takes 2-3 minutes)

## Step 2: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste the entire contents** of `supabase-schema.sql`
3. **Run the query** - this will create all tables, indexes, and functions
4. **Verify creation** by checking the Table Editor

## Step 3: Update Environment Variables

1. **Go to Project Settings > API** in Supabase dashboard
2. **Copy your project credentials:**
   - Project URL
   - Project API Key (anon/public)
   - Service Role Key (keep this secret!)

3. **Update `.env.local`:**
```bash
# Replace these placeholder values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Enable Authentication

1. **Go to Authentication > Settings** in Supabase dashboard
2. **Enable Phone Authentication:**
   - Go to Authentication > Providers
   - Enable "Phone" provider
   - Configure SMS provider (Twilio recommended for India)
   - Add your Twilio credentials

3. **Configure Email Authentication** (optional):
   - SMTP settings for email verification
   - Or use Supabase's built-in email service

## Step 5: Set Up Row Level Security (RLS)

The schema already includes RLS policies, but verify:

1. **Go to Authentication > Policies** in Supabase dashboard
2. **Check that all tables have appropriate policies**
3. **Test with different user roles**

## Step 6: Update Webhook URL

1. **Go to Razorpay Dashboard**
2. **Update webhook URL to:**
   ```
   https://your-domain.com/api/supabase/webhooks/razorpay
   ```

## Step 7: Data Migration (Optional)

If you want to migrate existing Firebase data:

### Export Firebase Data
```bash
# Install Firebase Tools
npm install -g firebase-tools

# Login and export
firebase login
firebase use parcel-bridge-4088
firebase firestore:export ./firebase-export
```

### Import to Supabase
```sql
-- Use the provided migration scripts in the data-migration/ folder
-- (These will be created in next steps)
```

## Step 8: Update Application Code

The following files have been updated for Supabase:

✅ **Created:**
- `src/lib/supabase.ts` - Supabase client
- `src/lib/supabase-server.ts` - Server-side client
- `src/components/providers/SupabaseAuthProvider.tsx` - Auth provider
- `src/app/api/supabase/razorpay/create-order/route.ts` - Order creation API
- `src/app/api/supabase/razorpay/verify-payment/route.ts` - Payment verification API
- `src/app/api/supabase/webhooks/razorpay/route.ts` - Webhook handler

✅ **Updated:**
- `next.config.mjs` - Removed static export to enable API routes
- `src/components/ui/PaymentModal.tsx` - Updated to use new API routes
- `.env.local` - Added Supabase environment variables

## Step 9: Test the Migration

1. **Start the development server:**
```bash
npm run dev
```

2. **Test user registration and login**
3. **Test wallet top-up functionality**
4. **Verify webhook handling**

## Step 10: Update Main Layout

Replace Firebase auth provider with Supabase:

```tsx
// In src/app/layout.tsx
import { SupabaseAuthProvider } from '@/components/providers/SupabaseAuthProvider';

// Replace AuthProvider with SupabaseAuthProvider
```

## Benefits After Migration ✨

- **✅ API Routes Work** - No more CORS issues
- **✅ Better Database** - PostgreSQL with powerful queries
- **✅ Real-time Updates** - Better than Firestore
- **✅ Built-in Auth** - Phone OTP, social logins
- **✅ Better Performance** - Optimized for your use case
- **✅ Cost Effective** - More predictable pricing
- **✅ Better Dashboard** - More developer-friendly
- **✅ PostGIS Support** - For location-based features

## Deployment Options

After migration, you can deploy to:

1. **Vercel** (Recommended) - Perfect for Next.js
2. **Netlify** - Good alternative
3. **Railway** - Includes database hosting
4. **Your own server** - Full control

Would you like me to proceed with any specific step or create additional migration utilities?
