import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary-600">Manual-RPM</h1>
              <Link to="/patients" className="text-gray-600 hover:text-gray-900 font-medium">
                Patients
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h3 className="font-medium text-primary-900 mb-2">✅ Day 1 Complete!</h3>
                <p className="text-sm text-primary-700">
                  Authentication system working perfectly.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{user?.name}</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{user?.email}</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">Role</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900 capitalize">{user?.role}</div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">🚀 Day 2 In Progress!</h4>
                <p className="text-sm text-green-700 mb-3">
                  Patient Management system is being built. Navigate to Patients to start managing patient records.
                </p>
                <Link to="/patients" className="btn-primary inline-block">
                  Go to Patients →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
