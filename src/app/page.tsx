import Link from "next/link";
import { TruckIcon, ShieldCheckIcon, CurrencyRupeeIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Parcel Bridge</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-500 hover:text-blue-600">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Senders with
            <span className="text-blue-600 block">Train Passengers</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-3xl mx-auto">
            Secure, fast, and affordable parcel delivery across India using our network of verified train passengers. Track your parcels in real-time with OTP verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=sender">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3">
                Send a Parcel
              </Button>
            </Link>
            <Link href="/auth/signup?role=carrier">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                Become a Carrier
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Parcel Bridge?
            </h2>
            <p className="text-lg text-gray-600">
              Revolutionizing parcel delivery through India's extensive railway network
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Delivery</h3>
              <p className="text-gray-500">OTP verification and real-time tracking ensure safe delivery</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Wallet Payments</h3>
              <p className="text-gray-500">Secure escrow payments with automatic release</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Railway Network</h3>
              <p className="text-gray-500">Leverage India's vast railway network for delivery</p>
            </div>

            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-500">Track your parcel journey from pickup to delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users already using Parcel Bridge
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <TruckIcon className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-white">Parcel Bridge</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                India's first parcel delivery platform connecting senders with train passengers. 
                Secure, affordable, and eco-friendly logistics solution for everyone.
              </p>
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/parcelbridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com/parcelbridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com/parcelbridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.132-1.551-.684-.94-.684-2.125 0-3.065.684-.94 1.835-1.551 3.132-1.551s2.448.611 3.132 1.551c.684.94.684 2.125 0 3.065-.684.94-1.835 1.551-3.132 1.551zm7.718 0c-1.297 0-2.448-.611-3.132-1.551-.684-.94-.684-2.125 0-3.065.684-.94 1.835-1.551 3.132-1.551s2.448.611 3.132 1.551c.684.94.684 2.125 0 3.065-.684.94-1.835 1.551-3.132 1.551z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/parcelbridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-blue-500 transition-colors">About Us</Link></li>
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-blue-500 transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-blue-500 transition-colors">Pricing</Link></li>
                <li><Link href="/safety" className="text-gray-400 hover:text-blue-500 transition-colors">Safety</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-blue-500 transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-blue-500 transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support & Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-gray-400 hover:text-blue-500 transition-colors">Contact Us</Link></li>
                <li><Link href="/help" className="text-gray-400 hover:text-blue-500 transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-blue-500 transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/refund" className="text-gray-400 hover:text-blue-500 transition-colors">Refund Policy</Link></li>
                <li><Link href="/shipping" className="text-gray-400 hover:text-blue-500 transition-colors">Shipping Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Parcel Bridge. All rights reserved. | Made with ❤️ in India
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/sitemap" className="text-gray-400 hover:text-blue-500 transition-colors">Sitemap</Link>
                <Link href="/accessibility" className="text-gray-400 hover:text-blue-500 transition-colors">Accessibility</Link>
                <Link href="/cookies" className="text-gray-400 hover:text-blue-500 transition-colors">Cookie Policy</Link>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">v1.0.0</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-800 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <div className="flex flex-col md:flex-row gap-4 mb-2 md:mb-0">
                <span>📧 support@parcelbridge.in</span>
                <span>📞 +91-1800-123-4567</span>
                <span>🏢 Bangalore, Karnataka, India</span>
              </div>
              <div className="text-xs">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
