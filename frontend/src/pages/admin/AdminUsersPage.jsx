import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Shield, Stethoscope, Briefcase, Edit } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from '../../utils/toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'nurse',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone
        };
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        const response = await api.put(`/auth/users/${editingUser._id}`, updateData);
        if (response.data.success) {
          toast.success('✅ User updated successfully!');          fetchUsers();
          handleCloseModal();
        }
      } else {
        // Create new user
        const response = await api.post('/auth/register', formData);
        if (response.data.success) {
          toast.success(`✅ ${formData.role} account created successfully!`);          fetchUsers();
          handleCloseModal();
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user`;
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || ''
    });
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingUser(null);
    setShowPasswordField(false);
    setFormData({ name: '', email: '', password: '', role: 'nurse', phone: '' });
  };

  const handleDelete = async (id, user) => {
    if (!confirm(`Delete ${user.name}? This action cannot be undone.`)) return;

    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('User deleted successfully');      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      alert(`❌ ${errorMsg}`);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={20} className="text-purple-600" />;
      case 'doctor': return <Stethoscope size={20} className="text-blue-600" />;
      case 'nurse': return <Briefcase size={20} className="text-green-600" />;
      default: return null;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage nurses, doctors, and admin accounts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>Add User</span>
          </button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user._id} className="card hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(user.role)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="Edit user"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id, user)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                  {user.phone && (
                    <span className="text-sm text-gray-600">{user.phone}</span>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* User Form Modal */}
      <Modal 
        isOpen={showForm} 
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name*
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@hospital.com"
            />
          </div>
          {editingUser ? (
            <>
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordField(!showPasswordField)}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  {showPasswordField ? '− Hide' : '+ Change Password'}
                </button>
              </div>
              {showPasswordField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role*
            </label>
            <select
              required
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="nurse">Nurse</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <input
              type="tel"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingUser ? 'Update User' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
