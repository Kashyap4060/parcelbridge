import Link from 'next/link'
import { 
  CheckIcon, 
  XMarkIcon, 
  CurrencyRupeeIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function Pricing() {
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
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pay only for what you use. No hidden fees, no subscription charges. Just fair pricing for everyone.
          </p>
        </div>
      </div>

      {/* Pricing Calculator */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Delivery Fee Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="border rounded-lg p-6">
                <TruckIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Distance Based</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">₹2-5</div>
                <p className="text-gray-600 text-sm">per km</p>
              </div>
              <div className="border rounded-lg p-6">
                <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Weight Based</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">₹10-20</div>
                <p className="text-gray-600 text-sm">per kg</p>
              </div>
              <div className="border rounded-lg p-6">
                <CurrencyRupeeIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Minimum Charge</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">₹50</div>
                <p className="text-gray-600 text-sm">for any delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing Tiers</h2>
            <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Tier */}
            <div className="border rounded-lg p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <p className="text-gray-600 mb-4">For occasional senders</p>
                <div className="text-4xl font-bold text-gray-900">₹0</div>
                <p className="text-gray-600 text-sm">No monthly fee</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Standard delivery rates</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Basic tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>OTP verification</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Customer support</span>
                </li>
                <li className="flex items-center">
                  <XMarkIcon className="w-5 h-5 text-red-500 mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Get Started Free
              </button>
            </div>

            {/* Premium Tier */}
            <div className="border-2 border-blue-500 rounded-lg p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <p className="text-gray-600 mb-4">For regular users</p>
                <div className="text-4xl font-bold text-blue-600">₹299</div>
                <p className="text-gray-600 text-sm">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>20% discounted rates</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Real-time tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority carrier matching</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Insurance coverage</span>
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                Choose Premium
              </button>
            </div>

            {/* Business Tier */}
            <div className="border rounded-lg p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-600 mb-4">For businesses & high-volume users</p>
                <div className="text-4xl font-bold text-gray-900">₹999</div>
                <p className="text-gray-600 text-sm">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>40% discounted rates</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Bulk upload</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carrier Earnings */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Carrier Earnings</h2>
            <p className="text-xl text-gray-600">How much can you earn as a train passenger?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">₹100-500</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Per Delivery</h3>
              <p className="text-gray-600">
                Earn based on distance and package size. Short routes start at ₹100, long routes can earn ₹500+
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">₹2,000-10,000</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Potential</h3>
              <p className="text-gray-600">
                Regular travelers can earn substantial income. Frequent routes with consistent deliveries pay more
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">70%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Commission Share</h3>
              <p className="text-gray-600">
                Carriers keep 70% of delivery fees. No hidden deductions. Instant payment to your wallet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Pricing FAQ</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How is the delivery fee calculated?
              </h3>
              <p className="text-gray-600">
                Delivery fees are calculated based on distance (₹2-5 per km), package weight (₹10-20 per kg), 
                with a minimum charge of ₹50. The final fee is automatically calculated when you create a delivery request.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are there any hidden charges?
              </h3>
              <p className="text-gray-600">
                No hidden charges! The price you see is the price you pay. We believe in transparent pricing 
                with no surprise fees.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                When do I pay for the delivery?
              </h3>
              <p className="text-gray-600">
                Payment is processed when a carrier accepts your delivery request. The amount is held in escrow 
                and released only after successful delivery confirmation.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I get a refund if delivery fails?
              </h3>
              <p className="text-gray-600">
                Yes! If delivery fails due to carrier issues, you get a full refund to your wallet within 24 hours. 
                Your money is always protected with our escrow system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Start Saving on Deliveries Today</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust Parcel Bridge for affordable, secure deliveries
          </p>
          <div className="space-x-4">
            <Link 
              href="/auth/signup" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/contact" 
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 inline-block"
            >
              Get Custom Quote
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
