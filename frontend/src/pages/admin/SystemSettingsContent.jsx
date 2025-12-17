import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Edit, Building2, BedDouble, Bell, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from '../../utils/toast';

const SystemSettingsContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [wardForm, setWardForm] = useState({ name: '', beds: 10 });
  const [settings, setSettings] = useState({
    wards: [],
    defaultVitalsInterval: 4,
    autoGenerateReminders: true,
    alertRetentionDays: 90,
    criticalAlertNotifications: true,
    emailNotifications: true,
    dailySummaryEmail: true
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await api.put('/settings', {
        defaultVitalsInterval: settings.defaultVitalsInterval,
        autoGenerateReminders: settings.autoGenerateReminders,
        alertRetentionDays: settings.alertRetentionDays,
        criticalAlertNotifications: settings.criticalAlertNotifications,
        emailNotifications: settings.emailNotifications,
        dailySummaryEmail: settings.dailySummaryEmail
      });
      
      if (response.data.success) {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddWard = async () => {
    if (!wardForm.name.trim()) {
      toast.error('Ward name is required');
      return;
    }
    
    try {
      const response = await api.post('/settings/wards', wardForm);
      if (response.data.success) {
        setSettings(prev => ({ ...prev, wards: response.data.data }));
        setWardForm({ name: '', beds: 10 });
        setShowWardModal(false);
        toast.success('Ward added successfully!');
      }
    } catch (error) {
      console.error('Error adding ward:', error);
      toast.error(error.response?.data?.message || 'Failed to add ward');
    }
  };

  const handleEditWard = async () => {
    if (!wardForm.name.trim()) {
      toast.error('Ward name is required');
      return;
    }
    
    try {
      const response = await api.put(`/settings/wards/${editingWard}`, {
        newName: wardForm.name,
        beds: wardForm.beds
      });
      if (response.data.success) {
        setSettings(prev => ({ ...prev, wards: response.data.data }));
        setWardForm({ name: '', beds: 10 });
        setEditingWard(null);
        setShowWardModal(false);
        toast.success('Ward updated successfully!');
      }
    } catch (error) {
      console.error('Error updating ward:', error);
      toast.error(error.response?.data?.message || 'Failed to update ward');
    }
  };

  const handleDeleteWard = async (wardName) => {
    if (!confirm(`Delete ward "${wardName}"?`)) return;
    
    try {
      const response = await api.delete(`/settings/wards/${encodeURIComponent(wardName)}`);
      if (response.data.success) {
        setSettings(prev => ({ ...prev, wards: response.data.data }));
        toast.success('Ward deleted');
      }
    } catch (error) {
      console.error('Error deleting ward:', error);
      toast.error('Failed to delete ward');
    }
  };

  const openEditModal = (ward) => {
    setEditingWard(ward.name);
    setWardForm({ name: ward.name, beds: ward.beds });
    setShowWardModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton w-32 h-6 rounded mb-4" />
            <div className="skeleton w-full h-20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const activeWards = settings.wards?.filter(w => w.active) || [];

  return (
    <div className="space-y-6">
      {/* Ward Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--info-muted)' }}>
              <Building2 size={20} style={{ color: 'var(--info)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ward Management</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {activeWards.length} active wards
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchSettings} className="btn-secondary text-sm">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => { setEditingWard(null); setWardForm({ name: '', beds: 10 }); setShowWardModal(true); }} className="btn-primary text-sm">
              <Plus size={16} />
              Add Ward
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {activeWards.map((ward) => (
            <div
              key={ward.name}
              className="group p-3 rounded-lg flex items-center justify-between"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <BedDouble size={16} style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <span style={{ color: 'var(--text-primary)' }}>{ward.name}</span>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{ward.beds} beds</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(ward)} className="btn-icon"><Edit size={14} /></button>
                <button onClick={() => handleDeleteWard(ward.name)} className="btn-icon" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {activeWards.length === 0 && (
            <div className="col-span-full text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              No wards configured. Add your first ward.
            </div>
          )}
        </div>
      </div>

      {/* Vitals Configuration */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ background: 'var(--success-muted)' }}>
            <Clock size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Vitals Configuration</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Default settings for vitals recording</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Default Vitals Interval</label>
            <select 
              className="input-field" 
              value={settings.defaultVitalsInterval} 
              onChange={(e) => setSettings({ ...settings, defaultVitalsInterval: parseInt(e.target.value) })}
            >
              <option value={1}>Every 1 hour</option>
              <option value={2}>Every 2 hours</option>
              <option value={4}>Every 4 hours</option>
              <option value={6}>Every 6 hours</option>
              <option value={8}>Every 8 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Every 24 hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Auto-generate Reminders</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.autoGenerateReminders} 
                onChange={(e) => setSettings({ ...settings, autoGenerateReminders: e.target.checked })} 
                className="w-5 h-5 rounded" 
                style={{ accentColor: 'var(--brand-primary)' }} 
              />
              <span style={{ color: 'var(--text-secondary)' }}>Create reminders for vitals</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ background: 'var(--warning-muted)' }}>
            <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Alert Settings</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure alert behaviors</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Alert Retention</label>
            <select 
              className="input-field" 
              value={settings.alertRetentionDays} 
              onChange={(e) => setSettings({ ...settings, alertRetentionDays: parseInt(e.target.value) })}
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Critical Alert Notifications</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.criticalAlertNotifications} 
                onChange={(e) => setSettings({ ...settings, criticalAlertNotifications: e.target.checked })} 
                className="w-5 h-5 rounded" 
                style={{ accentColor: 'var(--brand-primary)' }} 
              />
              <span style={{ color: 'var(--text-secondary)' }}>Browser notifications for critical alerts</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ background: 'var(--brand-muted)' }}>
            <Bell size={20} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage system notifications</p>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer" style={{ background: 'var(--bg-tertiary)' }}>
            <span style={{ color: 'var(--text-primary)' }}>Email notifications for critical alerts</span>
            <input 
              type="checkbox" 
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="w-5 h-5 rounded" 
              style={{ accentColor: 'var(--brand-primary)' }} 
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer" style={{ background: 'var(--bg-tertiary)' }}>
            <span style={{ color: 'var(--text-primary)' }}>Daily summary emails</span>
            <input 
              type="checkbox" 
              checked={settings.dailySummaryEmail}
              onChange={(e) => setSettings({ ...settings, dailySummaryEmail: e.target.checked })}
              className="w-5 h-5 rounded" 
              style={{ accentColor: 'var(--brand-primary)' }} 
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={saveSettings} className="btn-primary" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Ward Modal */}
      <Modal 
        isOpen={showWardModal} 
        onClose={() => { setShowWardModal(false); setEditingWard(null); setWardForm({ name: '', beds: 10 }); }} 
        title={editingWard ? 'Edit Ward' : 'Add New Ward'} 
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Ward Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={wardForm.name} 
              onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} 
              placeholder="e.g., ICU-3" 
              autoFocus 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Number of Beds</label>
            <input 
              type="number" 
              className="input-field" 
              value={wardForm.beds} 
              onChange={(e) => setWardForm({ ...wardForm, beds: parseInt(e.target.value) || 10 })} 
              min={1}
              max={100}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={editingWard ? handleEditWard : handleAddWard} className="btn-primary flex-1">
              {editingWard ? 'Update' : 'Add'}
            </button>
            <button onClick={() => { setShowWardModal(false); setEditingWard(null); setWardForm({ name: '', beds: 10 }); }} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SystemSettingsContent;
