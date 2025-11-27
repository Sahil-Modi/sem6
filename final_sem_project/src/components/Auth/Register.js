import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    role: 'donor',
    bloodGroup: '',
    organizationName: '',
    organizationType: '',
    isNottoRegistered: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const userDetails = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        role: formData.role
      };

      // Add role-specific data
      if (formData.role === 'donor') {
        userDetails.bloodGroup = formData.bloodGroup;
        userDetails.isNottoRegistered = formData.isNottoRegistered;
      } else if (formData.role === 'ngo' || formData.role === 'hospital') {
        userDetails.organizationName = formData.organizationName;
        userDetails.organizationType = formData.organizationType;
        userDetails.verified = false; // Requires admin approval
      }

      await register(formData.email, formData.password, userDetails);
      
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Failed to create account: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-primary-600 to-purple-600 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative max-w-3xl w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-10 text-center">
            <div className="text-6xl mb-4 animate-float">🏥</div>
            <h1 className="text-3xl font-bold text-white mb-2">Join MediReach</h1>
            <p className="text-blue-100">Start saving lives today</p>
          </div>

          {/* Form Container */}
          <div className="px-8 py-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Your Account</h2>
            <p className="text-gray-600 text-center mb-8">Join our global health network</p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 animate-slide-up">
                <div className="flex items-center">
                  <span className="text-xl mr-2">⚠️</span>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6 animate-slide-up">
                <div className="flex items-center">
                  <span className="text-xl mr-2">✅</span>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  I am a <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">👤</span>
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none bg-white"
                    required
                  >
                    <option value="donor">Donor (Blood, Plasma, Resources)</option>
                    <option value="receiver">Receiver (Patient/Family)</option>
                    <option value="ngo">NGO Organization</option>
                    <option value="hospital">Hospital/Medical Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">👨</span>
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📞</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📍</span>
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Donor-specific fields */}
              {formData.role === 'donor' && (
                <div className="space-y-5 border-t-2 border-gray-200 pt-5">
                  <h3 className="text-lg font-semibold text-gray-800">Donor Information</h3>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🩸</span>
                      </div>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none bg-white"
                        required
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="DK">Don't know</option>
                      </select>
                    </div>
                  </div>

                  {/* NOTTO Checkbox */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="isNottoRegistered"
                        checked={formData.isNottoRegistered}
                        onChange={handleChange}
                        className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="font-semibold text-gray-800 text-sm">
                          I am registered on NOTTO (National Organ & Tissue Transplant Organisation)
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          Check this if you're an official organ/tissue donor registered with NOTTO
                        </p>
                      </div>
                    </div>

                    {!formData.isNottoRegistered && (
                      <div className="mt-4 pt-4 border-t border-blue-300">
                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-semibold">Not registered yet?</span> Become an official organ donor and save lives!
                        </p>
                        <a
                          href="https://notto.abdm.gov.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <span className="mr-2">🏥</span>
                          Register on NOTTO
                          <span className="ml-2">→</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NGO/Hospital-specific fields */}
              {(formData.role === 'ngo' || formData.role === 'hospital') && (
                <div className="space-y-5 border-t-2 border-gray-200 pt-5">
                  <h3 className="text-lg font-semibold text-gray-800">Organization Information</h3>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🏢</span>
                      </div>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                        placeholder="Red Cross International"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Organization Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🏷️</span>
                      </div>
                      <input
                        type="text"
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleChange}
                        placeholder="e.g., Blood Bank, Charity Hospital"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">⏳</span>
                      <div>
                        <p className="font-semibold text-yellow-800 mb-1">Verification Required</p>
                        <p className="text-sm text-yellow-700">
                          Your account will require admin verification before you can access all features. This helps maintain platform integrity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-white hover:text-blue-100 transition font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
