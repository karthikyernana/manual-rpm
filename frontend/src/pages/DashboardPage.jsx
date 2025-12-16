import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Manual-RPM</h1>
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
                <h3 className="font-medium text-primary-900 mb-2">✅ Authentication Working!</h3>
                <p className="text-sm text-primary-700">
                  You are successfully logged in as <strong>{user?.role}</strong>
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

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🚀 Day 1 Complete!</h4>
                <p className="text-sm text-gray-600">
                  The authentication system is fully functional. Next up: Patient Management (Day 2).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
