import { useState } from 'react';
import api from '../services/api';

const SharePatientModal = ({ patient, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);

  const generateShareLink = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/share/create/${patient._id}`);
      
      if (response.data.success) {
        setShareData(response.data.data);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareData.shareUrl);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Share Patient Data</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {!shareData ? (
          <div>
            <p className="text-gray-600 mb-4">
              Generate a secure share link for <strong>{patient.name}</strong>. 
              The link will expire in 7 days.
            </p>
            <button
              onClick={generateShareLink}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Share URL:</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  className="input-field flex-1"
                />
                <button onClick={copyToClipboard} className="btn-secondary">
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Expires: {new Date(shareData.expiresAt).toLocaleString()}
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code:</label>
              <div className="flex justify-center">
                <img src={shareData.qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Scan with a mobile device to access patient data
              </p>
            </div>

            <button onClick={onClose} className="btn-secondary w-full mt-4">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePatientModal;
