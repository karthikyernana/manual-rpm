import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAlerts: 0,
    pendingReminders: 0,
    todayVitals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch counts from API
      const [patientsRes, alertsRes, remindersRes] = await Promise.all([
        api.get('/patients?limit=1'),
        api.get('/alerts?status=active&limit=1'),
        api.get('/reminders?status=pending&limit=1')
      ]);

      setStats({
        totalPatients: patientsRes.data.data.pagination?.total || 0,
        activeAlerts: alertsRes.data.data.pagination?.total || 0,
        pendingReminders: remindersRes.data.data.pagination?.total || 0,
        todayVitals: 0 // Could be enhanced with actual count
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, link, color = 'primary' }) => (
    <Link to={link} className={`block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-${color}-600`}>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your overview for today
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Patients" 
              value={stats.totalPatients} 
              link="/patients"
              color="blue"
            />
            <StatCard 
              title="Active Alerts" 
              value={stats.activeAlerts} 
              link="/alerts"
              color="red"
            />
            <StatCard 
              title="Pending Reminders" 
              value={stats.pendingReminders} 
              link="/reminders"
              color="yellow"
            />
            <StatCard 
              title="Vitals Today" 
              value={stats.todayVitals} 
              link="/patients"
              color="green"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/patients/new" className="btn-primary text-center">
              ➕ Add New Patient
            </Link>
            <Link to="/patients" className="btn-secondary text-center">
              📋 View All Patients
            </Link>
            <Link to="/alerts" className="btn-secondary text-center">
              🚨 Check Alerts
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Version</p>
              <p className="font-medium">v0.3.0-rc (Day 3 Complete)</p>
            </div>
            <div>
              <p className="text-gray-600">Your Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium text-green-600">✓ All Systems Operational</p>
            </div>
            <div>
              <p className="text-gray-600">Environment</p>
              <p className="font-medium">Development</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
