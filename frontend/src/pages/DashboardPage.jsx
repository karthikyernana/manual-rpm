import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  ClipboardList, 
  Bell, 
  Users, 
  AlertTriangle,
  Activity,
  TrendingUp,
  ArrowRight,
  LogIn,
  UserPlus,
  Edit,
  CheckCircle,
  Clock
} from 'lucide-react';
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
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch each stat separately to handle individual failures
      let totalPatients = 0;
      let activeAlerts = 0;
      let pendingReminders = 0;
      let todayVitals = 0;

      try {
        const patientsRes = await api.get('/patients?limit=1');
        totalPatients = patientsRes.data.data.pagination?.total || 0;
      } catch {
        console.log('Could not fetch patients count');
      }

      try {
        const alertsRes = await api.get('/alerts?status=active&limit=1');
        activeAlerts = alertsRes.data.data.pagination?.total || 0;
      } catch {
        console.log('Could not fetch alerts count');
      }

      try {
        const remindersRes = await api.get('/reminders?status=pending&limit=1');
        pendingReminders = remindersRes.data.data.pagination?.total || 0;
      } catch {
        console.log('Could not fetch reminders count');
      }

      try {
        const vitalsRes = await api.get('/vitals/stats');
        todayVitals = vitalsRes.data.data.todayCount || 0;
      } catch {
        console.log('Could not fetch vitals stats');
      }

      try {
        const activityRes = await api.get('/audit/recent?limit=5');
        setRecentActivity(activityRes.data.data || []);
      } catch {
        console.log('Could not fetch recent activity');
      }

      setStats({
        totalPatients,
        activeAlerts,
        pendingReminders,
        todayVitals
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      link: '/patients',
      color: 'info',
      description: 'Active patients in system'
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      icon: AlertTriangle,
      link: '/alerts',
      color: 'error',
      description: 'Require attention'
    },
    {
      title: 'Pending Reminders',
      value: stats.pendingReminders,
      icon: Bell,
      link: '/reminders',
      color: 'warning',
      description: 'Tasks to complete'
    },
    {
      title: 'Today\'s Vitals',
      value: stats.todayVitals,
      icon: Activity,
      link: '/patients',
      color: 'success',
      description: 'Readings recorded today'
    }
  ];

  const quickActions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      icon: PlusCircle,
      link: '/patients/new',
      primary: true
    },
    {
      title: 'View Patients',
      description: 'Browse all patients',
      icon: ClipboardList,
      link: '/patients',
      primary: false
    },
    {
      title: 'Check Alerts',
      description: 'Review active alerts',
      icon: AlertTriangle,
      link: '/alerts',
      primary: false
    }
  ];

  const colorMap = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)'
  };

  const mutedMap = {
    success: 'var(--success-muted)',
    warning: 'var(--warning-muted)',
    error: 'var(--error-muted)',
    info: 'var(--info-muted)'
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="page-content">
        {/* Welcome Section */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-title">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="page-subtitle">
            Here's what's happening with your patients today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" className="contents">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={`skeleton-${i}`} 
                    className="stat-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="skeleton w-10 h-10 rounded-lg" />
                      <div className="skeleton w-16 h-6 rounded" />
                    </div>
                    <div className="skeleton w-24 h-8 rounded mb-2" />
                    <div className="skeleton w-32 h-4 rounded" />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="stats" className="contents">
                {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <Link to={stat.link}>
                      <div
                        className={`stat-card stat-card-${stat.color}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="p-2.5 rounded-lg"
                            style={{ background: mutedMap[stat.color] }}
                          >
                            <Icon
                              size={20}
                              style={{ color: colorMap[stat.color] }}
                            />
                          </div>
                          <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <TrendingUp size={14} />
                            <span className="text-xs">View</span>
                          </div>
                        </div>
                        <p
                          className="text-3xl font-bold mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {stat.value}
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {stat.title}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {stat.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link to={action.link}>
                    <div
                      className={action.primary ? 'btn-primary w-full justify-between py-4' : 'card-interactive flex items-center justify-between'}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <div className="text-left">
                          <p className="font-medium">{action.title}</p>
                          <p
                            className="text-xs opacity-70"
                            style={{ color: action.primary ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}
                          >
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="opacity-50" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity Section */}
        <motion.div
          className="card mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Recent Activity</h2>
            <Link to="/settings" className="text-sm" style={{ color: 'var(--brand-primary)' }}>
              View all
            </Link>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const getIcon = (action) => {
                  if (action.includes('login')) return LogIn;
                  if (action.includes('patient_create')) return UserPlus;
                  if (action.includes('vitals')) return Activity;
                  if (action.includes('alert')) return AlertTriangle;
                  if (action.includes('reminder')) return CheckCircle;
                  if (action.includes('update')) return Edit;
                  return Activity;
                };
                const Icon = getIcon(activity.action);
                
                return (
                  <div
                    key={activity._id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: 'var(--brand-muted)' }}>
                      <Icon size={16} style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {activity.details || activity.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {activity.user?.name || 'User'} • {new Date(activity.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state py-8">
              <Activity size={40} className="empty-state-icon" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No recent activity. Actions will appear here.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
