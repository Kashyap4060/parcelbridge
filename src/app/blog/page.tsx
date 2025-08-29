import Link from 'next/link'
import { 
  CalendarIcon, 
  UserIcon, 
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const blogPosts = [
  {
    id: 1,
    title: "How Train-Based Delivery is Revolutionizing Indian Logistics",
    excerpt: "Discover how Parcel Bridge is using India's railway network to create an affordable, eco-friendly delivery system that benefits everyone.",
    content: "India has the world's fourth-largest railway network, carrying over 23 million passengers daily. What if this massive network could also solve our logistics challenges?...",
    author: "Priya Sharma",
    date: "2025-01-15",
    category: "Industry Insights",
    readTime: "5 min read",
    image: "/blog-logistics.jpg"
  },
  {
    id: 2,
    title: "Safety First: Our Multi-Layer Security System Explained",
    excerpt: "Learn about the comprehensive security measures that make Parcel Bridge the safest way to send parcels across India.",
    content: "Safety isn't just a feature at Parcel Bridge—it's our foundation. Every delivery goes through multiple security checkpoints...",
    author: "Rajesh Kumar",
    date: "2025-01-10",
    category: "Safety & Security",
    readTime: "7 min read",
    image: "/blog-safety.jpg"
  },
  {
    id: 3,
    title: "From Mumbai to Delhi: A Carrier's Journey and Earnings",
    excerpt: "Meet Amit, a regular train commuter who now earns ₹15,000 monthly by delivering parcels during his business trips.",
    content: "Amit works in sales and travels between Mumbai and Delhi twice a month. Here's how he turned his regular commute into a profitable side income...",
    author: "Sneha Patel",
    date: "2025-01-08",
    category: "Success Stories",
    readTime: "4 min read",
    image: "/blog-carrier-story.jpg"
  },
  {
    id: 4,
    title: "Sustainable Delivery: How We're Reducing Carbon Footprint",
    excerpt: "By utilizing existing train journeys, Parcel Bridge is creating a more sustainable delivery ecosystem. Here's our environmental impact.",
    content: "Traditional delivery methods contribute significantly to carbon emissions. Our train-based model is changing that narrative...",
    author: "Dr. Kavitha Menon",
    date: "2025-01-05",
    category: "Sustainability",
    readTime: "6 min read",
    image: "/blog-environment.jpg"
  },
  {
    id: 5,
    title: "Tech Behind the Platform: Real-Time Matching Algorithm",
    excerpt: "Deep dive into how our AI-powered matching system connects parcels with the most suitable carriers in real-time.",
    content: "Matching thousands of parcel requests with available carriers requires sophisticated algorithms. Here's how we do it...",
    author: "Arjun Mehta",
    date: "2025-01-03",
    category: "Technology",
    readTime: "8 min read",
    image: "/blog-technology.jpg"
  },
  {
    id: 6,
    title: "Small Business, Big Dreams: How Parcel Bridge Helps MSMEs",
    excerpt: "Small businesses are saving up to 60% on shipping costs using our platform. Here are their stories of growth and expansion.",
    content: "For small businesses, shipping costs can make or break profitability. See how MSMEs are thriving with affordable delivery options...",
    author: "Meera Joshi",
    date: "2024-12-28",
    category: "Business Impact",
    readTime: "5 min read",
    image: "/blog-msme.jpg"
  }
]

const categories = ["All", "Industry Insights", "Safety & Security", "Success Stories", "Sustainability", "Technology", "Business Impact"]

export default function Blog() {
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
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Parcel Bridge Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, stories, and updates from the future of logistics in India
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "All" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-64 lg:h-auto bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="h-full flex items-center justify-center">
                  <div className="text-white text-6xl font-bold opacity-20">Featured</div>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                  <span className="text-gray-500 text-sm">Jan 15, 2025</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How Train-Based Delivery is Revolutionizing Indian Logistics
                </h2>
                <p className="text-gray-600 mb-6">
                  Discover how Parcel Bridge is using India's railway network to create an affordable, 
                  eco-friendly delivery system that benefits everyone.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 text-sm">Priya Sharma</span>
                  </div>
                  <Link 
                    href="/blog/logistics-revolution" 
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>Read More</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="h-full flex items-center justify-center">
                    <TagIcon className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 text-sm">{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500 text-sm">
                        {new Date(post.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest insights on logistics, success stories, and platform updates
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex space-x-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                Subscribe
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-2">
              No spam, unsubscribe anytime
            </p>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Platform Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">v2.1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhanced Tracking</h3>
              <p className="text-gray-600 text-sm mb-3">Real-time GPS tracking and delivery notifications</p>
              <span className="text-blue-600 text-xs">Released Jan 10, 2025</span>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold">v2.0</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Integration</h3>
              <p className="text-gray-600 text-sm mb-3">Razorpay integration for seamless payments</p>
              <span className="text-green-600 text-xs">Released Jan 05, 2025</span>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold">v1.9</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Matching</h3>
              <p className="text-gray-600 text-sm mb-3">Improved carrier-parcel matching algorithm</p>
              <span className="text-purple-600 text-xs">Released Dec 20, 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Experience the Future?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users already benefiting from our innovative delivery platform
          </p>
          <div className="space-x-4">
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 inline-block"
            >
              Start Now
            </Link>
            <Link 
              href="/how-it-works" 
              className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 inline-block"
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
