import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from '../../utils/toast';
import { validators, sanitizeInput } from '../../utils/validation';

// This is the content version without Navbar - for use in Settings
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

    // Validate field in real-time
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
    
    // Validate form
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Template name is required';
    }
    if (formData.fields.length === 0) {
      errors.fields = 'At least one field is required';
    }
    
    // Validate each field
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
    
    // Sanitize inputs
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vitals Templates</h2>
          <p className="text-gray-600 mt-1">Create custom templates for different conditions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>New Template</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template._id} className="card hover:shadow-lg transition-all duration-200 hover-lift">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isPublic ? 'Public' : 'Private'}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(template)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                    title="Edit template"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Delete template"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-gray-500 mb-2">{template.fields.length} fields</p>
                <div className="flex flex-wrap gap-1">
                  {template.fields.slice(0, 5).map((field, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {field.label}
                    </span>
                  ))}
                  {template.fields.length > 5 && (
                    <span className="text-xs text-gray-500">+{template.fields.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name*
              </label>
              <input
                type="text"
                required
                className={`input-field ${formErrors.name ? 'border-red-500' : ''}`}
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
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{formErrors.fields}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Fields</h3>
              <button
                type="button"
                onClick={handleAddField}
                className="btn-secondary text-sm flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add Field</span>
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.fields.map((field, index) => (
                <div key={index} className="card bg-gray-50 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <X size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Field Name*</label>
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">Label*</label>
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unit*</label>
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">Normal Min</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field text-sm"
                          value={field.normal.min}
                          onChange={(e) => handleFieldChange(index, 'normal.min', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Normal Max</label>
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
                </div>
              ))}
              {formData.fields.length === 0 && (
                <p className="text-center text-gray-500 py-8">No fields added yet. Click "Add Field" to start.</p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 pt-4 border-t">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center space-x-2">
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
