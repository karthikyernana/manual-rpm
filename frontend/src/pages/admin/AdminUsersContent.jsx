import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, UserPlus, Shield, Stethoscope, Briefcase, Edit, Users } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from '../../utils/toast';

const AdminUsersContent = () => {
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
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        const response = await api.put(`/auth/users/${editingUser._id}`, updateData);
        if (response.data.success) {
          toast.success('User updated successfully!');
          fetchUsers();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/auth/register', formData);
        if (response.data.success) {
          toast.success(`${formData.role} account created successfully!`);
          fetchUsers();
          handleCloseModal();
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user`;
      toast.error(errorMsg);
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
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMsg);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: { icon: Shield, color: 'var(--brand-primary)' },
      doctor: { icon: Stethoscope, color: 'var(--info)' },
      nurse: { icon: Briefcase, color: 'var(--success)' }
    };
    const config = icons[role] || icons.nurse;
    const Icon = config.icon;
    return <Icon size={20} style={{ color: config.color }} />;
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: 'var(--brand-muted)', text: 'var(--brand-primary)' },
      doctor: { bg: 'var(--info-muted)', text: 'var(--info)' },
      nurse: { bg: 'var(--success-muted)', text: 'var(--success)' }
    };
    return colors[role] || colors.nurse;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            User Management
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage nurses, doctors, and admin accounts
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="contents">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  className="card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="skeleton w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <div className="skeleton w-24 h-4 rounded mb-2" />
                      <div className="skeleton w-32 h-3 rounded" />
                    </div>
                  </div>
                  <div className="skeleton w-16 h-5 rounded-full" />
                </motion.div>
              ))}
            </motion.div>
          ) : users.length === 0 ? (
            <motion.div
              key="empty"
              className="col-span-full card empty-state py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Users size={48} style={{ color: 'var(--text-tertiary)' }} className="mb-4" />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                No users found
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Add your first user to get started
              </p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <UserPlus size={18} />
                Add User
              </button>
            </motion.div>
          ) : (
            users.map((user, index) => {
              const roleStyle = getRoleBadge(user.role);
              return (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="card-interactive group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: roleStyle.bg }}
                      >
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {user.name}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn-icon"
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user)}
                        className="btn-icon"
                        style={{ color: 'var(--error)' }}
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="badge text-xs uppercase"
                      style={{ background: roleStyle.bg, color: roleStyle.text }}
                    >
                      {user.role}
                    </span>
                    {user.phone && (
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {user.phone}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-3 text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* User Form Modal */}
      <Modal 
        isOpen={showForm} 
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordField(!showPasswordField)}
                  className="text-sm font-medium"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  {showPasswordField ? '- Hide' : '+ Change Password'}
                </button>
              </div>
              {showPasswordField && (
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    minLength={8}
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 characters with letter and number"
                  />
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Leave blank to keep current password
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Password*
              </label>
              <input
                type="password"
                required
                minLength={8}
                pattern="^(?=.*[A-Za-z])(?=.*\d).{8,}$"
                title="Password must be at least 8 characters with at least one letter and one number"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 characters with letter and number"
              />
            </div>
          )}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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
          <div className="flex gap-3 pt-4">
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

export default AdminUsersContent;
