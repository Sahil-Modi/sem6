import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title = "Feature Coming Soon", description }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="mb-8">
          <div className="text-8xl mb-6">🚀</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          {description && (
            <p className="text-xl text-gray-600 mb-6">{description}</p>
          )}
          <p className="text-gray-500">
            We're working hard to bring you this feature. Stay tuned!
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">What's Coming:</h3>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Advanced analytics and insights
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Real-time data visualization
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Comprehensive reporting tools
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Export functionality
            </li>
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            to="/dashboard"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/"
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Have suggestions? Contact us at{' '}
            <a href="mailto:support@medireach.com" className="text-primary-600 hover:underline">
              support@medireach.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
