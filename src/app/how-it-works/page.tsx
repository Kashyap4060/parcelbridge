import Link from 'next/link'
import { 
  UserIcon, 
  TruckIcon, 
  CurrencyRupeeIcon, 
  CheckCircleIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterIcon
} from '@heroicons/react/24/outline'

export default function HowItWorks() {
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
          <h1 className="text-5xl font-bold text-gray-900 mb-6">How Parcel Bridge Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, secure, and smart parcel delivery connecting senders with verified train passengers
          </p>
        </div>
      </div>

      {/* How It Works - For Senders */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Parcel Senders</h2>
            <p className="text-xl text-gray-600">Send parcels across India at affordable rates</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Request</h3>
              <p className="text-gray-600">
                Post your parcel details including pickup/drop locations, package size, and preferred delivery date
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Carrier</h3>
              <p className="text-gray-600">
                Verified train passengers traveling on your route will accept your parcel delivery request
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Delivery</h3>
              <p className="text-gray-600">
                Track your parcel in real-time with OTP-based secure handover and escrow payment protection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - For Carriers */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Train Passengers (Carriers)</h2>
            <p className="text-xl text-gray-600">Earn money while you travel</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Journey</h3>
              <p className="text-gray-600">
                Enter your PNR details to verify your train journey and set availability for parcel delivery
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-teal-600" />
              </div>
              <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accept Parcels</h3>
              <p className="text-gray-600">
                Browse available parcel requests on your route and accept ones that suit your travel plans
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyRupeeIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Paid</h3>
              <p className="text-gray-600">
                Deliver parcels safely and earn money directly to your wallet with instant payment release
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built for Security & Trust</h2>
            <p className="text-xl text-gray-300">Multiple layers of protection for every delivery</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <ShieldCheckIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Identity Verification</h3>
              <p className="text-gray-300 text-sm">Aadhaar-based verification for all users</p>
            </div>
            
            <div className="text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">OTP Handover</h3>
              <p className="text-gray-300 text-sm">Secure pickup and delivery with OTP verification</p>
            </div>
            
            <div className="text-center">
              <CurrencyRupeeIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Escrow Protection</h3>
              <p className="text-gray-300 text-sm">Payment held securely until successful delivery</p>
            </div>
            
            <div className="text-center">
              <ChatBubbleBottomCenterIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-300 text-sm">Round-the-clock customer support</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users already saving money on parcel deliveries
          </p>
          <div className="space-x-4">
            <Link 
              href="/auth/signup" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/contact" 
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 inline-block"
            >
              Contact Us
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
