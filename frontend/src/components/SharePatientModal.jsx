import { useState } from 'react';
import { Copy, X, QrCode, ExternalLink } from 'lucide-react';
import api from '../services/api';
import toast from '../utils/toast';

const SharePatientModal = ({ patient, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Don't render if not open
  if (!isOpen) return null;

  const generateShareLink = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/share/create/${patient._id}`);
      
      if (response.data.success) {
        setShareData(response.data.data);
        toast.success('Share link generated successfully!');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      const errorMsg = error.response?.data?.message || 'Failed to generate share link';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {/* Header */}
        <div 
          className="flex justify-between items-center p-6 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <h2 
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <ExternalLink size={24} style={{ color: 'var(--brand-primary)' }} />
            Share Patient Data
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!shareData ? (
            <div>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Generate a secure share link for <strong style={{ color: 'var(--text-primary)' }}>{patient.name}</strong>. 
                The link will expire in 7 days and provides read-only access to patient vitals.
              </p>
              <button
                onClick={generateShareLink}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ExternalLink size={18} />
                    Generate Share Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Share URL Section */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Share URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.shareUrl}
                    readOnly
                    className="input-field flex-1 text-sm"
                    style={{ 
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)'
                    }}
                  />
                  <button 
                    onClick={copyToClipboard} 
                    className={`btn-secondary flex items-center gap-2 transition-all ${
                      copied ? 'bg-green-100 text-green-700' : ''
                    }`}
                  >
                    <Copy size={16} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p 
                  className="text-xs mt-2 flex items-center gap-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  ⏰ Expires: {new Date(shareData.expiresAt).toLocaleString()}
                </p>
              </div>

              {/* QR Code Section */}
              <div 
                className="border-t pt-6"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <label 
                  className="block text-sm font-medium mb-3 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <QrCode size={18} />
                  QR Code:
                </label>
                <div 
                  className="flex justify-center p-4 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <img 
                    src={shareData.qrCode} 
                    alt="QR Code" 
                    className="w-56 h-56 rounded-lg shadow-md"
                  />
                </div>
                <p 
                  className="text-xs text-center mt-3"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  📱 Scan with a mobile device to access patient data
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => window.open(shareData.shareUrl, '_blank')} 
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  Open Link
                </button>
                <button 
                  onClick={onClose} 
                  className="btn-primary flex-1"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharePatientModal;
