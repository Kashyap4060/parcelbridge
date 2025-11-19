import Link from 'next/link'

export default function ShippingPolicy() {
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
            <Link href="/policies/shipping" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">
              Shipping
            </Link>
            <Link href="/policies/terms" className="text-gray-600 hover:text-blue-600">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Shipping Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: November 2025</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
              <p>
                Parcel Bridge provides a platform to connect parcel senders with train passengers (carriers) for parcel delivery 
                services across India. This shipping policy outlines how shipments are handled through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Parcel Handling</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All parcels must be properly packed and labeled before handover to the carrier</li>
                <li>Senders are responsible for accurate weight and dimension information</li>
                <li>Carriers must handle parcels with care and ensure safe delivery</li>
                <li>Real-time tracking is available for all shipments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Shipping Routes</h2>
              <p>
                Shipments are routed based on the train journey selected by the carrier. The carrier is responsible for 
                delivering the parcel along the agreed route and timeline.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Delivery Timeline</h2>
              <p>
                Delivery times are estimated based on train schedules and route distance. The estimated delivery date is 
                provided during parcel request creation. Delays due to train schedules are not the responsibility of Parcel Bridge.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Items</h2>
              <p className="mb-3">The following items cannot be shipped through Parcel Bridge:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hazardous materials, explosives, or flammable substances</li>
                <li>Fragile items without proper protection</li>
                <li>Perishable goods without temperature control</li>
                <li>Illegal or counterfeit items</li>
                <li>Items exceeding size and weight limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Tracking</h2>
              <p>
                All parcels can be tracked in real-time using the tracking ID provided at the time of shipment creation. 
                Tracking information includes pickup confirmation, transit status, and delivery confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p>
                For shipping-related inquiries or issues, please contact our support team at support@parcelbridge.in or 
                use the in-app help feature.
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg mt-8">
              <p className="text-sm text-gray-600">
                <strong>Razorpay Merchant Policy:</strong> For the full policy details, visit{' '}
                <a 
                  href="https://merchant.razorpay.com/policy/RhUbUL3jxC1QCi/shipping" 
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