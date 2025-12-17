import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Check, 
  CheckCircle, 
  Clock, 
  Filter,
  RefreshCw,
  User,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from '../utils/toast';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState({ status: 'active', severity: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.severity) params.severity = filter.severity;

      const response = await api.get('/alerts', { params });
      if (response.data.success) {
        setAlerts(response.data.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id) => {
    const notes = prompt('Resolution notes (optional):');
    try {
      await api.put(`/alerts/${id}/resolve`, { notes: notes || '' });
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityStyles = (severity) => {
    const styles = {
      critical: { 
        bg: 'var(--error-muted)', 
        border: 'var(--error)',
        text: 'var(--error)',
        icon: 'var(--error)'
      },
      high: { 
        bg: 'rgba(249, 115, 22, 0.15)', 
        border: '#f97316',
        text: '#f97316',
        icon: '#f97316'
      },
      medium: { 
        bg: 'var(--warning-muted)', 
        border: 'var(--warning)',
        text: 'var(--warning)',
        icon: 'var(--warning)'
      },
      low: { 
        bg: 'var(--info-muted)', 
        border: 'var(--info)',
        text: 'var(--info)',
        icon: 'var(--info)'
      }
    };
    return styles[severity] || styles.low;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return AlertTriangle;
      case 'acknowledged': return Clock;
      case 'resolved': return CheckCircle;
      default: return AlertTriangle;
    }
  };

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
            onClick={() => fetchAlerts()}
            className="btn-secondary"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Status
              </label>
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <select
                  className="input-field pl-10 appearance-none cursor-pointer"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                  <option value="">All Status</option>
                </select>
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Severity
              </label>
              <div className="relative">
                <AlertTriangle
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <select
                  className="input-field pl-10 appearance-none cursor-pointer"
                  value={filter.severity}
                  onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerts List */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {loading ? (
              // Loading Skeletons
              [...Array(4)].map((_, i) => (
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
                      <div className="skeleton w-32 h-5 rounded mb-2" />
                      <div className="skeleton w-48 h-4 rounded mb-2" />
                      <div className="skeleton w-full h-4 rounded" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : alerts.length === 0 ? (
              <motion.div
                className="card empty-state py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <CheckCircle size={48} style={{ color: 'var(--success)' }} className="mb-4" />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  All clear!
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  No alerts found for the selected filters
                </p>
              </motion.div>
            ) : (
              alerts.map((alert, index) => {
                const severity = getSeverityStyles(alert.severity);
                const StatusIcon = getStatusIcon(alert.status);

                return (
                  <motion.div
                    key={alert._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="card relative overflow-hidden"
                    style={{
                      borderLeft: `4px solid ${severity.border}`
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Severity Icon */}
                      <div
                        className="p-2.5 rounded-lg flex-shrink-0"
                        style={{ background: severity.bg }}
                      >
                        <StatusIcon size={20} style={{ color: severity.icon }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="badge text-xs uppercase"
                            style={{ background: severity.bg, color: severity.text }}
                          >
                            {alert.severity}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <Link
                          to={`/patients/${alert.patient?._id}`}
                          className="font-semibold hover:underline flex items-center gap-2"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <User size={14} />
                          {alert.patient?.name} (MRN: {alert.patient?.mrn})
                          <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                        </Link>

                        <p
                          className="text-sm mt-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {alert.message}
                        </p>

                        {/* Flagged Fields */}
                        {alert.flaggedFields && alert.flaggedFields.length > 0 && (
                          <div
                            className="flex flex-wrap gap-2 mt-3 pt-3"
                            style={{ borderTop: '1px solid var(--border-subtle)' }}
                          >
                            {alert.flaggedFields.map((field, idx) => (
                              <span
                                key={idx}
                                className="badge badge-neutral text-xs"
                              >
                                {field.field}: {field.value}
                                {field.normalRange && (
                                  <span className="opacity-60 ml-1">
                                    ({field.normalRange.min}-{field.normalRange.max})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Resolution Info */}
                        {alert.status !== 'active' && (
                          <div
                            className="text-xs mt-3 pt-3"
                            style={{ 
                              borderTop: '1px solid var(--border-subtle)',
                              color: 'var(--text-tertiary)'
                            }}
                          >
                            {alert.status === 'acknowledged' && (
                              <p>Acknowledged by {alert.acknowledgedBy?.name} at {new Date(alert.acknowledgedAt).toLocaleString()}</p>
                            )}
                            {alert.status === 'resolved' && (
                              <p>Resolved by {alert.resolvedBy?.name} at {new Date(alert.resolvedAt).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleAcknowledge(alert._id)}
                              className="btn-secondary text-sm"
                            >
                              <Clock size={14} />
                              Acknowledge
                            </button>
                            <button
                              onClick={() => handleResolve(alert._id)}
                              className="btn-primary text-sm"
                            >
                              <Check size={14} />
                              Resolve
                            </button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <button
                            onClick={() => handleResolve(alert._id)}
                            className="btn-primary text-sm"
                          >
                            <Check size={14} />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AlertsPage;
