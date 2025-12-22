import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, MapPin, FileText, AlertCircle, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from '../utils/toast';

// Built-in templates that are always available
const BUILTIN_TEMPLATES = [
  { value: 'general', label: 'General' },
  { value: 'cardiac', label: 'Cardiac' },
  { value: 'diabetic', label: 'Diabetic' }
];

const PatientFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    mrn: '',
    name: '',
    dob: '',
    gender: 'male',
    ward: '',
    bed: '',
    consent: false,
    phone: '',
    template: 'general',
    customTemplateId: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [wards, setWards] = useState([]);

  // Fetch custom templates and wards on mount
  useEffect(() => {
    fetchCustomTemplates();
    fetchWards();
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchPatient();
    }
  }, [id]);

  const fetchCustomTemplates = async () => {
    try {
      const response = await api.get('/templates');
      if (response.data.success) {
        setCustomTemplates(response.data.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await api.get('/settings/wards');
      if (response.data.success) {
        // Handle wards as direct array or nested in wards property
        const wardsData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data.wards || [];
        setWards(wardsData.filter(w => w.isActive !== false));
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
      // Fallback to default wards if API fails
      setWards([
        { name: 'ICU-1' },
        { name: 'ICU-2' },
        { name: 'General-1' },
        { name: 'Cardiac' },
        { name: 'Pediatric' }
      ]);
    }
  };

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/patients/${id}`);
      if (response.data.success) {
        const patient = response.data.data.patient;
        setFormData({
          mrn: patient.mrn,
          name: patient.name,
          dob: new Date(patient.dob).toISOString().split('T')[0],
          gender: patient.gender,
          ward: patient.ward,
          bed: patient.bed || '',
          consent: patient.consent,
          phone: patient.phone || '',
          template: patient.template,
          emergencyContact: patient.emergencyContact || {
            name: '',
            phone: '',
            relationship: ''
          },
          notes: patient.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError('Failed to load patient data');
      toast.error('Failed to load patient data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/patients/${id}`, formData);
        toast.success('Patient updated successfully!');
      } else {
        await api.post('/patients', formData);
        toast.success('Patient created successfully!');
      }
      navigate('/patients');
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} patient`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="page-content">
        {/* Back Link */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--brand-primary)' }}
          >
            <ArrowLeft size={16} />
            Back to Patients
          </Link>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-elevated">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2.5 rounded-lg"
                style={{ background: 'var(--brand-muted)' }}
              >
                <User size={24} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {isEdit ? 'Edit Patient' : 'Add New Patient'}
              </h1>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="mb-6 p-4 rounded-lg flex items-center gap-3"
                style={{
                  background: 'var(--error-muted)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={20} style={{ color: 'var(--error)' }} />
                <p style={{ color: 'var(--error)' }}>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    MRN * {isEdit && <span style={{ color: 'var(--text-tertiary)' }}>(cannot be changed)</span>}
                  </label>
                  <input
                    type="text"
                    name="mrn"
                    required
                    disabled={isEdit}
                    className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.mrn}
                    onChange={handleChange}
                    placeholder="Medical Record Number"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Patient's full name"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    required
                    className="input-field"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    className="input-field"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Ward *
                  </label>
                  <select
                    name="ward"
                    required
                    className="input-field"
                    value={formData.ward}
                    onChange={handleChange}
                  >
                    <option value="">Select Ward</option>
                    {wards.map((ward) => (
                      <option key={ward.name || ward._id} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Bed Number
                  </label>
                  <input
                    type="text"
                    name="bed"
                    className="input-field"
                    value={formData.bed}
                    onChange={handleChange}
                    placeholder="e.g., 12A"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input-field"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Template *
                  </label>
                  <select
                    name="template"
                    required
                    className="input-field"
                    value={formData.template}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Check if it's a custom template (starts with 'custom:')
                      if (value.startsWith('custom:')) {
                        setFormData({
                          ...formData,
                          template: 'custom',
                          customTemplateId: value.replace('custom:', '')
                        });
                      } else {
                        setFormData({
                          ...formData,
                          template: value,
                          customTemplateId: ''
                        });
                      }
                      setError('');
                    }}
                  >
                    <optgroup label="Built-in Templates">
                      {BUILTIN_TEMPLATES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                    {customTemplates.length > 0 && (
                      <optgroup label="Custom Templates">
                        {customTemplates.map((t) => (
                          <option key={t._id} value={`custom:${t._id}`}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div
                className="p-4 rounded-lg"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="w-5 h-5 rounded"
                    style={{
                      accentColor: 'var(--brand-primary)'
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Patient has provided consent for monitoring
                  </span>
                </label>
              </div>

              {/* Emergency Contact */}
              <div
                className="pt-6"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Phone size={18} style={{ color: 'var(--brand-primary)' }} />
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Emergency Contact
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      className="input-field"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      placeholder="Contact name"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      className="input-field"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      placeholder="Contact phone"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      className="input-field"
                      placeholder="e.g., Spouse, Parent"
                      value={formData.emergencyContact.relationship}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div
                className="pt-6"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} style={{ color: 'var(--brand-primary)' }} />
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Notes
                  </h3>
                </div>
                <textarea
                  name="notes"
                  rows="3"
                  className="input-field"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about the patient..."
                />
              </div>

              {/* Buttons */}
              <div
                className="flex gap-4 pt-6"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save size={18} />
                      {isEdit ? 'Update Patient' : 'Create Patient'}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/patients')}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PatientFormPage;
