import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Share2, FileText, Table, Activity, Trash2, Calendar, User, LogOut, RefreshCw, Clock, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import SharePatientModal from '../components/SharePatientModal';
import { generatePDF, downloadCSV } from '../utils/export';
import toast from '../utils/toast';
import api from '../services/api';

const WARDS = ['ICU-1', 'ICU-2', 'General-1', 'Cardiac', 'Pediatric'];

const PatientDetailPage = () => {
  const { id } = useParams();
  
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [template, setTemplate] = useState(null);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReadmitModal, setShowReadmitModal] = useState(false);
  const [readmitData, setReadmitData] = useState({ ward: '', bed: '', notes: '' });
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchPatient();
    fetchVitals();
    fetchTrends();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/patients/${id}`);
      if (response.data.success) {
        const patientData = response.data.data.patient;
        setPatient(patientData);
        
        // Fetch template for this patient
        try {
          let templateId = patientData.template;
          if (patientData.template === 'custom' && patientData.customTemplateId) {
             templateId = patientData.customTemplateId._id || patientData.customTemplateId;
          }
          const templateResponse = await api.get(`/vitals/templates/${templateId}`);
          if (templateResponse.data.success) {
            setTemplate(templateResponse.data.data.template);
            // Initialize form data
            const initialData = {};
            templateResponse.data.data.template.fields.forEach(field => {
              initialData[field.name] = '';
            });
            setFormData(initialData);
          }
        } catch (templateError) {
          console.error('Error fetching template:', templateError);
        }
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVitals = async () => {
    try {
      const response = await api.get(`/vitals/patient/${id}?limit=10`);
      if (response.data.success) {
        setVitals(response.data.data.vitals);
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await api.get(`/vitals/patient/${id}/trends?days=7`);
      if (response.data.success) {
        const data = response.data.data.vitals.map(v => ({
          date: new Date(v.recordedAt).toLocaleDateString(),
          ...v.vitals
        }));
        setTrendData(data.reverse());
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    
    try {
      if (!template || !template.fields) {
        toast.error('Template definition invalid or missing');
        return;
      }

      // Convert string values to numbers for non-boolean fields
      const processedVitals = {};
      template.fields.forEach(field => {
        const value = formData[field.name];
        
        // Skip empty fields
        if (value === '' || value === undefined || value === null) {
          return;
        }
        
        if (field.unit === 'boolean') {
          processedVitals[field.name] = value === true || value === 'true';
        } else {
          processedVitals[field.name] = parseFloat(value);
        }
      });

      const response = await api.post('/vitals', {
        patient: id,
        template: patient.template === 'custom' ? (patient.customTemplateId?._id || patient.customTemplateId) : patient.template,
        vitals: processedVitals
      });

      if (response.data.success) {
        // Reset form and refresh
        fetchVitals();
        fetchTrends();
        setShowVitalsForm(false);
        
        // Reset form data
        const initialData = {};
        template.fields.forEach(field => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
        
        toast.success('Vitals recorded successfully!');
      }
    } catch (error) {
      console.error('Error recording vitals:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to record vitals';
      toast.error(errorMsg);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/export/patient/${id}/data`);
      if (response.data.success) {
        await generatePDF(response.data.data.patient, response.data.data.vitals);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportCSV = async () => {
    try {
      await downloadCSV(id, patient?.name);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleDeleteVital = async (vitalId) => {
    if (!confirm('Delete this vital record? This action cannot be undone.')) return;

    try {
      await api.delete(`/vitals/${vitalId}`);
      toast.success('Vital record deleted successfully');  
      fetchVitals(); // Refresh the list
      fetchTrends();
    } catch (error) {
      console.error('Error deleting vital:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete vital record';
      toast.error(`${errorMsg}`);
    }
  };

  const handleDischarge = async () => {
    const notes = prompt('Enter discharge notes (optional):');
    if (notes === null) return; // User cancelled
    
    try {
      const response = await api.post(`/patients/${id}/discharge`, { notes });
      if (response.data.success) {
        toast.success('Patient discharged successfully');
        fetchPatient(); // Refresh patient data
      }
    } catch (error) {
      console.error('Error discharging patient:', error);
      const errorMsg = error.response?.data?.message || 'Failed to discharge patient';
      toast.error(errorMsg);
    }
  };

  const handleReadmit = () => {
    setReadmitData({ ward: patient.ward || '', bed: '', notes: '' });
    setShowReadmitModal(true);
  };

  const handleReadmitSubmit = async (e) => {
    e.preventDefault();
    if (!readmitData.ward) {
      toast.error('Please select a ward');
      return;
    }
    
    try {
      const response = await api.post(`/patients/${id}/readmit`, {
        ward: readmitData.ward,
        bed: readmitData.bed,
        notes: readmitData.notes
      });
      if (response.data.success) {
        toast.success('Patient readmitted successfully');
        setShowReadmitModal(false);
        fetchPatient(); // Refresh patient data
      }
    } catch (error) {
      console.error('Error readmitting patient:', error);
      const errorMsg = error.response?.data?.message || 'Failed to readmit patient';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="page-content">
          <div className="flex items-center justify-center py-20">
            <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
              Loading patient data...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="page-content">
          <div className="card empty-state py-16">
            <User size={48} style={{ color: 'var(--text-tertiary)' }} className="mb-4" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Patient not found
            </h3>
            <Link to="/patients" className="btn-primary mt-4">
              <ArrowLeft size={16} />
              Back to Patients
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const chartColors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ec4899', // pink
  ];

  return (
    <div className="page-container">
      <Navbar />

      <main className="page-content">
        {/* Back Link */}
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 mb-4 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'var(--brand-primary)' }}
        >
          <ArrowLeft size={16} />
          Back to Patients
        </Link>
        
        {/* Patient Info Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  {patient.name}
                </h1>
                {/* Status Badge */}
                <span
                  className="badge text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    background: patient.status === 'discharged' ? 'var(--warning-muted)' : 'var(--success-muted)',
                    color: patient.status === 'discharged' ? 'var(--warning)' : 'var(--success)'
                  }}
                >
                  {patient.status === 'discharged' ? 'Discharged' : 'Admitted'}
                </span>
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                MRN: {patient.mrn} • {patient.gender} • {new Date(patient.dob).toLocaleDateString()}
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Ward: {patient.ward} {patient.bed && `- Bed ${patient.bed}`}
                {patient.dischargedAt && ` • Discharged: ${new Date(patient.dischargedAt).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/patients/${id}/edit`} className="btn-secondary">
                <Edit2 size={16} />
                Edit
              </Link>
              <button onClick={() => setShowShareModal(true)} className="btn-secondary">
                <Share2 size={16} />
                Share
              </button>
              <button onClick={handleExportPDF} className="btn-secondary">
                <FileText size={16} />
                PDF
              </button>
              <button onClick={handleExportCSV} className="btn-secondary">
                <Table size={16} />
                CSV
              </button>
              {patient.status !== 'discharged' ? (
                <>
                  <button onClick={() => setShowVitalsForm(true)} className="btn-primary">
                    <Activity size={16} />
                    Record Vitals
                  </button>
                  <button 
                    onClick={handleDischarge} 
                    className="btn-secondary"
                    style={{ color: 'var(--warning)' }}
                  >
                    <LogOut size={16} />
                    Discharge
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleReadmit} 
                  className="btn-primary"
                >
                  <RefreshCw size={16} />
                  Readmit Patient
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="card mb-6">
            <h2
              className="section-title"
              style={{ color: 'var(--text-primary)' }}
            >
              7-Day Vitals Trend
            </h2>
            <div style={{ height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    stroke="var(--border-default)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    stroke="var(--border-default)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Legend />
                  {template && template.fields.filter(f => f.unit !== 'boolean').map((field, index) => (
                    <Line
                      key={field.name}
                      type="monotone"
                      dataKey={field.name}
                      stroke={chartColors[index % chartColors.length]}
                      name={field.label}
                      strokeWidth={2}
                      dot={{ fill: chartColors[index % chartColors.length], strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Vitals History */}
        <div className="card">
          <h2
            className="section-title"
            style={{ color: 'var(--text-primary)' }}
          >
            Vitals History
          </h2>
          {vitals.length === 0 ? (
            <div className="empty-state py-8">
              <Activity size={40} style={{ color: 'var(--text-tertiary)' }} className="mb-3" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No vitals recorded yet
              </p>
              <button onClick={() => setShowVitalsForm(true)} className="btn-primary mt-4">
                <Activity size={16} />
                Record First Vitals
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vitals.map((vital) => (
                <div
                  key={vital._id}
                  className="p-4 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm flex items-center gap-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Calendar size={14} />
                          {new Date(vital.recordedAt).toLocaleString()}
                        </span>
                        {vital.flagged && (
                          <span
                            className="badge text-xs"
                            style={{ background: 'var(--error-muted)', color: 'var(--error)' }}
                          >
                            Flagged
                          </span>
                        )}
                      </div>
                      {vital.recordedBy && (
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Recorded by: {vital.recordedBy.name} ({vital.recordedBy.role})
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteVital(vital._id)}
                      className="btn-icon"
                      style={{ color: 'var(--error)' }}
                      title="Delete this vital record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(vital.vitals).map(([key, value]) => {
                      const isFlagged = vital.flaggedFields?.some(f => f.field === key);
                      const field = template?.fields?.find(f => f.name === key);
                      
                      // Format value for display - handle objects like bloodPressure
                      const formatValue = (val) => {
                        if (val === null || val === undefined) return 'N/A';
                        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
                        if (typeof val === 'object') {
                          // Handle bloodPressure object
                          if (val.systolic !== undefined && val.diastolic !== undefined) {
                            return `${val.systolic}/${val.diastolic}`;
                          }
                          // Handle other objects - display as JSON
                          return JSON.stringify(val);
                        }
                        return val;
                      };
                      
                      return (
                        <div
                          key={key}
                          className="p-2 rounded"
                          style={{
                            background: isFlagged ? 'var(--error-muted)' : 'var(--bg-secondary)',
                            border: isFlagged ? '1px solid var(--error)' : '1px solid transparent'
                          }}
                        >
                          <p
                            className="text-xs mb-1"
                            style={{ color: isFlagged ? 'var(--error)' : 'var(--text-tertiary)' }}
                          >
                            {field?.label || key}
                          </p>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: isFlagged ? 'var(--error)' : 'var(--text-primary)' }}
                          >
                            {formatValue(value)}
                            {field?.unit && field.unit !== 'boolean' && typeof value !== 'object' && (
                              <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-tertiary)' }}>
                                {field.unit}
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admission History */}
        {patient.admissionHistory && patient.admissionHistory.length > 0 && (
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="section-title flex items-center gap-2 mb-0"
                style={{ color: 'var(--text-primary)' }}
              >
                <History size={20} />
                Admission History
              </h2>
              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/export/patient/${id}/history/csv`, '_blank')}
                className="btn-secondary text-sm"
              >
                <Table size={14} />
                Export CSV
              </button>
            </div>
            <div className="space-y-3">
              {patient.admissionHistory.map((admission, index) => {
                const admittedDate = new Date(admission.admittedAt);
                const dischargedDate = new Date(admission.dischargedAt);
                const lengthOfStay = Math.ceil((dischargedDate - admittedDate) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        <span>Admitted: {admittedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <LogOut size={14} />
                        <span>Discharged: {dischargedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <Clock size={14} />
                        <span>{lengthOfStay} day{lengthOfStay !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {admission.dischargeNotes && (
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-medium">Notes:</span> {admission.dischargeNotes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Vitals Entry Modal */}
      {showVitalsForm && template && (
        <Modal 
          isOpen={showVitalsForm} 
          onClose={() => setShowVitalsForm(false)}
          title={`Record Vitals (${template.name} Template)`}
          size="lg"
        >
          <form onSubmit={handleSubmitVitals}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {template.fields.map(field => (
                <div key={field.name}>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {field.label}
                    {field.required && <span style={{ color: 'var(--error)' }}>*</span>}
                  </label>
                  {field.unit === 'boolean' ? (
                    <select
                      name={field.name}
                      className="input-field"
                      value={formData[field.name]}
                      onChange={handleInputChange}
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      name={field.name}
                      step="0.1"
                      min={field.min}
                      max={field.max}
                      className="input-field"
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.normal ? `Normal: ${field.normal.min}-${field.normal.max}` : `Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {field.unit !== 'boolean' ? field.unit : ''}
                    {field.normal && ` (Normal: ${field.normal.min}-${field.normal.max})`}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                <Activity size={16} />
                Save Vitals
              </button>
              <button 
                type="button" 
                onClick={() => setShowVitalsForm(false)} 
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share Modal */}
      {patient && (
        <SharePatientModal
          patient={patient}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Readmit Modal */}
      {showReadmitModal && (
        <Modal
          isOpen={showReadmitModal}
          onClose={() => setShowReadmitModal(false)}
          title="Readmit Patient"
        >
          <form onSubmit={handleReadmitSubmit}>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Ward <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <select
                  className="input-field"
                  value={readmitData.ward}
                  onChange={(e) => setReadmitData({ ...readmitData, ward: e.target.value })}
                  required
                >
                  <option value="">Select Ward</option>
                  {WARDS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Bed (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={readmitData.bed}
                  onChange={(e) => setReadmitData({ ...readmitData, bed: e.target.value })}
                  placeholder="e.g., 12A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Readmission Notes (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={readmitData.notes}
                  onChange={(e) => setReadmitData({ ...readmitData, notes: e.target.value })}
                  placeholder="Reason for readmission..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                <RefreshCw size={16} />
                Readmit Patient
              </button>
              <button
                type="button"
                onClick={() => setShowReadmitModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PatientDetailPage;
