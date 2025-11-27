import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData.name}!
          </h1>
          <p className="text-gray-600 mt-1 capitalize">
            {userData.role} Dashboard
            {!userData.verified && userData.role !== 'donor' && userData.role !== 'receiver' && (
              <span className="ml-2 text-yellow-600 font-medium">
                (Pending Verification)
              </span>
            )}
          </p>
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
      <StatCard title="Total Requests" value={stats.totalRequests} icon="📋" color="blue" />
      <StatCard title="Active" value={stats.activeRequests} icon="🔄" color="yellow" />
      <StatCard title="Completed" value={stats.completedRequests} icon="✅" color="green" />
      <StatCard title="Verification Queue" value="12" icon="⏳" color="orange" />
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
      <StatCard title="Requests to Verify" value={stats.activeRequests} icon="✓" color="blue" />
      <StatCard title="Verified" value={stats.completedRequests} icon="✅" color="green" />
      <StatCard title="In Progress" value={stats.activeRequests} icon="🔄" color="yellow" />
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
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thank you for being a donor! 🎉</h2>
          <p className="text-gray-600 mt-2">You can save lives by responding to urgent requests.</p>
        </div>
        <div className="text-4xl">{userData.bloodGroup || '🩸'}</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="Urgent Requests" value={stats.activeRequests} icon="🚨" color="red" />
      <StatCard title="My Contributions" value="5" icon="❤️" color="green" />
      <StatCard title="Availability" value={userData.availability ? "Active" : "Inactive"} icon="📍" color="blue" />
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
    <div className="bg-blue-50 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800">Need urgent medical resources?</h2>
      <p className="text-gray-600 mt-2">Submit a request and we'll connect you with verified donors and NGOs.</p>
      <Link to="/create-request" className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
        Create New Request
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="My Requests" value={stats.myRequests} icon="📝" color="blue" />
      <StatCard title="In Progress" value={stats.activeRequests} icon="🔄" color="yellow" />
      <StatCard title="Fulfilled" value={stats.completedRequests} icon="✅" color="green" />
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
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ role }) => {
  const actions = {
    admin: [
      { name: 'Verify Requests', link: '/verify-requests', icon: '✓' },
      { name: 'View All Requests', link: '/requests', icon: '📋' },
      { name: 'Analytics', link: '/analytics', icon: '📊' },
      { name: 'Admin Panel', link: '/admin', icon: '👥' }
    ],
    ngo: [
      { name: 'Verify Requests', link: '/verify-requests', icon: '✓' },
      { name: 'View Requests', link: '/requests', icon: '📋' },
      { name: 'Donor Directory', link: '/donors', icon: '📍' },
      { name: 'Analytics', link: '/analytics', icon: '📊' }
    ],
    donor: [
      { name: 'View Urgent Requests', link: '/requests', icon: '🚨' },
      { name: 'Find Nearby Donors', link: '/donors', icon: '📍' },
      { name: 'My History', link: '/donation-history', icon: '�' },
      { name: 'Give Ratings', link: '/ratings', icon: '⭐' }
    ],
    receiver: [
      { name: 'Create Request', link: '/create-request', icon: '➕' },
      { name: 'View All Requests', link: '/requests', icon: '📋' },
      { name: 'Find Donors', link: '/donors', icon: '�' },
      { name: 'Chat with Donors', link: '/chat', icon: '�' }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions[role].map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700">{action.name}</span>
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
