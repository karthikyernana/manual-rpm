import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Camera, Save, Shield, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast';
import api from '../services/api';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    dailySummary: true,
    criticalAlerts: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      toast.success('Profile updated successfully!');
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = () => {
    localStorage.setItem('notificationPrefs', JSON.stringify(notifications));
    toast.success('Notification preferences saved');
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ 
          background: 'var(--bg-elevated)',
          animation: 'slideUp 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Account Settings
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="px-6 pt-4 flex gap-1"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 -mb-px rounded-t-lg flex items-center gap-2 text-sm font-medium transition-colors"
                style={activeTab === tab.id ? {
                  background: 'var(--bg-tertiary)',
                  color: 'var(--brand-primary)',
                  borderBottom: '2px solid var(--brand-primary)'
                } : {
                  color: 'var(--text-secondary)'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                    style={{ background: 'var(--brand-muted)', color: 'var(--brand-primary)' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-2 rounded-full"
                    style={{ background: 'var(--brand-primary)', color: 'white' }}
                    title="Change avatar"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="text"
                    className="input-field pl-10"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="email"
                    className="input-field pl-10"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="your@email.com"
                    disabled
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Contact admin to change email
                </p>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Current Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="password"
                    className="input-field pl-10"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="password"
                    className="input-field pl-10"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="password"
                    className="input-field pl-10"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  <Lock size={16} />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <label
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Email Alerts
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Receive email for critical alerts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--brand-primary)' }}
                />
              </label>

              <label
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Daily Summary
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Get a daily digest of activities
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailySummary}
                  onChange={(e) => setNotifications({ ...notifications, dailySummary: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--brand-primary)' }}
                />
              </label>

              <label
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Critical Alerts
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Browser notifications for urgent alerts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.criticalAlerts}
                  onChange={(e) => setNotifications({ ...notifications, criticalAlerts: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--brand-primary)' }}
                />
              </label>

              <div className="pt-2">
                <button onClick={handleNotificationSave} className="btn-primary w-full">
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
