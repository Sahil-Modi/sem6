import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoonPage = ({ title, subtitle, icon }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="text-8xl mb-8 animate-float">{icon}</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-2xl text-gray-600 mb-8">{subtitle}</p>
        <p className="text-lg text-gray-500 mb-12">
          We're working hard to bring you this feature. Stay tuned!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:scale-105 transform"
          >
            ← Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all duration-300 shadow-lg hover:scale-105 transform"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About MediReach</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Connecting lives through technology, compassion, and instant healthcare resource matching worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To save lives by connecting blood donors with those in need through intelligent technology, 
                real-time matching, and a compassionate community dedicated to healthcare access for all.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We believe every person deserves timely access to life-saving resources, and we're committed 
                to making that a reality through innovation and collaboration.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-5xl mb-4">👁️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A world where no one suffers due to lack of blood availability. Where technology bridges 
                the gap between donors and recipients instantly, saving countless lives every day.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We envision a global network of verified donors, responsive healthcare providers, and 
                empowered individuals working together for a healthier tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '👥', number: '50,000+', label: 'Registered Donors' },
              { icon: '❤️', number: '15,000+', label: 'Lives Saved' },
              { icon: '🏥', number: '500+', label: 'Partner Hospitals' },
              { icon: '🌍', number: '25+', label: 'Countries' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How MediReach Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📝',
                title: 'Register & Verify',
                description: 'Sign up as a donor, receiver, or healthcare provider. Complete verification for trusted access.'
              },
              {
                icon: '🤖',
                title: 'AI-Powered Matching',
                description: 'Our intelligent system matches donors with requests based on location, blood type, urgency, and availability.'
              },
              {
                icon: '⚡',
                title: 'Instant Connection',
                description: 'Get real-time notifications, communicate directly, and coordinate life-saving donations efficiently.'
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="text-6xl mb-4">{step.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Values */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '💝', value: 'Compassion', desc: 'Every interaction driven by empathy' },
              { icon: '⚡', value: 'Speed', desc: 'Because every second counts' },
              { icon: '🔒', value: 'Trust', desc: 'Verified users, secure platform' },
              { icon: '🌟', value: 'Excellence', desc: 'Continuous innovation for better outcomes' }
            ].map((val, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-3">{val.icon}</div>
                <h3 className="text-xl font-bold mb-2">{val.value}</h3>
                <p className="text-white/80 text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Our Mission</h2>
          <p className="text-xl text-gray-700 mb-8">
            Whether you're a donor, someone in need, or a healthcare provider, your participation makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift">
              Become a Donor
            </Link>
            <Link to="/requests" className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift">
              Request Blood
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'How Sarah\'s Quick Action Saved a Life',
      category: 'Success Story',
      date: 'January 15, 2026',
      image: '💝',
      excerpt: 'When Sarah received a notification about an urgent blood request just 2 miles away, she didn\'t hesitate. Her O-negative donation saved 8-year-old Emma\'s life during emergency surgery.',
      readTime: '3 min read'
    },
    {
      id: 2,
      title: 'Understanding Blood Types: A Complete Guide',
      category: 'Education',
      date: 'January 10, 2026',
      image: '🩸',
      excerpt: 'Learn about blood type compatibility, universal donors, rare blood types, and why knowing your blood type is crucial for emergency situations.',
      readTime: '5 min read'
    },
    {
      id: 3,
      title: 'MediReach Partners with 100+ Hospitals Nationwide',
      category: 'News',
      date: 'January 5, 2026',
      image: '🏥',
      excerpt: 'We\'re thrilled to announce partnerships with major healthcare providers across the country, expanding our reach and saving more lives every day.',
      readTime: '2 min read'
    },
    {
      id: 4,
      title: 'The Science Behind Our AI Matching Algorithm',
      category: 'Technology',
      date: 'December 28, 2025',
      image: '🤖',
      excerpt: 'Discover how machine learning and real-time data analysis help us match donors with recipients in under 30 seconds, considering distance, urgency, and availability.',
      readTime: '6 min read'
    },
    {
      id: 5,
      title: 'First-Time Donor? Here\'s What to Expect',
      category: 'Guide',
      date: 'December 20, 2025',
      image: '🆕',
      excerpt: 'A comprehensive guide for first-time blood donors, covering preparation, the donation process, recovery tips, and how to make the most impact.',
      readTime: '4 min read'
    },
    {
      id: 6,
      title: 'Community Heroes: Meet Our Top Donors of 2025',
      category: 'Community',
      date: 'December 15, 2025',
      image: '🏆',
      excerpt: 'Celebrating the incredible individuals who\'ve made multiple donations and saved dozens of lives through their consistent commitment to helping others.',
      readTime: '5 min read'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Blog & Success Stories</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Inspiring stories, helpful guides, and the latest news from the MediReach community
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {['All', 'Success Story', 'Education', 'News', 'Technology', 'Guide', 'Community'].map(cat => (
              <button key={cat} className="px-6 py-2 bg-gray-100 hover:bg-primary-600 hover:text-white rounded-full font-medium transition-all duration-200 hover-lift">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, idx) => (
              <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 h-48 flex items-center justify-center text-8xl">
                  {post.image}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">{post.category}</span>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">{post.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center hover-lift">
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-white/90 mb-8">Get the latest success stories and health tips delivered to your inbox</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white" />
            <button className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 hover-lift">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const FAQPage = () => (
  <ComingSoonPage
    title="FAQ"
    subtitle="Frequently Asked Questions"
    icon="❓"
  />
);

export const SupportPage = () => {
  const supportOptions = [
    {
      icon: '💬',
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      link: '/chat'
    },
    {
      icon: '❓',
      title: 'FAQ',
      description: 'Browse frequently asked questions',
      action: 'View FAQs',
      link: '/faq'
    },
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Send us your detailed queries',
      action: 'Send Email',
      link: 'mailto:support@medireach.com'
    },
    {
      icon: '📞',
      title: '24/7 Emergency Line',
      description: 'Call for urgent assistance',
      action: 'Call Now',
      link: 'tel:+1-800-MEDIREACH'
    }
  ];

  const commonIssues = [
    {
      question: 'How do I register as a donor?',
      answer: 'Click on "Register" at the top right, select "Donor" as your role, and fill in your details including blood type and location. You\'ll need to verify your identity through our secure process.'
    },
    {
      question: 'I\'m not receiving notifications',
      answer: 'Go to Settings → Notifications and ensure all permissions are enabled. Check your browser settings to allow notifications from MediReach. For the mobile app, check your device notification settings.'
    },
    {
      question: 'How does the matching algorithm work?',
      answer: 'Our AI considers multiple factors: blood type compatibility, geographic distance, donor availability, request urgency, and donor reliability score to find the best matches within seconds.'
    },
    {
      question: 'Can I update my availability status?',
      answer: 'Yes! Go to your Dashboard and toggle your availability status. This helps us match you only when you\'re ready to donate.'
    },
    {
      question: 'How do I verify my account?',
      answer: 'After registration, upload a government-issued ID and a recent photo. Our verification team reviews submissions within 24-48 hours. Verified accounts get priority matching.'
    },
    {
      question: 'What if I need to cancel a donation commitment?',
      answer: 'We understand emergencies happen. Contact the requester immediately through the chat feature and update your status. Frequent cancellations may affect your reliability score.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Support Center</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              We're here to help 24/7. Get answers, guidance, and support whenever you need it.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How Can We Help?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 hover-lift">
                <div className="text-6xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 mb-6 text-sm">{option.description}</p>
                <Link to={option.link} className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 hover-lift">
                  {option.action}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Common Questions</h2>
          <div className="space-y-4">
            {commonIssues.map((issue, idx) => (
              <details key={idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 group">
                <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <span>{issue.question}</span>
                  <svg className="w-5 h-5 text-primary-600 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{issue.answer}</p>
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="inline-block text-primary-600 font-semibold hover:text-primary-700 transition-colors hover-lift">
              View All FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-3xl font-bold mb-4">Medical Emergency?</h2>
          <p className="text-xl mb-6">For urgent blood requests or life-threatening situations, contact our emergency hotline immediately.</p>
          <a href="tel:+1-800-MEDIREACH" className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift">
            📞 Call Emergency Hotline
          </a>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📖', title: 'User Guides', desc: 'Step-by-step tutorials', link: '/faq' },
              { icon: '🎥', title: 'Video Tutorials', desc: 'Watch how-to videos', link: '/blog' },
              { icon: '🔒', title: 'Security & Privacy', desc: 'Learn about data protection', link: '/privacy' }
            ].map((resource, idx) => (
              <Link key={idx} to={resource.link} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 hover-lift block">
                <div className="text-5xl mb-3">{resource.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600">{resource.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const PartnersPage = () => {
  const partnerTypes = [
    {
      icon: '🏥',
      title: 'Hospitals & Clinics',
      benefits: ['Priority access to donor network', 'Real-time inventory management', 'Automated request processing', 'Dedicated account manager'],
      cta: 'Join as Healthcare Provider'
    },
    {
      icon: '🏢',
      title: 'NGOs & Organizations',
      benefits: ['Community outreach tools', 'Volunteer coordination', 'Impact analytics', 'Fundraising support'],
      cta: 'Partner as NGO'
    },
    {
      icon: '💼',
      title: 'Corporate Partners',
      benefits: ['Employee wellness programs', 'CSR collaboration', 'Branded donation drives', 'Tax benefits & recognition'],
      cta: 'Explore Corporate Partnership'
    },
    {
      icon: '🎓',
      title: 'Educational Institutions',
      benefits: ['Student engagement programs', 'Campus donation events', 'Research collaboration', 'Awareness campaigns'],
      cta: 'Partner as Institution'
    }
  ];

  const currentPartners = [
    { name: 'City General Hospital', type: 'Healthcare', logo: '🏥' },
    { name: 'Red Cross Foundation', type: 'NGO', logo: '❤️' },
    { name: 'HealthTech Corp', type: 'Corporate', logo: '💼' },
    { name: 'State Medical College', type: 'Education', logo: '🎓' },
    { name: 'Community Blood Bank', type: 'Healthcare', logo: '🩸' },
    { name: 'LifeSavers Charity', type: 'NGO', logo: '🤝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Partner With MediReach</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Join our mission to save lives. Together, we can create a world where healthcare resources reach those who need them most.
            </p>
            <button className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift">
              Start Partnership Application
            </button>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Partnership Opportunities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {partnerTypes.map((partner, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover-lift">
                <div className="text-6xl mb-4">{partner.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{partner.title}</h3>
                <ul className="space-y-3 mb-6">
                  {partner.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 hover-lift">
                  {partner.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Why Partner With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📈', title: 'Proven Impact', desc: '15,000+ lives saved through our network' },
              { icon: '🤖', title: 'Advanced Technology', desc: 'AI-powered matching and real-time coordination' },
              { icon: '🌍', title: 'Global Reach', desc: 'Operating in 25+ countries with growing network' },
              { icon: '🔒', title: 'Secure Platform', desc: 'Enterprise-grade security and data protection' },
              { icon: '📊', title: 'Analytics & Insights', desc: 'Comprehensive reporting and impact tracking' },
              { icon: '🎯', title: 'Dedicated Support', desc: '24/7 assistance and account management' }
            ].map((reason, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="text-5xl mb-3">{reason.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Trusted By Leading Organizations</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Join 500+ partners making a difference every day</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {currentPartners.map((partner, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="text-5xl mb-2">{partner.logo}</div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{partner.name}</p>
                <p className="text-xs text-gray-500">{partner.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How to Become a Partner</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Submit Application', desc: 'Fill out partnership form' },
              { step: '2', title: 'Review Process', desc: 'Our team evaluates your application' },
              { step: '3', title: 'Agreement', desc: 'Sign partnership agreement' },
              { step: '4', title: 'Go Live', desc: 'Start making an impact' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Contact our partnerships team to discuss how we can work together to save lives.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift">
              Apply Now
            </button>
            <a href="mailto:partnerships@medireach.com" className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift">
              Contact Partnerships Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export const PrivacyPage = () => (
  <ComingSoonPage
    title="Privacy Policy"
    subtitle="Your privacy matters to us"
    icon="🔒"
  />
);

export const TermsPage = () => (
  <ComingSoonPage
    title="Terms of Service"
    subtitle="Terms and conditions"
    icon="📋"
  />
);

export const CookiesPage = () => (
  <ComingSoonPage
    title="Cookie Policy"
    subtitle="How we use cookies"
    icon="🍪"
  />
);

export default ComingSoonPage;
