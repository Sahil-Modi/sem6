import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHospital, FaTint, FaHandshake, FaRobot, FaClipboardCheck, FaLink, FaHeart,
  FaUserMd, FaBriefcase, FaHandsHelping, FaGlobe, FaStar, FaShieldAlt, FaAward,
  FaRocket, FaFacebookSquare, FaTwitter, FaInstagram, FaLinkedin,
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaExclamationTriangle
} from 'react-icons/fa';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Hospital Administrator",
      image: <FaUserMd className="inline-block text-primary-600" />,
      text: "MediReach has revolutionized how we connect with blood donors. We've saved countless lives thanks to this platform."
    },
    {
      name: "Michael Chen",
      role: "Regular Blood Donor",
      image: <FaBriefcase className="inline-block text-blue-600" />,
      text: "Being able to help people in need instantly through MediReach gives me immense satisfaction. It's incredibly easy to use!"
    },
    {
      name: "Red Cross International",
      role: "NGO Partner",
      image: <FaHandsHelping className="inline-block text-green-600" />,
      text: "The AI-powered matching system has increased our response efficiency by 300%. A game-changer for humanitarian work."
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Animated Gradient */}
      <div className="relative bg-gradient-to-br from-blue-600 via-primary-600 to-purple-600 overflow-hidden">
        {/* Animated Background Circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-overlay animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-overlay animate-blob" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-white opacity-10 rounded-full mix-blend-overlay animate-blob" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block mb-4 animate-fade-in">
              <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm flex items-center justify-center gap-2">
                <FaGlobe className="text-lg" />
                Connecting Lives Worldwide
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to <span className="text-yellow-300 animate-pulse">MediReach</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 mb-10 max-w-3xl mx-auto leading-relaxed">
              The world's most advanced health resource network connecting those in need with verified donors, 
              NGOs, and hospitals in real-time using AI-powered matching.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="group bg-white text-primary-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 hover:text-primary-700 transition-all duration-300 shadow-2xl hover:shadow-yellow-300/50 hover:scale-105 transform"
              >
                Join Now
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/login"
                className="bg-transparent text-white px-10 py-4 rounded-full text-lg font-semibold border-2 border-white hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-lg hover:scale-105 transform"
              >
                Sign In
              </Link>
            </div>

            {/* Floating Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: "10K+", label: "Active Donors" },
                { number: "500+", label: "Hospitals" },
                { number: "200+", label: "NGO Partners" },
                { number: "50K+", label: "Lives Saved" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 transform transition-all duration-500 hover:scale-110 hover:bg-opacity-20 cursor-pointer animate-slide-up"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-primary-600">MediReach</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of healthcare connectivity with our cutting-edge features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <FaTint className="text-red-500" />, title: "Blood & Plasma", desc: "Connect with verified blood and plasma donors instantly with real-time availability.", color: "from-red-400 to-red-600" },
            { icon: <FaHospital className="text-blue-500" />, title: "Hospital Network", desc: "Access verified hospitals and medical centers globally with 24/7 support.", color: "from-blue-400 to-blue-600" },
            { icon: <FaHandshake className="text-green-500" />, title: "NGO Partnership", desc: "Work with trusted NGOs to fulfill medical needs efficiently and transparently.", color: "from-green-400 to-green-600" },
            { icon: <FaRobot className="text-purple-500" />, title: "AI Matching", desc: "Smart algorithms match donors to urgent requests in seconds using location and compatibility.", color: "from-purple-400 to-purple-600" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-primary-200"
            >
              <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} rounded-full transition-all duration-500`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary-400 to-purple-400"></div>

            {[
              { step: "1", title: "Register", desc: "Sign up as a donor, receiver, NGO, or hospital with verified credentials in minutes.", icon: <FaClipboardCheck className="text-white" />, color: "bg-blue-500" },
              { step: "2", title: "Connect", desc: "Our AI instantly matches urgent requests with nearby verified donors and resources.", icon: <FaLink className="text-white" />, color: "bg-primary-500" },
              { step: "3", title: "Save Lives", desc: "Fulfill requests with real-time tracking, transparent communication, and instant notifications.", icon: <FaHeart className="text-white" />, color: "bg-red-500" }
            ].map((item, index) => (
              <div key={index} className="relative text-center group">
                <div className={`${item.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-all duration-300 group-hover:shadow-2xl relative z-10 animate-float`}>
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="text-5xl font-bold text-gray-200 mb-2">{item.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What People Say</h2>
            <p className="text-xl text-gray-600">Trusted by thousands worldwide</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-12 shadow-xl">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${activeTestimonial === index ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                >
                  <div className="text-center">
                    <div className="text-7xl mb-6 animate-float">{testimonial.image}</div>
                    <p className="text-2xl text-gray-700 italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                    <div className="font-bold text-xl text-gray-900">{testimonial.name}</div>
                    <div className="text-primary-600">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${activeTestimonial === index ? 'bg-primary-600 w-8' : 'bg-gray-300'}`}
                  aria-label={`Testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted & Certified By</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            {[
              { icon: <FaAward />, label: "WHO Certified" },
              { icon: <FaHospital />, label: "Red Cross Partner" },
              { icon: <FaGlobe />, label: "UN Health" },
              { icon: <FaStar />, label: "ISO 9001" },
              { icon: <FaShieldAlt />, label: "HIPAA Compliant" }
            ].map((badge, index) => (
              <div key={index} className="text-center text-gray-600 hover:text-primary-600 hover:scale-110 transition-all cursor-pointer flex flex-col items-center gap-2">
                <span className="text-3xl">{badge.icon}</span>
                <span className="text-sm font-semibold">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-blob" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of donors and organizations saving lives every day. Your contribution matters!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="group bg-white text-primary-600 px-12 py-5 rounded-full text-xl font-bold hover:bg-yellow-300 hover:text-primary-700 transition-all duration-300 shadow-2xl hover:shadow-yellow-300/50 hover:scale-105 transform inline-flex items-center justify-center gap-2"
            >
              Get Started Today
              <FaRocket className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/donors"
              className="bg-transparent text-white px-12 py-5 rounded-full text-xl font-bold border-2 border-white hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-xl hover:scale-105 transform"
            >
              Explore Donors
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <FaHospital className="text-3xl text-primary-500" />
                <span className="text-2xl font-bold text-white">MediReach</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connecting lives through technology, compassion, and instant healthcare resource matching worldwide.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <FaFacebookSquare className="text-xl" />, name: 'Facebook', link: '#' },
                  { icon: <FaTwitter className="text-xl" />, name: 'Twitter', link: '#' },
                  { icon: <FaInstagram className="text-xl" />, name: 'Instagram', link: '#' },
                  { icon: <FaLinkedin className="text-xl" />, name: 'LinkedIn', link: '#' }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.link}
                    aria-label={social.name}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all duration-200 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  {to: "/about", label: "About Us"},
                  {to: "/donors", label: "Find Donors"},
                  {to: "/register", label: "Become a Donor"},
                  {to: "/requests", label: "Urgent Requests"}
                ].map((link, i) => (
                  <li key={i}>
                    <Link 
                      to={link.to} 
                      className="text-gray-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-flex items-center transform hover-lift"
                    >
                      <span className="mr-2">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-3">
                {[
                  {to: "/blog", label: "Blog"},
                  {to: "/faq", label: "FAQ"},
                  {to: "/support", label: "Support Center"},
                  {to: "/partners", label: "Partner With Us"}
                ].map((link, i) => (
                  <li key={i}>
                    <Link 
                      to={link.to} 
                      className="text-gray-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-flex items-center transform hover-lift"
                    >
                      <span className="mr-2">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-gray-300">
                  <FaMapMarkerAlt className="text-xl text-primary-500 mt-1" />
                  <span>123 Health Street, Medical District, NY 10001</span>
                </li>
                <li className="flex items-center space-x-3">
                  <FaEnvelope className="text-xl text-primary-500" />
                  <a href="mailto:info@medireach.com" className="text-gray-300 hover:text-white transition-colors duration-200 hover-lift">info@medireach.com</a>
                </li>
                <li className="flex items-center space-x-3">
                  <FaPhone className="text-xl text-primary-500" />
                  <a href="tel:+1-800-MEDIREACH" className="text-gray-300 hover:text-white transition-colors duration-200 hover-lift">+1-800-MEDIREACH</a>
                </li>
                <li className="flex items-center space-x-3">
                  <FaExclamationTriangle className="text-xl text-red-500" />
                  <span className="text-red-400 font-semibold animate-gentle-pulse">24/7 Emergency Support</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2025 MediReach. All rights reserved. Saving lives, one connection at a time.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200 hover-lift">Privacy Policy</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 hover-lift">Terms of Service</Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors duration-200 hover-lift">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
