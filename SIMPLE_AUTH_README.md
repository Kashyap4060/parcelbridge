# Simple Supabase Authentication System

This document describes the new simple email/password authentication system that replaces the previous hybrid Firebase+Supabase setup.

## Overview

The new authentication system uses:
- **Supabase Auth** for user authentication (email/password)
- **Supabase Database** for user profile storage
- **Row Level Security (RLS)** for data access control
- **React Context** for state management

## Key Components

### 1. Authentication Service (`src/lib/simpleAuth.ts`)
- `SimpleAuthService` class handles all authentication operations
- Methods: `signUp()`, `signIn()`, `signOut()`, `getCurrentUser()`
- Automatic profile creation in `user_profiles` table on signup

### 2. React Hook (`src/hooks/useSimpleAuth.tsx`)
- `SimpleAuthProvider` context provider for app-wide auth state
- `useSimpleAuth()` hook for accessing auth state and methods
- Automatic session persistence and restoration

### 3. Authentication Pages
- **Signup** (`/auth/signup`): Email/password registration with profile collection
- **Login** (`/auth/login`): Email/password sign-in
- **Role Selection** (`/auth/select-role`): Post-signup role selection

## Database Schema

### User Profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role DEFAULT NULL,
    -- ... other profile fields
);
```

### Key Features
- **Direct Supabase Auth Integration**: `id` field references `auth.users(id)`
- **RLS Policies**: Users can only access their own profile data
- **Automatic Profile Creation**: Trigger creates profile on user signup
- **Phone Number Collection**: Required during signup for future WhatsApp OTP

## Migration Steps

### 1. Database Migration
Run the provided SQL migration script:
```bash
# Execute SIMPLE_AUTH_SCHEMA_UPDATE.sql in Supabase SQL Editor
```

### 2. Environment Variables
Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Application Updates
- ✅ **Authentication Service**: Simple email/password auth
- ✅ **React Context**: App-wide auth state management  
- ✅ **Auth Pages**: Signup, login, role selection
- ✅ **Layout Provider**: App wrapped with SimpleAuthProvider
- 🚧 **Dashboard Integration**: Update dashboard to use new auth
- 🚧 **Protected Routes**: Add route protection middleware
- 🚧 **Profile Management**: User profile editing features

## User Flow

### New User Registration
1. User visits `/auth/signup`
2. Fills registration form (name, email, phone, password)
3. Form validation and Supabase Auth signup
4. Automatic profile creation in `user_profiles` table
5. Redirect to `/auth/select-role` for role selection
6. Role selection and redirect to dashboard

### Existing User Login
1. User visits `/auth/login`
2. Enters email and password
3. Supabase Auth sign-in
4. Profile data loaded from `user_profiles` table
5. Redirect to dashboard

## Security Features

### Row Level Security (RLS)
- Users can only access their own profile data
- Policies enforce `auth.uid() = user_profiles.id`
- Automatic cleanup on user deletion

### Data Validation
- Client-side form validation
- Email format validation
- Phone number format validation (Indian numbers)
- Password strength requirements (minimum 6 characters)

## Future Enhancements

### WhatsApp OTP Integration
- Phone number already collected during signup
- Ready for WhatsApp API integration for OTP verification
- Can be added without schema changes

### Google OAuth (Optional)
- Can be added as additional auth provider
- Supabase Auth supports Google OAuth out of the box
- Would complement email/password auth

### Enhanced Profile Management
- Profile picture upload
- Address management
- Verification status tracking
- Role switching functionality

## Testing

### Manual Testing Steps
1. **Signup Flow**:
   - Visit `/auth/signup`
   - Fill all fields and submit
   - Verify redirect to role selection
   - Complete role selection

2. **Login Flow**:
   - Visit `/auth/login`
   - Enter credentials and submit
   - Verify redirect to dashboard

3. **Session Persistence**:
   - Login and refresh page
   - Verify user remains logged in
   - Close browser and reopen
   - Verify session restoration

### Automated Testing
```bash
# Run tests (when implemented)
npm run test
```

## Troubleshooting

### Common Issues

1. **Profile Creation Fails**:
   - Check if trigger `on_auth_user_created` exists
   - Verify `handle_new_user()` function is present
   - Check RLS policies allow INSERT for authenticated users

2. **Session Not Persisting**:
   - Verify Supabase client configuration
   - Check browser local storage for session data
   - Ensure `persistSession: true` in Supabase client

3. **RLS Permission Denied**:
   - Check if RLS policies are correctly configured
   - Verify user is authenticated before accessing data
   - Check `auth.uid()` matches `user_profiles.id`

### Debug Commands
```javascript
// Check current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);

// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Check profile data
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user?.id)
  .single();
console.log('Profile data:', data, 'Error:', error);
```

## Support

For issues or questions:
1. Check Supabase dashboard for auth logs
2. Review browser console for JavaScript errors  
3. Check network tab for failed API requests
4. Verify database schema and RLS policies
