'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SimpleSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Form submitted with:', { fullName, email, phone });
      // Temporary: just log the data
      alert('Form submitted successfully! Check console for details.');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      padding: '48px 24px' 
    }}>
      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto', 
        width: '100%' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            height: '48px', 
            width: '48px', 
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            P
          </div>
        </div>
        
        <h2 style={{ 
          fontSize: '30px', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          Create your account
        </h2>
        
        <p style={{ 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#6b7280', 
          marginBottom: '32px' 
        }}>
          Or{' '}
          <Link href="/auth/login" style={{ 
            color: '#2563eb', 
            textDecoration: 'none' 
          }}>
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto', 
        width: '100%' 
      }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '32px 24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          borderRadius: '8px' 
        }}>
          {error && (
            <div style={{ 
              marginBottom: '16px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '12px 16px', 
              borderRadius: '6px' 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'block' }}>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="fullName" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '4px' 
              }}>
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '4px' 
              }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="phone" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '4px' 
              }}>
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="password" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '4px' 
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="confirmPassword" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '4px' 
              }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'block',
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: isLoading ? 0.6 : 1,
                  boxSizing: 'border-box'
                }}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '24px' }}>
            <div style={{ 
              position: 'relative', 
              marginBottom: '24px',
              textAlign: 'center' 
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: 0, 
                right: 0, 
                height: '1px', 
                backgroundColor: '#d1d5db' 
              }}></div>
              <span style={{ 
                backgroundColor: '#ffffff', 
                padding: '0 12px', 
                fontSize: '14px', 
                color: '#6b7280',
                position: 'relative'
              }}>
                Or continue with
              </span>
            </div>

            <button
              onClick={() => console.log('Google signup clicked')}
              disabled={isLoading}
              style={{
                backgroundColor: '#ffffff',
                color: '#2563eb',
                border: '1px solid #2563eb',
                padding: '12px 16px',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isLoading ? 0.6 : 1,
                boxSizing: 'border-box'
              }}
            >
              <span style={{ marginRight: '8px' }}>📧</span>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
