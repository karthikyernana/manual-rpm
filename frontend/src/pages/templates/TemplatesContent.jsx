import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Clipboard } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from '../../utils/toast';
import { validators, sanitizeInput } from '../../utils/validation';

const TemplatesContent = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
    isPublic: false,
    fields: []
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      if (response.data.success) {
        setTemplates(response.data.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          name: '',
          label: '',
          unit: '',
          min: '',
          max: '',
          normal: { min: '', max: '' },
          required: true
        }
      ]
    });
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...formData.fields];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newFields[index][parent][child] = value;
    } else {
      newFields[index][field] = value;
    }
    setFormData({ ...formData, fields: newFields });

    const newFieldErrors = { ...fieldErrors };
    const fieldKey = `field-${index}-${field}`;
    
    if (field === 'name') {
      const error = validators.fieldName(value);
      if (error) {
        newFieldErrors[fieldKey] = error;
      } else {
        delete newFieldErrors[fieldKey];
      }
    } else if (field === 'label') {
      const error = validators.required(value);
      if (error) {
        newFieldErrors[fieldKey] = error;
      } else {
        delete newFieldErrors[fieldKey];
      }
    } else if (field === 'unit') {
      const error = validators.unit(value);
      if (error) {
        newFieldErrors[fieldKey] = error;
      } else {
        delete newFieldErrors[fieldKey];
      }
    }
    
    setFieldErrors(newFieldErrors);
  };

  const handleRemoveField = (index) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Template name is required';
    }
    if (formData.fields.length === 0) {
      errors.fields = 'At least one field is required';
    }
    
    formData.fields.forEach((field, index) => {
      if (!field.name || !field.name.trim()) {
        errors[`field-${index}-name`] = 'Field name is required';
      } else {
        const nameError = validators.fieldName(field.name);
        if (nameError) errors[`field-${index}-name`] = nameError;
      }
      
      if (!field.label || !field.label.trim()) {
        errors[`field-${index}-label`] = 'Field label is required';
      }
      
      if (!field.unit || !field.unit.trim()) {
        errors[`field-${index}-unit`] = 'Unit is required';
      } else {
        const unitError = validators.unit(field.unit);
        if (unitError) errors[`field-${index}-unit`] = unitError;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFieldErrors(errors);
      toast.error('Please fix validation errors before submitting');
      return;
    }
    
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      description: sanitizeInput(formData.description),
      fields: formData.fields.map(field => ({
        ...field,
        name: sanitizeInput(field.name),
        label: sanitizeInput(field.label),
        unit: sanitizeInput(field.unit),
      }))
    };
    
    try {
      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate._id}`, sanitizedData);
        toast.success('Template updated successfully!');
      } else {
        await api.post('/templates', sanitizedData);
        toast.success('Template created successfully!');
      }
      fetchTemplates();
      handleCloseModal();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save template';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      isPublic: template.isPublic,
      fields: template.fields
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    
    try {
      await api.delete(`/templates/${id}`);
      toast.success('Template deleted successfully!');
      fetchTemplates();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete template';
      toast.error(errorMsg);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormErrors({});
    setFieldErrors({});
    setFormData({
      name: '',
      description: '',
      category: 'custom',
      isPublic: false,
      fields: []
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: { bg: 'var(--info-muted)', text: 'var(--info)' },
      cardiac: { bg: 'var(--error-muted)', text: 'var(--error)' },
      diabetic: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
      respiratory: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
      custom: { bg: 'var(--brand-muted)', text: 'var(--brand-primary)' }
    };
    return colors[category] || colors.custom;
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Vitals Templates
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Create custom templates for different conditions
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} />
          <span>New Template</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              className="card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="skeleton w-32 h-5 rounded mb-2" />
              <div className="skeleton w-48 h-4 rounded mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="skeleton w-16 h-5 rounded-full" />
                <div className="skeleton w-16 h-5 rounded-full" />
              </div>
              <div className="skeleton w-full h-8 rounded" />
            </motion.div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="card empty-state py-16">
          <Clipboard size={48} style={{ color: 'var(--text-tertiary)' }} className="mb-4" />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            No templates yet
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Create a custom template to get started
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} />
            New Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => {
            const categoryColor = getCategoryColor(template.category);
            return (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="card-interactive group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {template.name}
                    </h3>
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {template.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(template)}
                      className="btn-icon"
                      title="Edit template"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="btn-icon"
                      style={{ color: 'var(--error)' }}
                      title="Delete template"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="badge text-xs"
                    style={{
                      background: template.isPublic ? 'var(--info-muted)' : 'var(--bg-tertiary)',
                      color: template.isPublic ? 'var(--info)' : 'var(--text-secondary)'
                    }}
                  >
                    {template.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span
                    className="badge text-xs capitalize"
                    style={{ background: categoryColor.bg, color: categoryColor.text }}
                  >
                    {template.category}
                  </span>
                </div>

                <div
                  className="pt-3"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <p
                    className="text-xs mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {template.fields.length} fields
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.slice(0, 4).map((field, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {field.label}
                      </span>
                    ))}
                    {template.fields.length > 4 && (
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        +{template.fields.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Template Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Template Name*
              </label>
              <input
                type="text"
                required
                className={`input-field ${formErrors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) {
                    const { name, ...rest } = formErrors;
                    setFormErrors(rest);
                  }
                }}
                placeholder="e.g., Hypertension Monitoring"
              />
              {formErrors.name && (
                <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                  {formErrors.name}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Category*
              </label>
              <select
                required
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="cardiac">Cardiac</option>
                <option value="diabetic">Diabetic</option>
                <option value="respiratory">Respiratory</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Description
            </label>
            <textarea
              className="input-field"
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this template"
            />
          </div>

          {formErrors.fields && (
            <div
              className="p-3 rounded-lg"
              style={{ background: 'var(--error-muted)', border: '1px solid var(--error)' }}
            >
              <p className="text-sm" style={{ color: 'var(--error)' }}>
                {formErrors.fields}
              </p>
            </div>
          )}

          <div
            className="pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3
                className="font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Fields
              </h3>
              <button
                type="button"
                onClick={handleAddField}
                className="btn-secondary text-sm"
              >
                <Plus size={16} />
                <span>Add Field</span>
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {formData.fields.map((field, index) => (
                <motion.div
                  key={index}
                  className="card relative"
                  style={{ background: 'var(--bg-tertiary)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="absolute top-2 right-2 btn-icon"
                    style={{ color: 'var(--error)' }}
                  >
                    <X size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-8">
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Field Name*
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field text-sm"
                        value={field.name}
                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        placeholder="e.g., bloodPressure"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Label*
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field text-sm"
                        value={field.label}
                        onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                        placeholder="e.g., Blood Pressure"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Unit*
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field text-sm"
                        value={field.unit}
                        onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                        placeholder="e.g., mmHg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Normal Min
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field text-sm"
                          value={field.normal.min}
                          onChange={(e) => handleFieldChange(index, 'normal.min', e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Normal Max
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field text-sm"
                          value={field.normal.max}
                          onChange={(e) => handleFieldChange(index, 'normal.max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {formData.fields.length === 0 && (
                <p
                  className="text-center py-8"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  No fields added yet. Click "Add Field" to start.
                </p>
              )}
            </div>
          </div>

          <div
            className="flex gap-3 pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button type="submit" className="btn-primary flex-1">
              <Save size={18} />
              <span>{editingTemplate ? 'Update Template' : 'Create Template'}</span>
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TemplatesContent;
