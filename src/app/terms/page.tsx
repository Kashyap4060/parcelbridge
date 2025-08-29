import Link from 'next/link'

export default function Terms() {
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

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  By accessing and using Parcel Bridge's services, you accept and agree to be bound by these Terms and Conditions. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Parcel Bridge is a technology platform that connects parcel senders with train passengers (carriers) 
                  to facilitate parcel delivery services across India. We act as an intermediary and do not directly 
                  provide delivery services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">For Senders:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate parcel information and delivery details</li>
                  <li>Ensure parcels contain only legal and safe items</li>
                  <li>Pay agreed fees promptly through our platform</li>
                  <li>Be available for parcel handover at specified times</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6">For Carriers:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate travel information and PNR details</li>
                  <li>Handle parcels with care and deliver safely</li>
                  <li>Maintain communication throughout the delivery process</li>
                  <li>Complete deliveries within agreed timeframes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Items</h2>
              <div className="text-gray-700 space-y-4">
                <p>The following items are strictly prohibited on our platform:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Illegal substances, drugs, or narcotics</li>
                  <li>Weapons, explosives, or dangerous materials</li>
                  <li>Perishable food items or liquids</li>
                  <li>Live animals or plants</li>
                  <li>Valuable items (jewelry, cash, documents)</li>
                  <li>Fragile or breakable items without proper packaging</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment and Fees</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  All payments are processed through our secure payment system. Fees are clearly displayed before 
                  booking confirmation. Refunds are subject to our refund policy and specific circumstances.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Liability and Insurance</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  While we provide insurance coverage for eligible parcels, our liability is limited to the declared 
                  value of the parcel. Users are encouraged to declare accurate values and use appropriate packaging.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Any disputes arising from the use of our services will be resolved through our internal dispute 
                  resolution process. For unresolved matters, disputes will be subject to the jurisdiction of 
                  Bangalore courts.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  We reserve the right to modify these terms at any time. Users will be notified of significant 
                  changes, and continued use of the service constitutes acceptance of the modified terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
              <div className="text-gray-700">
                <p>For questions about these Terms & Conditions, contact us at:</p>
                <div className="mt-4">
                  <p><strong>Email:</strong> legal@parcelbridge.in</p>
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
