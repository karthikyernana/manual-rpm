import { useState, useEffect, memo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  Filter,
  User,
  MapPin,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from '../utils/toast';

// Helper functions outside component
const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getTemplateColor = (template) => {
  const colors = {
    cardiac: { bg: 'var(--error-muted)', text: 'var(--error)' },
    diabetic: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
    general: { bg: 'var(--info-muted)', text: 'var(--info)' }
  };
  return colors[template] || colors.general;
};

// Memoized PatientCard component - prevents re-render on parent state changes
const PatientCard = memo(({ patient, index, isMenuOpen, onMenuToggle, onDelete }) => {
  const templateColor = getTemplateColor(patient.template);
  
  // Get display name for template
  const getTemplateName = () => {
    if (patient.template === 'custom' && patient.customTemplateId) {
      return patient.customTemplateId.name || 'Custom';
    }
    return patient.template;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card-interactive relative group"
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
            style={{
              background: templateColor.bg,
              color: templateColor.text
            }}
          >
            {getInitials(patient.name)}
          </div>
          <div>
            <h3
              className="font-semibold text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              {patient.name}
            </h3>
            <p
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              MRN: {patient.mrn}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => onMenuToggle(patient._id)}
            className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={16} />
          </button>

          {isMenuOpen && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => onMenuToggle(null)}
            />
          )}

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                key="patient-menu"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1 w-36 rounded-lg py-1 z-20"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <Link
                    to={`/patients/${patient._id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  <Link
                    to={`/patients/${patient._id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(patient._id, patient.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--error-muted)] transition-colors"
                    style={{ color: 'var(--error)' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="badge"
          style={{
            background: templateColor.bg,
            color: templateColor.text
          }}
        >
          {getTemplateName()}
        </span>
        {!patient.active && (
          <span
            className="badge"
            style={{
              background: 'var(--warning-muted)',
              color: 'var(--warning)'
            }}
          >
            Discharged
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <MapPin size={14} />
          <span>{patient.ward}{patient.bed && ` - Bed ${patient.bed}`}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <User size={14} />
          <span className="capitalize">{patient.gender}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Calendar size={14} />
          <span>{new Date(patient.dob).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Quick View Button */}
      <Link
        to={`/patients/${patient._id}`}
        className="mt-4 btn-secondary w-full text-sm"
      >
        View Details
      </Link>
    </motion.div>
  );
});

PatientCard.displayName = 'PatientCard';

const PatientsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ward, setWard] = useState(searchParams.get('ward') || '');
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'discharged'
  const [wards, setWards] = useState([]);
  
  // Sync state when URL params change (e.g. from Navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearch(urlSearch);
  }, [searchParams]);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const response = await api.get('/settings/wards');
      if (response.data.success) {
        setWards(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
      // Fallback to empty array if endpoint not available
      setWards([]);
    }
  };

  const fetchPatients = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (ward) params.ward = ward;
      
      // Status filter
      if (statusFilter === 'active') {
        params.active = true;
      } else if (statusFilter === 'discharged') {
        params.active = false;
      }
      // 'all' = don't send active param

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
  }, [search, ward, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPatients(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchPatients]);

  const handleDelete = useCallback(async (id, name) => {
    if (!window.confirm(`Delete patient "${name}"? This action cannot be undone.`)) return;

    // Close the menu first
    setActiveMenu(null);

    try {
      await api.delete(`/patients/${id}`);
      toast.success(`Patient "${name}" deleted successfully`);
      fetchPatients(pagination.page);
    } catch (error) {
      console.error('Error deleting patient:', error);
      if (error.response?.status === 403) {
        toast.error('You need Admin or Doctor role to delete patients');
      } else {
        const message = error.response?.data?.message || 'Failed to delete patient';
        toast.error(message);
      }
    }
  }, [fetchPatients, pagination.page]);

  const handleMenuToggle = useCallback((patientId) => {
    setActiveMenu(prev => prev === patientId ? null : patientId);
  }, []);

  return (
    <div className="page-container">
      <Navbar />

      <main className="page-content">
        {/* Header Actions */}
        <motion.div
          className="flex justify-end mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/patients/new" className="btn-primary">
            <Plus size={18} />
            <span>Add Patient</span>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Search by name or MRN..."
                className="input-field pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchParams(prev => {
                    prev.set('search', e.target.value);
                    return prev;
                  });
                }}
              />
            </div>

            {/* Ward Filter */}
            <div className="relative w-full md:w-48">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <select
                className="input-field pl-10 appearance-none cursor-pointer"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              >
                <option value="">All Wards</option>
                {wards.map((w) => (
                  <option key={w.name} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative w-full md:w-40">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <select
                className="input-field pl-10 appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="active">Admitted</option>
                <option value="discharged">Discharged</option>
                <option value="all">All Patients</option>
              </select>
            </div>

            {/* View Toggle */}
            <div
              className="flex rounded-lg p-1"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--bg-elevated)]'
                    : ''
                }`}
                style={{
                  color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)'
                }}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--bg-elevated)]'
                    : ''
                }`}
                style={{
                  color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)'
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Patients Grid/List */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" className="contents">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    className="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="skeleton w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <div className="skeleton w-24 h-4 rounded mb-2" />
                        <div className="skeleton w-16 h-3 rounded" />
                      </div>
                    </div>
                    <div className="skeleton w-16 h-5 rounded-full mb-4" />
                    <div className="space-y-2">
                      <div className="skeleton w-full h-4 rounded" />
                      <div className="skeleton w-3/4 h-4 rounded" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : patients.length === 0 ? (
              <motion.div
                key="empty"
                className="col-span-full card empty-state py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <User size={48} style={{ color: 'var(--text-tertiary)' }} className="mb-4" />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No patients found
                </h3>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {search || ward ? 'Try adjusting your filters' : 'Get started by adding your first patient'}
                </p>
                <Link to="/patients/new" className="btn-primary">
                  <Plus size={18} />
                  Add Patient
                </Link>
              </motion.div>
            ) : (
              <motion.div key="patients" className="contents">
                {patients.map((patient, index) => (
                  <PatientCard 
                    key={patient._id} 
                    patient={patient} 
                    index={index}
                    isMenuOpen={activeMenu === patient._id}
                    onMenuToggle={handleMenuToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => fetchPatients(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            
            <span
              className="px-4 py-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => fetchPatients(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PatientsPage;
