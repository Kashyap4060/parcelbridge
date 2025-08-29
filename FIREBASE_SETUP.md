# Firebase Phone Authentication Setup

## 🚨 Important: Complete These Steps to Fix Phone Authentication

### 1. Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `parcel-bridge-4088`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Phone** and enable it
5. Save the changes

### 2. Configure Test Phone Numbers (For Development)

Since you're in development, you should add test phone numbers:

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Scroll down to **Phone numbers for testing**
3. Add these test numbers:
   ```
   Phone: +91 9876543210
   OTP: 123456
   
   Phone: +91 8765432109  
   OTP: 654321
   ```

### 3. Add Authorized Domains

1. In Firebase Console → **Authentication** → **Settings**
2. Go to **Authorized domains**
3. Add your domains:
   ```
   localhost (for development)
   parcelbridge.in (production)
   www.parcelbridge.in (production)
   parcel-bridge-4088.firebaseapp.com (fallback)
   ```

### 4. Alternative: Use Firebase App Check (Production Ready)

For production, you'll need to set up Firebase App Check:

1. Go to Firebase Console → **App Check**
2. Register your app
3. Select reCAPTCHA v3 as the provider
4. Add your domain

### 5. Environment Variables

Make sure your `.env.local` has all the correct Firebase config values:

```bash
# Your current config looks correct:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDs2IZQTkdLgixue39Z2GpC3hB0gzj3lz4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=parcel-bridge-4088.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=parcel-bridge-4088
# ... rest of your config
```

### 6. Testing the New Signup Flow

After completing the above steps:

1. Go to `http://localhost:3001/auth/signup`
2. Fill in the form with:
   - Name: Your Name
   - Phone: 9876543210 (test number)
   - Email: test@example.com
   - Password: test123
3. Click "Send OTP"
4. Enter OTP: 123456
5. Complete account creation

## 🆕 New Multi-Step Signup Process

The signup page now has 3 steps:

1. **Details**: User enters name, phone, email, password
2. **Phone Verification**: OTP is sent and verified
3. **Account Creation**: Final account setup

This ensures phone numbers are verified before account creation!
