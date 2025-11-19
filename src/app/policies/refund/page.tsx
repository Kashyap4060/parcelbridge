import Link from 'next/link'

export default function RefundPolicy() {
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
            <Link href="/policies/terms" className="text-gray-600 hover:text-blue-600">
              Terms & Conditions
            </Link>
            <Link href="/policies/refund" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">
              Cancellation & Refunds
            </Link>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Cancellation & Refunds Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: November 2025</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Cancellation Policy</h2>
              <div className="space-y-3">
                <p>
                  <strong>Before Carrier Acceptance:</strong> Senders can cancel their parcel request without any charges 
                  before a carrier accepts the delivery request.
                </p>
                <p>
                  <strong>After Carrier Acceptance:</strong> Once a carrier has accepted the delivery request, cancellation 
                  is not permitted. Contact our support team for exceptional cases.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Eligibility</h2>
              <p className="mb-3">Refunds are issued in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Parcel delivery failed due to carrier's fault</li>
                <li>Service was cancelled before carrier acceptance</li>
                <li>Payment was processed incorrectly</li>
                <li>Technical issues prevented service completion</li>
                <li>Parcel was lost or significantly damaged during transit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Process</h2>
              <div className="space-y-3">
                <p>
                  <strong>Refund Request:</strong> Users must file a refund request within 30 days of the transaction through 
                  the platform or by contacting support@parcelbridge.in
                </p>
                <p>
                  <strong>Investigation:</strong> Our team will investigate the claim and gather evidence from both sender and carrier.
                </p>
                <p>
                  <strong>Decision:</strong> A decision will be made within 7-10 business days.
                </p>
                <p>
                  <strong>Processing:</strong> Approved refunds will be credited to the original payment method within 5-7 business days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Non-Refundable Fees</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service fees for completed deliveries</li>
                <li>Premiums for expedited delivery</li>
                <li>Insurance premiums that were applied</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partial Refunds</h2>
              <p>
                Partial refunds may be issued if the parcel was partially damaged or delivery was incomplete. 
                The refund amount will be determined based on the extent of the issue and supporting documentation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Carrier Refunds</h2>
              <p>
                If a carrier cancels an accepted delivery request:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>The sender will receive a full refund minus the platform fee (if applicable)</li>
                <li>The carrier will face penalties as per the user agreement</li>
                <li>Repeated cancellations may result in account suspension</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
              <p>
                If there is a dispute regarding a refund claim, both parties can present evidence and arguments. 
                Our dispute resolution team will make a final decision based on the available evidence.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. No Refund After Delivery</h2>
              <p>
                Once a parcel has been delivered and the receiver has confirmed receipt, no refunds will be issued. 
                This is between the sender and receiver to resolve any issues with the parcel contents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. GST and Tax</h2>
              <p>
                Refunds will include all applicable GST and taxes. The refund amount will be the same as the original charge.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Support</h2>
              <p>
                For refund-related queries or to file a claim, contact our support team:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-3">
                <li>Email: support@parcelbridge.in</li>
                <li>In-app support: Use the help feature in your dashboard</li>
                <li>Expected response time: 24-48 hours</li>
              </ul>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg mt-8">
              <p className="text-sm text-gray-600">
                <strong>Razorpay Merchant Policy:</strong> For the full policy details, visit{' '}
                <a 
                  href="https://merchant.razorpay.com/policy/RhUbUL3jxC1QCi/refund" 
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