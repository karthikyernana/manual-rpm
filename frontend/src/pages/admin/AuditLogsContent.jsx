import { useState, useEffect, useCallback } from 'react';
import { FileText, Filter, Download, RefreshCw, User, Activity, Settings, AlertTriangle, LogIn, LogOut, UserPlus, Edit, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';

const AuditLogsContent = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ action: '', dateFrom: '', dateTo: '' });
  const logsPerPage = 15;

  // Icon mapping for action types
  const getActionIcon = (action) => {
    const iconMap = {
      login: { icon: LogIn, color: 'var(--info)' },
      logout: { icon: LogOut, color: 'var(--text-tertiary)' },
      patient_create: { icon: UserPlus, color: 'var(--success)' },
      patient_update: { icon: Edit, color: 'var(--warning)' },
      patient_delete: { icon: AlertTriangle, color: 'var(--error)' },
      vitals_record: { icon: Activity, color: 'var(--brand-primary)' },
      vitals_update: { icon: Edit, color: 'var(--warning)' },
      alert_resolve: { icon: AlertTriangle, color: 'var(--success)' },
      settings_change: { icon: Settings, color: 'var(--info)' },
    };
    return iconMap[action] || { icon: FileText, color: 'var(--text-secondary)' };
  };

  // Format action name for display
  const formatAction = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: logsPerPage
      };
      
      if (filters.action) params.action = filters.action;
      if (filters.dateFrom) params.startDate = filters.dateFrom;
      if (filters.dateTo) params.endDate = filters.dateTo;

      const response = await api.get('/audit', { params });
      
      if (response.data.success) {
        setLogs(response.data.data.logs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // If no logs yet, show empty state
      if (error.response?.status === 404 || error.response?.data?.data?.logs?.length === 0) {
        setLogs([]);
      } else {
        toast.error('Failed to fetch audit logs');
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = async () => {
    try {
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.dateFrom) params.startDate = filters.dateFrom;
      if (filters.dateTo) params.endDate = filters.dateTo;

      const response = await api.get('/audit/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Logs exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export logs');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="skeleton w-32 h-4 rounded mb-2" />
                <div className="skeleton w-48 h-3 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Action Type</label>
            <select 
              className="input-field" 
              value={filters.action} 
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="patient_create">Patient Created</option>
              <option value="patient_update">Patient Updated</option>
              <option value="vitals_record">Vitals Recorded</option>
              <option value="alert_resolve">Alert Resolved</option>
              <option value="settings_change">Settings Changed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>From Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={filters.dateFrom} 
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>To Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={filters.dateTo} 
              onChange={(e) => handleFilterChange('dateTo', e.target.value)} 
            />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={fetchLogs} className="btn-secondary" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button onClick={handleExport} className="btn-primary">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Showing {logs.length} of {pagination.total} logs
      </p>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.map((log) => {
          const { icon: Icon, color } = getActionIcon(log.action);
          return (
            <div key={log._id} className="card-interactive">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg flex-shrink-0" style={{ background: `${color}20` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatAction(log.action)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {log.user?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {log.details}
                    </p>
                  )}
                  {log.resourceName && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      Resource: {log.resourceName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {logs.length === 0 && (
          <div className="card empty-state py-12">
            <FileText size={48} style={{ color: 'var(--text-tertiary)' }} className="mb-4" />
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No audit logs yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Actions in the system will be logged here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)} 
            disabled={pagination.page === 1} 
            className="btn-secondary text-sm"
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            onClick={() => handlePageChange(pagination.page + 1)} 
            disabled={pagination.page === pagination.pages} 
            className="btn-secondary text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogsContent;
