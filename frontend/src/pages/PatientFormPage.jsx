import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

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
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchPatient();
    }
  }, [id]);

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
      } else {
        await api.post('/patients', formData);
      }
      navigate('/patients');
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} patient`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/patients')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Patients
          </button>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRN * {isEdit && '(cannot be changed)'}
                </label>
                <input
                  type="text"
                  name="mrn"
                  required
                  disabled={isEdit}
                  className="input-field disabled:bg-gray-100"
                  value={formData.mrn}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <option value="ICU-1">ICU-1</option>
                  <option value="ICU-2">ICU-2</option>
                  <option value="General-1">General-1</option>
                  <option value="Cardiac">Cardiac</option>
                  <option value="Pediatric">Pediatric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Number
                </label>
                <input
                  type="text"
                  name="bed"
                  className="input-field"
                  value={formData.bed}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template *
                </label>
                <select
                  name="template"
                  required
                  className="input-field"
                  value={formData.template}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="cardiac">Cardiac</option>
                  <option value="diabetic">Diabetic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Patient has provided consent for monitoring
                </span>
              </label>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    className="input-field"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    className="input-field"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows="3"
                className="input-field"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Patient' : 'Create Patient'}
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
      </div>
    </div>
  );
};

export default PatientFormPage;
