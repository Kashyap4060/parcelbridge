/**
 * Firebase configuration for Authentication
 * Using Firebase Auth with Supabase Database (Hybrid Approach)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDs2IZQTkdLgixue39Z2GpC3hB0gzj3lz4",
  authDomain: "parcel-bridge-4088.firebaseapp.com",
  databaseURL: "https://parcel-bridge-4088-default-rtdb.firebaseio.com",
  projectId: "parcel-bridge-4088",
  storageBucket: "parcel-bridge-4088.firebasestorage.app",
  messagingSenderId: "411262188769",
  appId: "1:411262188769:web:854dc9678e1d9f8d26cba0",
  measurementId: "G-BLDMZLV7PF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Phone Authentication Functions
export { RecaptchaVerifier, signInWithPhoneNumber };

export default app;




