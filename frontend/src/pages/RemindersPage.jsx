import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import api from '../services/api';
import toast from '../utils/toast';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    title: '',
    description: '',
    type: 'custom',
    priority: 'medium',
    dueDate: '',
    customTime: '',
    recurrence: 'none'
  });

  useEffect(() => {
    fetchReminders();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients?limit=100');
      if (response.data.success) {
        setPatients(response.data.data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      
      const response = await api.get('/reminders', { params });
      if (response.data.success) {
        setReminders(response.data.data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reminders', formData);
      toast.success('✅ Reminder created successfully!');
      fetchReminders();
      setShowModal(false);
      setFormData({
        patient: '',
        title: '',
        description: '',
        type: 'custom',
        priority: 'medium',
        dueDate: '',
        customTime: '',
        recurrence: 'none'
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create reminder';
      toast.error(`❌ ${errorMsg}`);    }
  };

  const handleSnooze = async (id) => {
    const hours = prompt('Snooze for how many hours? (1-72)');
    if (!hours || isNaN(hours) || hours < 1 || hours > 72) {
      alert('Please enter a valid number between 1 and 72');
      return;
    }

    try {
      await api.put(`/reminders/${id}/snooze`, { hours: parseInt(hours) });
      fetchReminders();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      alert('Failed to snooze reminder');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/reminders/${id}/complete`);
      fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
      alert('Failed to complete reminder');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-blue-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  const filterTabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'snoozed', label: 'Snoozed' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
            <p className="text-gray-600 mt-1">Manage patient reminders and tasks</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Reminder</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                filter === tab.key
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reminders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No reminders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder._id}
                className={`card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${getPriorityColor(reminder.priority)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold uppercase">
                        {reminder.type.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold uppercase">
                        {reminder.priority}
                      </span>
                      {reminder.autoGenerated && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          Auto
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{reminder.title}</h3>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <Link to={`/patients/${reminder.patient._id}`} className="hover:underline">
                        {reminder.patient.name} (MRN: {reminder.patient.mrn})
                      </Link>
                      <span>Due: {new Date(reminder.dueDate).toLocaleString()}</span>
                      {reminder.snoozedUntil && (
                        <span className="text-yellow-600">
                          Snoozed until: {new Date(reminder.snoozedUntil).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {reminder.status === 'pending' || reminder.status === 'snoozed' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSnooze(reminder._id)}
                        className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                      >
                        <Clock size={14} />
                        <span>Snooze</span>
                      </button>
                      <button
                        onClick={() => handleComplete(reminder._id)}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                      >
                        <CheckCircle size={14} />
                        <span>Complete</span>
                      </button>
                    </div>
                  ) : null}
                    {reminder.status === 'completed' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Reminder Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Reminder"
        size="md"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient*
            </label>
            <select
              required
              className="input-field"
              value={formData.patient}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
            >
              <option value="">Select patient...</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.mrn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Take medication"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input-field"
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type*
              </label>
              <select
                required
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="custom">Custom</option>
                <option value="vitals_due">Vitals Due</option>
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="follow_up">Follow Up</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority*
              </label>
              <select
                required
                className="input-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date*
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (Optional)
              </label>
              <input
                type="time"
                className="input-field"
                value={formData.customTime}
                onChange={(e) => setFormData({ ...formData, customTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence
            </label>
            <select
              className="input-field"
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
            >
              <option value="none">None (One-time)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Create Reminder
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
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

export default RemindersPage;
