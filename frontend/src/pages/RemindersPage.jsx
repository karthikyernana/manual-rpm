import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  Plus, 
  Bell,
  User,
  Calendar,
  RefreshCw,
  AlarmClock
} from 'lucide-react';
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
  }, [filter]);

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
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reminders', formData);
      toast.success('Reminder created successfully!');
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
      toast.error(errorMsg);
    }
  };

  const handleSnooze = async (id) => {
    const hours = prompt('Snooze for how many hours? (1-72)');
    if (!hours || isNaN(hours) || hours < 1 || hours > 72) {
      toast.error('Please enter a valid number between 1 and 72');
      return;
    }

    try {
      await api.put(`/reminders/${id}/snooze`, { hours: parseInt(hours) });
      toast.success('Reminder snoozed');
      fetchReminders();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      toast.error('Failed to snooze reminder');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/reminders/${id}/complete`);
      toast.success('Reminder completed');
      fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      high: { border: 'var(--error)', bg: 'var(--error-muted)', text: 'var(--error)' },
      medium: { border: 'var(--warning)', bg: 'var(--warning-muted)', text: 'var(--warning)' },
      low: { border: 'var(--info)', bg: 'var(--info-muted)', text: 'var(--info)' }
    };
    return styles[priority] || styles.medium;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vitals_due': return Bell;
      case 'medication': return AlarmClock;
      case 'appointment': return Calendar;
      default: return Clock;
    }
  };

  const filterTabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'snoozed', label: 'Snoozed' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' }
  ];

  return (
    <div className="page-container">
      <Navbar />

      <main className="page-content">
        {/* Header Actions */}
        <motion.div
          className="flex justify-end mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            <span>Create Reminder</span>
          </button>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                filter === tab.key
                  ? ''
                  : 'btn-secondary'
              }`}
              style={
                filter === tab.key
                  ? { background: 'var(--brand-primary)', color: 'white' }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => fetchReminders()}
            className="btn-icon ml-auto"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </motion.div>

        {/* Reminders List */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" className="contents">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    className="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="skeleton w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <div className="skeleton w-24 h-5 rounded mb-2" />
                        <div className="skeleton w-48 h-4 rounded mb-2" />
                        <div className="skeleton w-32 h-3 rounded" />
                      </div>
                    </div>
                  </motion.div>
                ))}              </motion.div>
            ) : reminders.length === 0 ? (
              <motion.div
                key="empty"
                className="card empty-state py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Bell size={48} style={{ color: 'var(--text-tertiary)' }} className="mb-4" />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No reminders found
                </h3>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Create a reminder to get started
                </p>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                  <Plus size={18} />
                  Create Reminder
                </button>
              </motion.div>
            ) : (
              <motion.div key="reminders" className="contents">
                {reminders.map((reminder, index) => {
                const priority = getPriorityStyles(reminder.priority);
                const TypeIcon = getTypeIcon(reminder.type);

                return (
                  <motion.div
                    key={reminder._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="card"
                    style={{ borderLeft: `4px solid ${priority.border}` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="p-2.5 rounded-lg flex-shrink-0"
                        style={{ background: priority.bg }}
                      >
                        <TypeIcon size={20} style={{ color: priority.text }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="badge text-xs uppercase"
                            style={{ background: priority.bg, color: priority.text }}
                          >
                            {reminder.priority}
                          </span>
                          <span className="badge badge-neutral text-xs uppercase">
                            {reminder.type.replace('_', ' ')}
                          </span>
                          {reminder.autoGenerated && (
                            <span className="badge badge-brand text-xs">Auto</span>
                          )}
                        </div>

                        <h3
                          className="font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {reminder.title}
                        </h3>

                        {reminder.description && (
                          <p
                            className="text-sm mt-1"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {reminder.description}
                          </p>
                        )}

                        <div
                          className="flex flex-wrap items-center gap-4 mt-3 text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Link
                            to={`/patients/${reminder.patient?._id}`}
                            className="flex items-center gap-1 hover:underline"
                          >
                            <User size={14} />
                            {reminder.patient?.name}
                          </Link>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {reminder.customTime 
                              ? new Date(reminder.dueDate).toLocaleString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : new Date(reminder.dueDate).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                            }
                          </span>
                          {reminder.snoozedUntil && (
                            <span
                              className="flex items-center gap-1"
                              style={{ color: 'var(--warning)' }}
                            >
                              <AlarmClock size={14} />
                              Snoozed until: {new Date(reminder.snoozedUntil).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {(reminder.status === 'pending' || reminder.status === 'snoozed') && (
                          <>
                            <button
                              onClick={() => handleSnooze(reminder._id)}
                              className="btn-secondary text-sm"
                            >
                              <Clock size={14} />
                              Snooze
                            </button>
                            <button
                              onClick={() => handleComplete(reminder._id)}
                              className="btn-primary text-sm"
                            >
                              <CheckCircle size={14} />
                              Complete
                            </button>
                          </>
                        )}
                        {reminder.status === 'completed' && (
                          <span className="badge badge-success">
                            <CheckCircle size={12} className="mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
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
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
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
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
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
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
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
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
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

          <div className="flex gap-3 pt-4">
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
