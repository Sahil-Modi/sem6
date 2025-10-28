import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">MediReach</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Global Health Resource & Donor Network connecting those in need with verified donors, 
            NGOs, and hospitals in real-time.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
            >
              Join Now
            </Link>
            <Link
              to="/login"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🩸</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Blood & Plasma</h3>
            <p className="text-gray-600">Connect with verified blood and plasma donors instantly.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hospital Network</h3>
            <p className="text-gray-600">Access verified hospitals and medical centers globally.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">NGO Partnership</h3>
            <p className="text-gray-600">Work with trusted NGOs to fulfill medical needs.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI Matching</h3>
            <p className="text-gray-600">Smart algorithms match donors to urgent requests.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Register</h3>
              <p className="text-gray-600">Sign up as a donor, receiver, NGO, or hospital with verified credentials.</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect</h3>
              <p className="text-gray-600">AI matches urgent requests with nearby verified donors and resources.</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Save Lives</h3>
              <p className="text-gray-600">Fulfill requests with real-time tracking and transparent communication.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-primary-600 rounded-2xl p-12 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-100">Active Donors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Hospitals</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-primary-100">NGO Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-100">Lives Saved</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of donors and organizations saving lives every day.</p>
          <Link
            to="/register"
            className="inline-block bg-primary-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
