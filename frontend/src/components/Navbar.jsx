import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Bell, 
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-primary-600">Manual-RPM</span>
            </Link>
            
            <div className="hidden md:flex space-x-2">
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/patients" className={navLinkClass('/patients')}>
                <Users size={18} />
                <span>Patients</span>
              </Link>
              <Link to="/alerts" className={navLinkClass('/alerts')}>
                <AlertTriangle size={18} />
                <span>Alerts</span>
              </Link>
              <Link to="/reminders" className={navLinkClass('/reminders')}>
              <Bell size={18} />
              <span>Reminders</span>
            </Link>
            <Link to="/settings" className={navLinkClass('/settings')}>
              <SettingsIcon size={18} />
              <span>Settings</span>
            </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                  <UserPlus size={18} />
                  <span>Manage Users</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <UserIcon size={16} className="text-gray-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
