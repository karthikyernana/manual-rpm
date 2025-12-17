import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Share2, FileText, Table, Activity, Trash2, Calendar, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import SharePatientModal from '../components/SharePatientModal';
import { generatePDF, downloadCSV } from '../utils/export';
import toast from '../utils/toast';
import api from '../services/api';

const PatientDetailPage = () => {
  const { id } = useParams();
  
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [template, setTemplate] = useState(null);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
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
        const templateResponse = await api.get(`/vitals/templates/${patientData.template}`);
        if (templateResponse.data.success) {
          setTemplate(templateResponse.data.data.template);
          // Initialize form data
          const initialData = {};
          templateResponse.data.data.template.fields.forEach(field => {
            initialData[field.name] = '';
          });
          setFormData(initialData);
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
        template: patient.template,
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
              <h1
                className="text-2xl font-bold"
                style={{ color: 'var(--brand-primary)' }}
              >
                {patient.name}
              </h1>
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
              <button onClick={() => setShowVitalsForm(true)} className="btn-primary">
                <Activity size={16} />
                Record Vitals
              </button>
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
            <div style={{ height: '300px' }}>
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
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                            {field?.unit && field.unit !== 'boolean' && (
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
      {showShareModal && (
        <SharePatientModal
          patient={patient}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default PatientDetailPage;
