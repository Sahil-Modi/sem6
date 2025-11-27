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

export const AboutPage = () => (
  <ComingSoonPage
    title="About Us"
    subtitle="Learn more about our mission"
    icon="ℹ️"
  />
);

export const BlogPage = () => (
  <ComingSoonPage
    title="Blog"
    subtitle="Read our latest articles and stories"
    icon="📰"
  />
);

export const FAQPage = () => (
  <ComingSoonPage
    title="FAQ"
    subtitle="Frequently Asked Questions"
    icon="❓"
  />
);

export const SupportPage = () => (
  <ComingSoonPage
    title="Support Center"
    subtitle="We're here to help"
    icon="🆘"
  />
);

export const PartnersPage = () => (
  <ComingSoonPage
    title="Partner With Us"
    subtitle="Join our network of partners"
    icon="🤝"
  />
);

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
