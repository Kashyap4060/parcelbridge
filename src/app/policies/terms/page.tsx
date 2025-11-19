import Link from 'next/link'

export default function TermsPolicy() {
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

      {/* Policy Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link href="/policies/shipping" className="text-gray-600 hover:text-blue-600">
              Shipping
            </Link>
            <Link href="/policies/terms" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">
              Terms & Conditions
            </Link>
            <Link href="/policies/refund" className="text-gray-600 hover:text-blue-600">
              Cancellation & Refunds
            </Link>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
          <p className="text-gray-500 mb-8">Last updated: November 2025</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Parcel Bridge's services, you accept and agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p>
                Parcel Bridge is a technology platform that connects parcel senders with train passengers (carriers) 
                to facilitate parcel delivery services across India. We act as an intermediary and do not directly 
                handle or transport parcels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Roles and Responsibilities</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Senders:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Must provide accurate information about parcels</li>
                    <li>Are responsible for proper packing and labeling</li>
                    <li>Must pay the agreed delivery fee</li>
                    <li>Cannot ship prohibited items</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Carriers:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Must handle parcels with care</li>
                    <li>Are responsible for safe delivery</li>
                    <li>Must complete delivery as per the agreed timeline</li>
                    <li>Must follow all safety and legal guidelines</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment and Fees</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All fees are calculated based on parcel weight and distance</li>
                <li>Payment must be made through the Parcel Bridge platform using Razorpay</li>
                <li>Fees are non-refundable except in cases of service failure</li>
                <li>GST is applicable on all transactions as per Indian tax laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Liability and Indemnification</h2>
              <p>
                Parcel Bridge acts as a platform provider and is not responsible for any loss, damage, or theft of parcels 
                during transit. Senders are responsible for insuring high-value items. We are not liable for delays caused 
                by train schedules or circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ship illegal or counterfeit items</li>
                <li>Provide false information about parcels</li>
                <li>Engage in fraudulent activities</li>
                <li>Harass or intimidate other users</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Account Termination</h2>
              <p>
                Parcel Bridge reserves the right to terminate user accounts that violate these terms or engage in 
                fraudulent or illegal activities. Users will be notified of termination with a valid reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Dispute Resolution</h2>
              <p>
                Any disputes between users or between users and Parcel Bridge will be resolved through our dispute 
                resolution mechanism. If unresolved, disputes will be handled according to Indian law and jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications to Terms</h2>
              <p>
                Parcel Bridge reserves the right to modify these terms at any time. Users will be notified of significant 
                changes. Continued use of the platform constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p>
                For any questions regarding these terms, please contact us at support@parcelbridge.in
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg mt-8">
              <p className="text-sm text-gray-600">
                <strong>Razorpay Merchant Policy:</strong> For the full policy details, visit{' '}
                <a 
                  href="https://merchant.razorpay.com/policy/RhUbUL3jxC1QCi/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  our Razorpay merchant policy page
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}