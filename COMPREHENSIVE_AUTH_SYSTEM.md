# Comprehensive Authentication System - Parcel Bridge

## Overview

The Parcel Bridge application now features a comprehensive authentication system that supports multiple login methods, detailed signup flows, and role-based access control. The system uses a hybrid approach with Firebase Authentication for auth handling and Supabase for user profile storage.

## Authentication Methods

### 1. Email & Password Authentication
- **Signup**: Users provide first name, last name, email, and password
- **Login**: Standard email/password login
- **Features**: 
  - Email verification sent automatically
  - Password strength validation (minimum 6 characters)
  - Remember me option

### 2. Phone Number Authentication
- **Signup**: Phone number with OTP verification
- **Login**: Phone number with OTP verification
- **Features**:
  - Automatic country code (+91) addition
  - 6-digit OTP verification
  - reCAPTCHA protection against abuse

### 3. Google OAuth
- **Signup/Login**: One-click Google authentication
- **Features**:
  - Automatic profile extraction (name, email)
  - Seamless account creation
  - No password required

## Complete Signup Flow

### Step 1: Account Creation
Users choose their preferred method:
- **Email**: Fill in first name, last name, email, password
- **Phone**: Enter phone number for OTP
- **Google**: One-click OAuth

### Step 2: Phone Verification (Required for all users)
- All users must verify their phone number for security
- SMS OTP sent to provided phone number
- Email/Google users add phone verification after account creation

### Step 3: Role Selection
Users must select their role before accessing the platform:
- **Sender**: Send parcels via train passengers
  - Post parcel requests
  - Connect with verified carriers
  - Track parcels in real-time
  - Rate and review carriers

- **Carrier**: Carry parcels during train journeys
  - Browse available parcel requests
  - Earn money during travel
  - Build trusted carrier profile
  - Receive ratings from senders

### Step 4: Dashboard Access
Once role is selected, users get full access to role-specific features.

## Database Schema Updates

### User Profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name VARCHAR(100),
    role user_role DEFAULT NULL,
    auth_method VARCHAR(20) DEFAULT 'phone', -- 'phone', 'email', 'google'
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_aadhaar_verified BOOLEAN DEFAULT FALSE,
    profile_complete BOOLEAN DEFAULT FALSE,
    -- ... other fields
);
```

## Authentication Flow Logic

### New User Journey
1. **Landing Page** → Choose login/signup method
2. **Account Creation** → Create account with chosen method
3. **Phone Verification** → Verify phone number (if not done in step 2)
4. **Role Selection** → Choose sender or carrier role
5. **Dashboard** → Access to full platform features

### Returning User Journey
1. **Landing Page** → Choose login method
2. **Authentication** → Login with existing credentials
3. **Dashboard** → Direct access (role already set)

### Incomplete Profile Handling
- Users without verified phone → Redirect to phone verification
- Users without role → Redirect to role selection
- Users with complete profile → Direct dashboard access

## Security Features

### Phone Authentication
- reCAPTCHA protection against spam
- OTP expiration and rate limiting
- Country code validation

### Email Authentication
- Email verification required
- Password strength validation
- Secure password storage via Firebase

### Google OAuth
- Secure OAuth 2.0 flow
- Profile data validation
- Automatic account linking

### Profile Protection
- Phone verification mandatory for all users
- Role-based access control
- Secure session management

## Technical Implementation

### Frontend Components
- **Login Page** (`/auth/login`): Multi-method login interface
- **Signup Page** (`/auth/signup`): Comprehensive signup flow
- **Role Selection** (`/auth/select-role`): Role selection interface

### Backend Services
- **HybridAuth Service**: Core authentication logic
- **Firebase Integration**: User authentication
- **Supabase Integration**: Profile data storage

### State Management
- **useHybridAuth Hook**: Global authentication state
- **SSR Safe**: Server-side rendering compatible
- **Real-time Updates**: Profile changes reflected immediately

## User Experience Features

### Progressive Signup
- Step-by-step guided process
- Clear progress indicators
- Ability to go back and modify

### Flexible Login
- Multiple authentication options
- Remember login preferences
- Quick switching between methods

### Role-Based Onboarding
- Tailored explanations for each role
- Clear benefit descriptions
- Easy role switching later

### Error Handling
- Clear error messages
- Helpful validation feedback
- Graceful failure recovery

## API Endpoints

### Authentication Methods
```typescript
// Email signup
signUpWithEmail(email, password, firstName, lastName)

// Email login
signInWithEmail(email, password)

// Google authentication
signInWithGoogle()

// Phone OTP
sendOTP(phoneNumber)
verifyOTP(confirmationResult, otp)

// Profile management
updateRole(role)
updateProfile(updates)
```

### User State Properties
```typescript
interface HybridUser {
  firebaseUid: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: 'sender' | 'carrier' | 'admin';
  authMethod: 'phone' | 'email' | 'google';
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  profileComplete: boolean;
  // ... other fields
}
```

## Configuration Requirements

### Environment Variables
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Firebase Console Setup
1. Enable Authentication methods:
   - Email/Password
   - Phone
   - Google OAuth
2. Configure OAuth consent screen
3. Add authorized domains
4. Set up reCAPTCHA for phone auth

### Supabase Setup
1. Create user_profiles table with updated schema
2. Set up RLS policies
3. Configure authentication integration

## Testing Scenarios

### Email Authentication
1. Sign up with email and password
2. Verify email address
3. Add phone verification
4. Select role
5. Access dashboard

### Phone Authentication
1. Sign up with phone number
2. Receive and verify OTP
3. Select role
4. Access dashboard

### Google Authentication
1. Sign up with Google
2. Add phone verification
3. Select role
4. Access dashboard

### Role Management
1. Change role in settings
2. Verify role-specific features
3. Test role-based redirects

## Deployment Considerations

### Firebase Security Rules
- Proper authentication requirements
- User data access restrictions
- Role-based permissions

### Supabase RLS Policies
- User can only access own profile
- Role-based data access
- Admin override capabilities

### Production Environment
- HTTPS required for all auth methods
- Proper CORS configuration
- Environment variable security

## Future Enhancements

### Additional Authentication Methods
- Apple Sign-In
- Facebook Login
- LinkedIn OAuth

### Enhanced Security
- Two-factor authentication
- Device registration
- Suspicious activity detection

### Profile Enhancements
- Profile photo upload
- Document verification
- Enhanced KYC process

### Role Extensions
- Admin role capabilities
- Specialized carrier types
- Business account options

This comprehensive authentication system provides a secure, user-friendly, and scalable foundation for the Parcel Bridge platform, supporting multiple authentication methods while maintaining a smooth user experience throughout the onboarding process.
