import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const fetchPatients = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (ward) params.ward = ward;

      const response = await api.get('/patients', { params });
      
      if (response.data.success) {
        setPatients(response.data.data.patients);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, ward]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;

    try {
      await api.delete(`/patients/${id}`);
      fetchPatients(pagination.page);
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <Link to="/patients/new" className="btn-primary flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Patient</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Name or MRN..."
                className="input-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ward
              </label>
              <select
                className="input-field"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              >
                <option value="">All Wards</option>
                <option value="ICU-1">ICU-1</option>
                <option value="ICU-2">ICU-2</option>
                <option value="General-1">General-1</option>
                <option value="Cardiac">Cardiac</option>
                <option value="Pediatric">Pediatric</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No patients found</p>
            <Link to="/patients/new" className="btn-primary mt-4 inline-block">
              Add First Patient
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient, index) => (
              <div 
                key={patient._id} 
                className="card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-500">MRN: {patient.mrn}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    patient.template === 'cardiac' ? 'bg-red-100 text-red-800' :
                    patient.template === 'diabetic' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {patient.template}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p className="flex items-center">
                    <Stethoscope size={14} className="mr-1" />
                    Ward: {patient.ward} {patient.bed && `- Bed ${patient.bed}`}
                  </p>
                  <p>{patient.gender} • {new Date(patient.dob).toLocaleDateString()}</p>
                  {patient.primaryNurse && (
                    <p>Nurse: {patient.primaryNurse.name}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/patients/${patient._id}`}
                    className="flex-1 text-center px-3 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to={`/patients/${patient._id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(patient._id)}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => fetchPatients(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchPatients(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientsPage;
