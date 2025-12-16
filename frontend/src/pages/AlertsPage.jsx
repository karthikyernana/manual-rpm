import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

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
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      alert('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id) => {
    const notes = prompt('Resolution notes (optional):');
    try {
      await api.put(`/alerts/${id}/resolve`, { notes: notes || '' });
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Alerts Dashboard</h1>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="input-field"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                className="input-field"
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

        {/* Alerts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No alerts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={alert._id}
                className={`card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${getSeverityColor(alert.severity)}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >  <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 bg-white rounded text-xs font-semibold uppercase">
                        {alert.severity}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Link to={`/patients/${alert.patient._id}`} className="font-semibold hover:underline">
                      {alert.patient.name} (MRN: {alert.patient.mrn})
                    </Link>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert._id)}
                          className="px-3 py-1 bg-white text-gray-700 rounded text-sm font-medium hover:bg-gray-100"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleResolve(alert._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                
                {alert.flaggedFields && alert.flaggedFields.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2 pt-2 border-t border-current opacity-75">
                    {alert.flaggedFields.map((field, idx) => (
                      <div key={idx}>
                        <span className="font-medium">{field.field}:</span> {field.value}
                        {field.normalRange && (
                          <span className="text-xs ml-1">
                            (normal: {field.normalRange.min}-{field.normalRange.max})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {alert.status !== 'active' && (
                  <div className="text-xs mt-2 pt-2 border-t border-current opacity-75">
                    {alert.status === 'acknowledged' && (
                      <p>Acknowledged by {alert.acknowledgedBy?.name} at {new Date(alert.acknowledgedAt).toLocaleString()}</p>
                    )}
                    {alert.status === 'resolved' && (
                      <p>Resolved by {alert.resolvedBy?.name} at {new Date(alert.resolvedAt).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AlertsPage;
