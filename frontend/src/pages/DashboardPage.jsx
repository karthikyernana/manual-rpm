import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ClipboardList, Bell } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
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
            <Link to="/patients/new" className="btn-primary text-center flex items-center justify-center space-x-2">
              <PlusCircle size={18} />
              <span>Add New Patient</span>
            </Link>
            <Link to="/patients" className="btn-secondary text-center flex items-center justify-center space-x-2">
              <ClipboardList size={18} />
              <span>View All Patients</span>
            </Link>
            <Link to="/alerts" className="btn-secondary text-center flex items-center justify-center space-x-2">
              <Bell size={18} />
              <span>Check Alerts</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
