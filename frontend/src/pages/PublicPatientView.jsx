import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const PublicPatientView = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedData();
  }, [token]);

  const fetchSharedData = async () => {
    try {
      const response = await api.get(`/share/${token}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl">Loading patient data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Access Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const { patient, latestVitals, vitalsHistory, expiresAt } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Manual-RPM - Shared Patient View</h1>
          <p className="text-sm mt-1">Read-only access • Expires: {new Date(expiresAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Patient Info */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">MRN</p>
              <p className="font-medium">{patient.mrn}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{new Date(patient.dob).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ward</p>
              <p className="font-medium">{patient.ward} {patient.bed && `- Bed ${patient.bed}`}</p>
            </div>
          </div>
        </div>

        {/* Latest Vitals */}
        {latestVitals && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Latest Vitals</h2>
            <p className="text-sm text-gray-600 mb-3">
              Recorded: {new Date(latestVitals.recordedAt).toLocaleString()}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(latestVitals.vitals).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">{key}</p>
                  <p className="font-semibold text-lg">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vitals History */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Vitals History</h2>
          {vitalsHistory.length === 0 ? (
            <p className="text-gray-600">No vitals recorded</p>
          ) : (
            <div className="space-y-3">
              {vitalsHistory.map((vital) => (
                <div key={vital._id} className={`border rounded p-3 ${vital.flagged ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{new Date(vital.recordedAt).toLocaleString()}</span>
                    {vital.flagged && <span className="text-xs text-red-600 font-semibold">⚠ Flagged</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(vital.vitals).map(([key, value]) => (
                      <div key={key}>
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
      </div>
    </div>
  );
};

export default PublicPatientView;
