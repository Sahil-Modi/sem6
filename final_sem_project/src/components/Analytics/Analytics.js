import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalRequests: 0,
    totalDonors: 0,
    activeRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    verifiedRequests: 0,
    requestsByType: [],
    requestsByUrgency: [],
    requestsByStatus: [],
    usersByRole: [],
    requestTrends: [],
    topDonors: []
  });

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch all requests
      const requestsSnap = await getDocs(collection(db, 'requests'));
      const requests = requestsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Calculate user statistics
      const donors = users.filter(u => u.role === 'donor');
      const usersByRole = [
        { name: 'Admin', value: users.filter(u => u.role === 'admin').length },
        { name: 'Donor', value: donors.length },
        { name: 'Receiver', value: users.filter(u => u.role === 'receiver').length },
        { name: 'NGO', value: users.filter(u => u.role === 'ngo').length },
        { name: 'Hospital', value: users.filter(u => u.role === 'hospital').length }
      ];

      // Calculate request statistics
      const requestsByType = [
        { name: 'Blood', count: requests.filter(r => r.type === 'Blood').length },
        { name: 'Plasma', count: requests.filter(r => r.type === 'Plasma').length },
        { name: 'Oxygen', count: requests.filter(r => r.type === 'Oxygen').length },
        { name: 'Medicine', count: requests.filter(r => r.type === 'Medicine').length },
        { name: 'Other', count: requests.filter(r => !['Blood', 'Plasma', 'Oxygen', 'Medicine'].includes(r.type)).length }
      ];

      const requestsByUrgency = [
        { name: 'High', value: requests.filter(r => r.urgency === 'High').length },
        { name: 'Medium', value: requests.filter(r => r.urgency === 'Medium').length },
        { name: 'Low', value: requests.filter(r => r.urgency === 'Low').length }
      ];

      const requestsByStatus = [
        { name: 'Pending', value: requests.filter(r => r.status === 'Pending').length },
        { name: 'Verified', value: requests.filter(r => r.status === 'Verified').length },
        { name: 'Completed', value: requests.filter(r => r.status === 'Completed').length }
      ];

      // Generate trend data (last 7 days)
      const requestTrends = generateTrendData(requests);

      // Top donors (mock data - would need donation tracking)
      const topDonors = donors.slice(0, 5).map((d, i) => ({
        name: d.name,
        donations: Math.floor(Math.random() * 20) + 5
      }));

      setAnalytics({
        totalUsers: users.length,
        totalRequests: requests.length,
        totalDonors: donors.length,
        activeRequests: requests.filter(r => r.status !== 'Completed').length,
        completedRequests: requests.filter(r => r.status === 'Completed').length,
        pendingRequests: requests.filter(r => r.status === 'Pending').length,
        verifiedRequests: requests.filter(r => r.status === 'Verified').length,
        requestsByType,
        requestsByUrgency,
        requestsByStatus,
        usersByRole,
        requestTrends,
        topDonors
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (requests) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayRequests = requests.filter(r => {
        if (!r.createdAt) return false;
        const reqDate = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        return reqDate.toDateString() === date.toDateString();
      });

      last7Days.push({
        date: dateStr,
        requests: dayRequests.length,
        completed: dayRequests.filter(r => r.status === 'Completed').length
      });
    }
    return last7Days;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!userData || !['admin', 'ngo', 'hospital'].includes(userData.role)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights and statistics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={analytics.totalUsers} icon="👥" color="blue" />
        <StatCard title="Total Requests" value={analytics.totalRequests} icon="📋" color="purple" />
        <StatCard title="Active Donors" value={analytics.totalDonors} icon="❤️" color="red" />
        <StatCard title="Completed" value={analytics.completedRequests} icon="✅" color="green" />
      </div>

      {/* Request Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-900">{analytics.pendingRequests}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Verified</h3>
          <p className="text-3xl font-bold text-blue-900">{analytics.verifiedRequests}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Active</h3>
          <p className="text-3xl font-bold text-green-900">{analytics.activeRequests}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Request Trends */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Request Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.requestTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#0284c7" name="Total Requests" />
              <Line type="monotone" dataKey="completed" stroke="#16a34a" name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Requests by Type */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Requests by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.requestsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0284c7" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Requests by Urgency */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">By Urgency</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.requestsByUrgency}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.requestsByUrgency.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Requests by Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">By Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.requestsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.requestsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.usersByRole}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Donors Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Donors</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topDonors.map((donor, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.donations}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
};

export default Analytics;
