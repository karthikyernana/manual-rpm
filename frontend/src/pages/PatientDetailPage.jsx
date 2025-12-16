import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import SharePatientModal from '../components/SharePatientModal';
import { generatePDF, downloadCSV } from '../utils/export';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
        
        alert('✅ Vitals recorded successfully!');
      }
    } catch (error) {
      console.error('Error recording vitals:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to record vitals';
      alert(`❌ ${errorMsg}`);
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
      alert('Failed to export PDF');
    }
  };

  const handleExportCSV = async () => {
    try {
      await downloadCSV(id);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center">Patient not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">Manual-RPM</Link>
              <Link to="/patients" className="text-gray-600 hover:text-gray-900">Patients</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/patients')} className="text-primary-600 mb-4">← Back to Patients</button>
        
        {/* Patient Info Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600 mt-1">MRN: {patient.mrn} • {patient.gender} • {new Date(patient.dob).toLocaleDateString()}</p>
              <p className="text-gray-600">Ward: {patient.ward} {patient.bed && `- Bed ${patient.bed}`}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/patients/${id}/edit`} className="btn-secondary">Edit</Link>
              <button onClick={() => setShowShareModal(true)} className="btn-secondary">📤 Share</button>
              <button onClick={handleExportPDF} className="btn-secondary">📄 PDF</button>
              <button onClick={handleExportCSV} className="btn-secondary">📊 CSV</button>
              <button onClick={() => setShowVitalsForm(!showVitalsForm)} className="btn-primary">
                {showVitalsForm ? 'Cancel' : 'Record Vitals'}
              </button>
            </div>
          </div>
        </div>

        {/* Vitals Entry Form */}
        {showVitalsForm && template && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Record Vitals ({template.name} Template)</h2>
            <form onSubmit={handleSubmitVitals}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {template.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
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
                        placeholder={field.normal ? `Normal: ${field.normal.min}-${field.normal.max}` : ''}
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">{field.unit}</p>
                  </div>
                ))}
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">Save Vitals</button>
                <button type="button" onClick={() => setShowVitalsForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}


        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">7-Day Vitals Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {template && template.fields.filter(f => f.unit !== 'boolean').map((field, index) => (
                  <Line
                    key={field.name}
                    type="monotone"
                    dataKey={field.name}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    name={field.label}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Vitals History */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Vitals History</h2>
          {vitals.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No vitals recorded yet</p>
          ) : (
            <div className="space-y-4">
              {vitals.map((vital) => (
                <div key={vital._id} className={`border rounded-lg p-4 ${vital.flagged ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(vital.recordedAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Recorded by: {vital.recordedBy?.name}
                      </p>
                    </div>
                    {vital.flagged && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                        ⚠️ Flagged
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(vital.vitals).map(([key, value]) => (
                      <div key={key} className={vital.flaggedFields?.some(f => f.field === key) ? 'text-red-700 font-semibold' : ''}>
                        <span className="text-gray-600">{key}: </span>
                        <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
