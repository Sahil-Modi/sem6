import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { 
  FaHospital, FaHandHoldingMedical, FaUserMd, FaChartLine,
  FaCheckCircle, FaHourglassHalf, FaClipboardList, FaUsers,
  FaTint, FaMapMarkerAlt, FaHistory, FaStar, FaComments,
  FaBolt, FaPlusCircle, FaExclamationTriangle, FaHeart,
  FaBuilding, FaCrown, FaClock
} from 'react-icons/fa';

const Dashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    myRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch requests based on user role
      const requestsRef = collection(db, 'requests');
      let q;

      if (userData.role === 'admin' || userData.role === 'ngo' || userData.role === 'hospital') {
        q = query(requestsRef, orderBy('createdAt', 'desc'), limit(10));
      } else if (userData.role === 'receiver') {
        q = query(requestsRef, where('receiverId', '==', userData.uid), orderBy('createdAt', 'desc'));
      } else if (userData.role === 'donor') {
        q = query(requestsRef, where('status', '==', 'Verified'), orderBy('createdAt', 'desc'), limit(10));
      }

      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const active = requests.filter(r => r.status !== 'Completed').length;
      const completed = requests.filter(r => r.status === 'Completed').length;

      setStats({
        totalRequests: requests.length,
        activeRequests: active,
        completedRequests: completed,
        myRequests: requests.length
      });

      setRecentActivity(requests.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const getRoleDashboard = () => {
    switch (userData.role) {
      case 'admin':
        return <AdminDashboard stats={stats} activity={recentActivity} />;
      case 'ngo':
      case 'hospital':
        return <NGOHospitalDashboard stats={stats} activity={recentActivity} userData={userData} />;
      case 'donor':
        return <DonorDashboard stats={stats} activity={recentActivity} userData={userData} />;
      case 'receiver':
        return <ReceiverDashboard stats={stats} activity={recentActivity} userData={userData} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaHospital className="text-3xl text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing personalized insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <span className="mr-3">Welcome back, {userData.name}!</span>
              </h1>
              <p className="text-white/90 text-lg capitalize flex items-center">
                <FaChartLine className="mr-2" />
                {userData.role} Dashboard
                {!userData.verified && userData.role !== 'donor' && userData.role !== 'receiver' && (
                  <span className="ml-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-gentle-pulse flex items-center">
                    <FaHourglassHalf className="mr-1" />
                    Pending Verification
                  </span>
                )}
              </p>
            </div>
            <div className="text-6xl">
              {userData.role === 'donor' && <FaTint className="text-white animate-float" />}
              {userData.role === 'receiver' && <FaHospital className="text-white animate-float" />}
              {userData.role === 'admin' && <FaCrown className="text-white animate-float" />}
              {(userData.role === 'ngo' || userData.role === 'hospital') && <FaBuilding className="text-white animate-float" />}
            </div>
          </div>
        </div>

        {/* Render role-specific dashboard */}
        {getRoleDashboard()}
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ stats, activity }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Requests" value={stats.totalRequests} icon={<FaClipboardList />} color="blue" />
      <StatCard title="Active" value={stats.activeRequests} icon={<FaHourglassHalf />} color="yellow" />
      <StatCard title="Completed" value={stats.completedRequests} icon={<FaCheckCircle />} color="green" />
      <StatCard title="Verification Queue" value="12" icon={<FaClock />} color="orange" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QuickActions role="admin" />
      <RecentActivity activity={activity} />
    </div>
  </>
);

// NGO/Hospital Dashboard Component
const NGOHospitalDashboard = ({ stats, activity, userData }) => (
  <>
    {!userData.verified && (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Your organization account is pending admin verification. Some features may be limited.
            </p>
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="Requests to Verify" value={stats.activeRequests} icon={<FaCheckCircle />} color="blue" />
      <StatCard title="Verified" value={stats.completedRequests} icon={<FaCheckCircle />} color="green" />
      <StatCard title="In Progress" value={stats.activeRequests} icon={<FaHourglassHalf />} color="yellow" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QuickActions role="ngo" />
      <RecentActivity activity={activity} />
    </div>
  </>
);

// Donor Dashboard Component
const DonorDashboard = ({ stats, activity, userData }) => (
  <>
    <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden animate-fade-in-up">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      <div className="relative flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-3 flex items-center">
            Thank you for being a lifesaver!
          </h2>
          <p className="text-white/90 text-lg mb-4">Your generosity has the power to save lives. Every donation matters.</p>
          <div className="flex items-center space-x-3">
            <span className="bg-white/20 px-4 py-2 rounded-full font-semibold flex items-center">
              <FaTint className="mr-2" />
              Blood Group: {userData.bloodGroup || 'Not Set'}
            </span>
            <span className={`px-4 py-2 rounded-full font-semibold flex items-center ${
              userData.availability ? 'bg-green-500/50' : 'bg-gray-500/50'
            }`}>
              {userData.availability ? <><FaCheckCircle className="mr-1" /> Available</> : <><FaHourglassHalf className="mr-1" /> Unavailable</>}
            </span>
          </div>
        </div>
        <div className="text-8xl">
          <FaHeart className="text-white animate-heartbeat" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="Urgent Requests" value={stats.activeRequests} icon={<FaExclamationTriangle />} color="red" />
      <StatCard title="My Contributions" value="5" icon={<FaHeart />} color="green" />
      <StatCard title="Availability" value={userData.availability ? "Active" : "Inactive"} icon={<FaMapMarkerAlt />} color="blue" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QuickActions role="donor" />
      <RecentActivity activity={activity} />
    </div>
  </>
);

// Receiver Dashboard Component
const ReceiverDashboard = ({ stats, activity, userData }) => (
  <>
    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden animate-fade-in-up">
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36"></div>
      <div className="relative">
        <h2 className="text-3xl font-bold mb-3 flex items-center">
          <FaHospital className="mr-3" />
          Need Urgent Medical Resources?
        </h2>
        <p className="text-white/90 text-lg mb-6">Submit a request and we'll instantly connect you with verified donors, NGOs, and healthcare providers in your area.</p>
        <Link 
          to="/create-request" 
          className="inline-flex items-center bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
        >
          <FaPlusCircle className="mr-2 text-2xl" />
          Create New Request
          <span className="ml-2">→</span>
        </Link>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="My Requests" value={stats.myRequests} icon={<FaClipboardList />} color="blue" />
      <StatCard title="In Progress" value={stats.activeRequests} icon={<FaHourglassHalf />} color="yellow" />
      <StatCard title="Fulfilled" value={stats.completedRequests} icon={<FaCheckCircle />} color="green" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QuickActions role="receiver" />
      <RecentActivity activity={activity} />
    </div>
  </>
);

// Reusable Stat Card
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-rose-600',
    orange: 'from-orange-500 to-amber-600',
    purple: 'from-purple-500 to-indigo-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover-lift border border-gray-100 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 h-1 bg-gradient-to-r ${colorClasses[color]} rounded-full"></div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ role }) => {
  const actions = {
    admin: [
      { name: 'Verify Requests', link: '/verify-requests', icon: <FaCheckCircle /> },
      { name: 'View All Requests', link: '/requests', icon: <FaClipboardList /> },
      { name: 'Analytics', link: '/analytics', icon: <FaChartLine /> },
      { name: 'Admin Panel', link: '/admin', icon: <FaUsers /> }
    ],
    ngo: [
      { name: 'Verify Requests', link: '/verify-requests', icon: <FaCheckCircle /> },
      { name: 'View Requests', link: '/requests', icon: <FaClipboardList /> },
      { name: 'Donor Directory', link: '/donors', icon: <FaMapMarkerAlt /> },
      { name: 'Analytics', link: '/analytics', icon: <FaChartLine /> }
    ],
    donor: [
      { name: 'View Urgent Requests', link: '/requests', icon: <FaExclamationTriangle /> },
      { name: 'Find Nearby Donors', link: '/donors', icon: <FaMapMarkerAlt /> },
      { name: 'My History', link: '/donation-history', icon: <FaHistory /> },
      { name: 'Give Ratings', link: '/ratings', icon: <FaStar /> }
    ],
    receiver: [
      { name: 'Create Request', link: '/create-request', icon: <FaPlusCircle /> },
      { name: 'View All Requests', link: '/requests', icon: <FaClipboardList /> },
      { name: 'Find Donors', link: '/donors', icon: <FaTint /> },
      { name: 'Chat with Donors', link: '/chat', icon: <FaComments /> }
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in-up">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <FaBolt className="mr-2 text-yellow-500" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {actions[role].map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group flex flex-col items-center p-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-xl transition-all duration-300 hover-lift"
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200 text-gray-600 group-hover:text-primary-600">{action.icon}</span>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 text-center transition-colors duration-300">{action.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ activity }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Verified': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activity.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          activity.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.type || 'Blood'} Request</p>
                <p className="text-xs text-gray-500 mt-1">{item.location || 'Location not specified'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status || 'Pending'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
