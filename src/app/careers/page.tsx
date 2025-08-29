import Link from 'next/link'
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  CodeBracketIcon,
  MegaphoneIcon,
  ChartBarIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const jobOpenings = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Mumbai, India",
    type: "Full-time",
    experience: "3-5 years",
    salary: "₹15-25 LPA",
    description: "Join our core engineering team to build scalable web applications using React, Node.js, and cloud technologies.",
    requirements: [
      "3+ years of React and Node.js experience",
      "Experience with TypeScript and modern web frameworks",
      "Knowledge of cloud platforms (AWS/GCP)",
      "Strong problem-solving skills"
    ],
    icon: CodeBracketIcon,
    color: "blue"
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Bangalore, India",
    type: "Full-time",
    experience: "4-7 years",
    salary: "₹20-35 LPA",
    description: "Lead product strategy and roadmap for our logistics platform, working closely with engineering and design teams.",
    requirements: [
      "4+ years of product management experience",
      "Experience in logistics or marketplace products",
      "Strong analytical and communication skills",
      "MBA from premier institute preferred"
    ],
    icon: ChartBarIcon,
    color: "green"
  },
  {
    id: 3,
    title: "Marketing Manager - Digital",
    department: "Marketing",
    location: "Delhi, India",
    type: "Full-time",
    experience: "3-5 years",
    salary: "₹12-20 LPA",
    description: "Drive digital marketing initiatives to acquire and retain users across sender and carrier segments.",
    requirements: [
      "3+ years in digital marketing",
      "Experience with performance marketing",
      "Strong knowledge of SEO, SEM, and social media",
      "Analytics-driven approach"
    ],
    icon: MegaphoneIcon,
    color: "purple"
  },
  {
    id: 4,
    title: "Operations Manager",
    department: "Operations",
    location: "Pune, India",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹10-15 LPA",
    description: "Manage day-to-day operations, carrier onboarding, and customer support to ensure smooth platform functioning.",
    requirements: [
      "2+ years in operations or logistics",
      "Experience with process optimization",
      "Strong project management skills",
      "Customer-focused mindset"
    ],
    icon: UserGroupIcon,
    color: "orange"
  },
  {
    id: 5,
    title: "Data Scientist",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹12-22 LPA",
    description: "Build ML models for carrier-parcel matching, demand forecasting, and platform optimization.",
    requirements: [
      "2+ years in data science/ML",
      "Proficiency in Python, SQL, and ML frameworks",
      "Experience with recommendation systems",
      "Strong statistical background"
    ],
    icon: ChartBarIcon,
    color: "teal"
  },
  {
    id: 6,
    title: "UI/UX Designer",
    department: "Design",
    location: "Mumbai, India",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹8-15 LPA",
    description: "Design intuitive user experiences for our web and mobile platforms, focusing on user-centered design principles.",
    requirements: [
      "2+ years in UI/UX design",
      "Proficiency in Figma, Adobe Creative Suite",
      "Experience with mobile app design",
      "Strong portfolio showcasing user-centered design"
    ],
    icon: HeartIcon,
    color: "pink"
  }
]

const benefits = [
  {
    title: "Competitive Salary",
    description: "Market-leading compensation with performance bonuses",
    icon: CurrencyRupeeIcon
  },
  {
    title: "Flexible Work",
    description: "Hybrid work model with flexible hours",
    icon: ClockIcon
  },
  {
    title: "Health Insurance",
    description: "Comprehensive medical coverage for you and family",
    icon: HeartIcon
  },
  {
    title: "Learning Budget",
    description: "₹50,000 annual budget for courses and conferences",
    icon: BriefcaseIcon
  },
  {
    title: "Stock Options",
    description: "Equity participation in company growth",
    icon: ChartBarIcon
  },
  {
    title: "Global Exposure",
    description: "Work with international teams and technologies",
    icon: GlobeAltIcon
  }
]

const companyValues = [
  {
    title: "Innovation First",
    description: "We constantly push boundaries to solve complex logistics challenges with creative solutions."
  },
  {
    title: "Customer Obsession",
    description: "Every decision is made with our users' needs at the center. Their success is our success."
  },
  {
    title: "Transparency",
    description: "We believe in open communication, honest feedback, and transparent business practices."
  },
  {
    title: "Sustainability",
    description: "Building environmentally responsible solutions that benefit society and the planet."
  }
]

export default function Careers() {
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Join Our Mission</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Help us revolutionize logistics in India and build the future of delivery. 
            Join a team that's passionate about innovation, technology, and social impact.
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <p className="text-gray-600">Team Members</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">₹50Cr+</div>
              <p className="text-gray-600">Funding Raised</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">5</div>
              <p className="text-gray-600">Office Locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Values */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Work With Us</h2>
            <p className="text-xl text-gray-600">Competitive benefits and a culture that values your growth</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm text-center">
                <benefit.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600">Find your next opportunity with us</p>
          </div>
          
          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 bg-${job.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <job.icon className={`w-6 h-6 text-${job.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                            {job.department}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BriefcaseIcon className="w-4 h-4" />
                            <span>{job.experience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CurrencyRupeeIcon className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{job.description}</p>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Requirements:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {job.requirements.map((req, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 font-medium">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Culture */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Life at Parcel Bridge</h2>
          <p className="text-xl text-blue-100 mb-8">
            A diverse, inclusive workplace where innovation thrives and everyone's voice matters
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Innovation Culture</h3>
              <p className="text-blue-100">
                20% time for personal projects, hackathons, and experimenting with new technologies. 
                Your ideas can become product features.
              </p>
            </div>
            
            <div className="bg-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Work-Life Balance</h3>
              <p className="text-blue-100">
                Flexible working hours, work-from-home options, and unlimited PTO policy. 
                We believe productivity comes from happiness.
              </p>
            </div>
            
            <div className="bg-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Growth Opportunities</h3>
              <p className="text-blue-100">
                Regular mentorship, skill development programs, and clear career progression paths. 
                We invest in your professional growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Application Process</h2>
            <p className="text-xl text-gray-600">Simple and transparent hiring process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply Online</h3>
              <p className="text-gray-600">Submit your application through our careers portal</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Screen</h3>
              <p className="text-gray-600">Quick conversation with our HR team about your background</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Round</h3>
              <p className="text-gray-600">Role-specific assessment with our technical team</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Culture Fit</h3>
              <p className="text-gray-600">Final interview to ensure mutual cultural alignment</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join us in building the future of logistics and create solutions that matter
          </p>
          <div className="space-x-4">
            <Link 
              href="/contact" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 inline-block"
            >
              View All Openings
            </Link>
            <Link 
              href="/contact" 
              className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 inline-block"
            >
              Contact HR
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions About Careers?</h3>
          <p className="text-gray-600 mb-4">
            Reach out to our HR team at <a href="mailto:careers@parcelbridge.in" className="text-blue-600 hover:text-blue-700">careers@parcelbridge.in</a>
          </p>
          <p className="text-gray-600">
            Follow us on <a href="#" className="text-blue-600 hover:text-blue-700">LinkedIn</a> for latest updates and company news
          </p>
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
