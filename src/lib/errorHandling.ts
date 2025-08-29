/**
 * User-friendly error messages for Supabase and other errors
 */

export const getSupabaseErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  const errorCode = error.code;
  const errorMessage = error.message?.toLowerCase() || '';

  // Supabase Auth errors
  switch (errorCode) {
    case 'invalid_credentials':
    case 'email_not_confirmed':
      return 'Invalid email or password. Please check your credentials.';
    
    case 'signup_disabled':
      return 'New user registration is currently disabled.';
    
    case 'email_address_invalid':
      return 'Please enter a valid email address.';
    
    case 'password_strength_insufficient':
      return 'Password is too weak. Please use at least 8 characters with numbers and symbols.';
    
    case 'email_address_not_authorized':
      return 'This email address is not authorized to sign up.';
    
    case 'phone_number_already_exists':
      return 'This phone number is already registered. Please sign in instead.';
    
    case 'phone_number_invalid':
      return 'Please enter a valid phone number.';
    
    case 'otp_expired':
      return 'The verification code has expired. Please request a new one.';
    
    case 'otp_disabled':
      return 'Phone verification is currently unavailable.';
    
    case 'too_many_requests':
      return 'Too many requests. Please wait a few minutes before trying again.';
    
    case 'captcha_failed':
      return 'Security verification failed. Please try again.';
    
    case 'saml_provider_disabled':
      return 'Single sign-on is currently disabled.';
    
    case 'email_change_confirm_failed':
      return 'Failed to confirm email change. Please try again.';
    
    case 'user_not_found':
      return 'No account found with this email address.';
    
    case 'session_not_found':
      return 'Your session has expired. Please sign in again.';
    
    case 'flow_state_not_found':
      return 'Authentication process was interrupted. Please start again.';
    
    case 'flow_state_expired':
      return 'Authentication session expired. Please start the process again.';
    
    case 'signup_blocked':
      return 'Account creation is temporarily blocked for this email.';
    
    case 'provider_email_needs_verification':
      return 'Please verify your email address before signing in.';
    
    case 'invite_not_found':
      return 'Invalid or expired invitation link.';
    
    case 'validation_failed':
      return 'Please check that all required fields are filled correctly.';
    
    case 'oauth_provider_not_supported':
      return 'This sign-in method is not supported.';
    
    case 'unexpected_audience':
      return 'Authentication configuration error. Please contact support.';
    
    case 'single_identity_not_deletable':
      return 'Cannot remove your only sign-in method.';
    
    case 'email_conflict_identity_not_deletable':
      return 'Cannot remove this sign-in method due to email conflicts.';
    
    case 'identity_already_exists':
      return 'This account is already linked to another user.';
    
    case 'insufficient_aal':
      return 'Additional authentication required for this action.';
    
    case 'mfa_factor_name_conflict':
      return 'A verification method with this name already exists.';
    
    case 'mfa_factor_not_found':
      return 'Multi-factor authentication method not found.';
    
    case 'mfa_ip_address_mismatch':
      return 'Security check failed. Please try from your original device.';
    
    case 'mfa_challenge_expired':
      return 'Multi-factor authentication challenge expired.';
    
    case 'mfa_verification_failed':
      return 'Multi-factor authentication verification failed.';
    
    case 'mfa_verified_factor_exists':
      return 'This multi-factor authentication method is already verified.';
    
    case 'mfa_unverified_factor_exists':
      return 'Please complete setup of your existing multi-factor authentication method first.';
    
    case 'insufficient_permissions':
      return 'You do not have permission to perform this action.';
    
    case 'database_connection_failed':
      return 'Unable to connect to the database. Please try again later.';
    
    case 'query_timeout':
      return 'The request took too long to complete. Please try again.';
    
    case 'rate_limit_exceeded':
      return 'Too many requests. Please wait before trying again.';
    
    case 'storage_object_not_found':
      return 'The requested file was not found.';
    
    case 'storage_quota_exceeded':
      return 'Storage limit exceeded. Please contact support.';
    
    default:
      // Clean up common error message patterns
      let message = errorMessage
        .replace(/supabase: /gi, '')
        .replace(/auth: /gi, '')
        .replace(/database: /gi, '')
        .replace(/storage: /gi, '')
        .replace(/^error: /gi, '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase();

      // Capitalize first letter
      message = message.charAt(0).toUpperCase() + message.slice(1);
      
      // Fallback for very short or unclear messages
      if (!message || message.length < 10 || message.includes('supabase') || message.includes('error')) {
        return 'Something went wrong. Please try again or contact support if the problem persists.';
      }
      
      return message;
  }
};

/**
 * Log error with context for debugging while showing user-friendly message
 */
export const handleErrorWithContext = (error: any, context: string, userId?: string) => {
  const userFriendlyMessage = getSupabaseErrorMessage(error);
  
  // Log detailed error for debugging
  console.error(`[${context}] Error:`, {
    error,
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    userId: userId ? `user_${userId.substring(0, 8)}...` : 'anonymous',
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location?.href : 'server'
  });

  return {
    userMessage: userFriendlyMessage,
    technicalError: error
  };
};

/**
 * Handle API errors with proper logging and user feedback
 */
export const handleApiError = (error: any, operation: string, userId?: string) => {
  const userFriendlyMessage = getSupabaseErrorMessage(error);
  
  // Log for monitoring and debugging
  console.error(`[API Error - ${operation}]`, {
    error,
    message: error?.message,
    status: error?.status,
    statusText: error?.statusText,
    userId: userId ? `user_${userId.substring(0, 8)}...` : 'anonymous',
    operation,
    timestamp: new Date().toISOString()
  });

  return {
    success: false,
    error: userFriendlyMessage,
    technicalError: error?.message || 'Unknown error'
  };
};
