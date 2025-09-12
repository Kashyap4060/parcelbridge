/**
 * User-friendly error message mappings
 * Converts technical Firebase/API errors into readable messages
 */

export interface UserError {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  action?: string;
}

/**
 * Maps Firebase error codes to user-friendly messages
 */
const firebaseErrorMap: Record<string, UserError> = {
  // Authentication errors
  'auth/invalid-credential': {
    title: 'Login Failed',
    message: 'The email or password you entered is incorrect. Please check your credentials and try again.',
    type: 'error',
    action: 'Try again or reset your password'
  },
  'auth/user-not-found': {
    title: 'Account Not Found',
    message: 'No account found with this email address. Please check your email or create a new account.',
    type: 'error',
    action: 'Check email or sign up'
  },
  'auth/wrong-password': {
    title: 'Incorrect Password',
    message: 'The password you entered is incorrect. Please try again or reset your password.',
    type: 'error',
    action: 'Try again or reset password'
  },
  'auth/email-already-in-use': {
    title: 'Email Already Registered',
    message: 'An account with this email already exists. Please sign in instead or use a different email.',
    type: 'error',
    action: 'Sign in or use different email'
  },
  'auth/weak-password': {
    title: 'Weak Password',
    message: 'Your password should be at least 6 characters long and include a mix of letters and numbers.',
    type: 'warning',
    action: 'Choose a stronger password'
  },
  'auth/invalid-email': {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
    type: 'error',
    action: 'Check email format'
  },
  'auth/user-disabled': {
    title: 'Account Disabled',
    message: 'Your account has been temporarily disabled. Please contact support for assistance.',
    type: 'error',
    action: 'Contact support'
  },
  'auth/too-many-requests': {
    title: 'Too Many Attempts',
    message: 'Too many failed login attempts. Please wait a few minutes before trying again.',
    type: 'warning',
    action: 'Wait and try again'
  },
  'auth/operation-not-allowed': {
    title: 'Sign-in Method Disabled',
    message: 'This sign-in method is currently not available. Please try a different method.',
    type: 'error',
    action: 'Try different sign-in method'
  },
  'auth/invalid-phone-number': {
    title: 'Invalid Phone Number',
    message: 'Please enter a valid phone number with country code (e.g., +91 9876543210).',
    type: 'error',
    action: 'Check phone number format'
  },
  'auth/invalid-verification-code': {
    title: 'Invalid OTP',
    message: 'The OTP you entered is incorrect or has expired. Please request a new OTP.',
    type: 'error',
    action: 'Request new OTP'
  },
  'auth/code-expired': {
    title: 'OTP Expired',
    message: 'The OTP has expired. Please request a new one.',
    type: 'warning',
    action: 'Request new OTP'
  },
  'auth/missing-phone-number': {
    title: 'Phone Number Required',
    message: 'Please enter your phone number to continue.',
    type: 'error',
    action: 'Enter phone number'
  },
  'auth/quota-exceeded': {
    title: 'SMS Quota Exceeded',
    message: 'Too many SMS requests. Please try again later.',
    type: 'warning',
    action: 'Try again later'
  },
  'auth/captcha-check-failed': {
    title: 'Verification Failed',
    message: 'Please complete the verification check and try again.',
    type: 'error',
    action: 'Complete verification'
  },
  'auth/network-request-failed': {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    type: 'error',
    action: 'Check internet connection'
  }
};

/**
 * Maps API error codes to user-friendly messages
 */
const apiErrorMap: Record<string, UserError> = {
  'PNR_NOT_FOUND': {
    title: 'PNR Not Found',
    message: 'The PNR number you entered was not found. Please check the number and try again.',
    type: 'error',
    action: 'Check PNR number'
  },
  'INVALID_PNR_FORMAT': {
    title: 'Invalid PNR Format',
    message: 'PNR number must be exactly 10 digits. Please enter a valid PNR number.',
    type: 'error',
    action: 'Enter 10-digit PNR'
  },
  'API_RATE_LIMIT': {
    title: 'Too Many Requests',
    message: 'You have made too many requests. Please wait a moment and try again.',
    type: 'warning',
    action: 'Wait and try again'
  },
  'API_KEY_INVALID': {
    title: 'Service Unavailable',
    message: 'The railway service is temporarily unavailable. Please try again later.',
    type: 'error',
    action: 'Try again later'
  }
};

/**
 * Extracts error code from Firebase error
 */
function extractErrorCode(error: any): string {
  if (typeof error === 'string') {
    // Handle string errors like "Firebase: Error (auth/invalid-credential)."
    const match = error.match(/\(([^)]+)\)/);
    return match ? match[1] : error;
  }
  
  if (error?.code) {
    return error.code;
  }
  
  if (error?.message) {
    const match = error.message.match(/\(([^)]+)\)/);
    return match ? match[1] : error.message;
  }
  
  return 'unknown-error';
}

/**
 * Converts any error into a user-friendly message
 */
export function getUserFriendlyError(error: any): UserError {
  const errorCode = extractErrorCode(error);
  
  // Check Firebase errors first
  if (firebaseErrorMap[errorCode]) {
    return firebaseErrorMap[errorCode];
  }
  
  // Check API errors
  if (apiErrorMap[errorCode]) {
    return apiErrorMap[errorCode];
  }
  
  // Handle generic errors
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Check for common patterns in error messages
  if (errorMessage.toLowerCase().includes('network')) {
    return {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      type: 'error',
      action: 'Check connection'
    };
  }
  
  if (errorMessage.toLowerCase().includes('timeout')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.',
      type: 'warning',
      action: 'Try again'
    };
  }
  
  // Default fallback
  return {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    type: 'error',
    action: 'Try again'
  };
}

/**
 * Creates a formatted error message for display
 */
export function formatErrorForDisplay(error: any): string {
  const userError = getUserFriendlyError(error);
  return `${userError.title}: ${userError.message}`;
}

/**
 * Creates an error object with action suggestion
 */
export function getErrorWithAction(error: any): { message: string; action?: string; type: string } {
  const userError = getUserFriendlyError(error);
  return {
    message: `${userError.title}: ${userError.message}`,
    action: userError.action,
    type: userError.type
  };
}



