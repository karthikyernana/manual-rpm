import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Bell, 
  LogOut,
  Settings as SettingsIcon,
  Moon,
  Sun,
  ChevronDown,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ProfileModal from './ProfileModal';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      return false;
    }
    return true;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard">
              <Logo size="default" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${active ? 'nav-link-active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Theme Toggle + User */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="btn-icon"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                style={{
                  background: showUserMenu ? 'var(--bg-hover)' : 'transparent',
                }}
                whileHover={{ background: 'var(--bg-hover)' }}
              >
                <div className="avatar avatar-sm">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user?.name}
                  </p>
                  <p
                    className="text-xs capitalize"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user?.role}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  style={{ color: 'var(--text-secondary)' }}
                  className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                />
              </motion.button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg py-1 z-20"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div
                      className="px-4 py-2 border-b"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = 'var(--bg-hover)')
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = 'transparent')
                      }
                    >
                      <User size={16} />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--error)' }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = 'var(--error-muted)')
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = 'transparent')
                      }
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </nav>
  );
};

export default Navbar;
