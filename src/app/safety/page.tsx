import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  IdentificationIcon, 
  LockClosedIcon,
  EyeIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  DocumentCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function Safety() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PB</span>
              </div>
              <span className="text-xl font-bold text-blue-600">Parcel Bridge</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-500 hover:text-blue-600">
                Login
              </Link>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Your Safety is Our Priority</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Multiple layers of security, verification, and protection ensure every delivery is safe and secure
          </p>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Keep You Safe</h2>
            <p className="text-xl text-gray-600">Comprehensive security measures at every step</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Identity Verification */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <IdentificationIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Identity Verification</h3>
              <p className="text-gray-600">
                Aadhaar-based KYC verification for all users. Every carrier and sender is verified before joining.
              </p>
            </div>

            {/* OTP Security */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <LockClosedIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">OTP Handover</h3>
              <p className="text-gray-600">
                Secure pickup and delivery with unique OTP verification. Only authorized persons can collect parcels.
              </p>
            </div>

            {/* Real-time Tracking */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <EyeIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Live Tracking</h3>
              <p className="text-gray-600">
                Track your parcel in real-time. Know exactly where your package is throughout the journey.
              </p>
            </div>

            {/* 24/7 Support */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <PhoneIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Round-the-clock customer support. Emergency assistance available anytime during delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Protection */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <CurrencyRupeeIcon className="w-16 h-16 text-green-600 mb-6" />
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Financial Protection</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Escrow Payment System</h3>
                    <p className="text-gray-600">
                      Your money is held securely in escrow until successful delivery. No payment to carriers until you confirm receipt.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Refunds</h3>
                    <p className="text-gray-600">
                      If delivery fails or gets cancelled, get instant refund to your wallet. No waiting periods.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Insurance Coverage</h3>
                    <p className="text-gray-600">
                      Optional insurance coverage up to ₹10,000 for high-value items. Complete protection for your parcels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">₹0</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Lost Package Claims</h3>
                <p className="text-gray-600 mb-6">
                  In 2+ years of operation, we've had zero lost package claims thanks to our robust verification system.
                </p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-1">99.9%</div>
                  <p className="text-gray-600 text-sm">Successful Delivery Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Process */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Carrier Verification Process</h2>
            <p className="text-xl text-gray-600">Rigorous screening ensures only trusted carriers handle your parcels</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentCheckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Verification</h3>
              <p className="text-gray-600 text-sm">Aadhaar card, PAN card, and phone number verification</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EyeIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Background Check</h3>
              <p className="text-gray-600 text-sm">Criminal background verification and character references</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Program</h3>
              <p className="text-gray-600 text-sm">Mandatory safety training and platform orientation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">4</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval & Monitoring</h3>
              <p className="text-gray-600 text-sm">Final approval and continuous performance monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Safety Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Senders */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">For Senders</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Never send prohibited items (cash, jewelry, electronics over ₹10,000)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Pack items securely with proper wrapping and cushioning</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Verify carrier identity before handover using OTP</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Keep receipts and photos of packages as backup</span>
                </li>
              </ul>
            </div>

            {/* For Carriers */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">For Carriers</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Verify package contents during pickup using OTP</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Keep packages secure during travel, avoid tampering</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Contact support immediately if any issues arise</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Complete delivery only to verified recipients with OTP</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Support */}
      <div className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <PhoneIcon className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Emergency Support</h2>
          <p className="text-xl text-gray-600 mb-8">
            If you encounter any safety issues during pickup or delivery, contact us immediately
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Hotline</h3>
              <p className="text-2xl font-bold text-red-600">1800-PB-HELP</p>
              <p className="text-gray-600 text-sm">Available 24/7</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Support</h3>
              <p className="text-2xl font-bold text-green-600">+91 9999-PB-HELP</p>
              <p className="text-gray-600 text-sm">Quick response</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">In-App Support</h3>
              <p className="text-2xl font-bold text-blue-600">Chat Button</p>
              <p className="text-gray-600 text-sm">Real-time assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Stats */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-gray-600">Our safety record speaks for itself</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <p className="text-gray-600">Verified Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1,00,000+</div>
              <p className="text-gray-600">Safe Deliveries</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">4.8/5</div>
              <p className="text-gray-600">Safety Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Experience Safe Deliveries</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our secure platform and send parcels with complete peace of mind
          </p>
          <div className="space-x-4">
            <Link 
              href="/auth/signup" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
            >
              Start Secure Delivery
            </Link>
            <Link 
              href="/contact" 
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Parcel Bridge. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
