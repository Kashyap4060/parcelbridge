import Link from 'next/link'

export default function Privacy() {
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

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  At Parcel Bridge, we collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and profile information</li>
                  <li><strong>Location Data:</strong> Pick-up and delivery addresses, current location (with your permission)</li>
                  <li><strong>Payment Information:</strong> Payment methods, transaction history, and billing information</li>
                  <li><strong>Communication Data:</strong> Messages, ratings, and reviews within the platform</li>
                  <li><strong>Device Information:</strong> Device type, operating system, and app usage data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="text-gray-700 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our delivery services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices, updates, and security alerts</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Communicate with you about products, services, and promotional offers</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> We share information with vendors and service providers who help us operate our platform</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger or sale of our company</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <div className="text-gray-700 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access, update, or delete your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
              <div className="text-gray-700">
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4">
                  <p><strong>Email:</strong> privacy@parcelbridge.in</p>
                  <p><strong>Phone:</strong> +91-1800-123-4567</p>
                  <p><strong>Address:</strong> Parcel Bridge Technologies Pvt. Ltd., Koramangala, Bangalore, Karnataka 560034, India</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
