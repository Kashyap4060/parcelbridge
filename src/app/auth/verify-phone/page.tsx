'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function VerifyPhonePage() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')

  useEffect(() => {
    if (!phone) {
      router.push('/auth/login')
    }
  }, [phone, router])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Implement OTP verification logic with Supabase
      // For now, simulate verification
      if (otp === '123456') {
        router.push('/auth/select-role')
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError('')

    try {
      // TODO: Implement resend OTP logic
      // For now, simulate resend
      setTimeout(() => {
        setResendLoading(false)
        // Show success message or handle resend
      }, 2000)
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Failed to resend OTP. Please try again.')
      setResendLoading(false)
    }
  }

  if (!phone) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Phone Number
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Enter the 6-digit code sent to {phone}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="mt-1 text-center text-lg tracking-widest"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {resendLoading ? 'Sending...' : "Didn't receive code? Resend"}
              </Button>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/auth/login')}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}