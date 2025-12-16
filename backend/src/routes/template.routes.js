const express = require('express');
const { body, validationResult } = require('express-validator');
const VitalsTemplate = require('../models/VitalsTemplate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/v1/templates
// @desc    Get all templates (public + user's private)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    };

    const templates = await VitalsTemplate.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
});

// @route   POST /api/v1/templates
// @desc    Create new template
// @access  Private
router.post(
  '/',
  protect,
  [
    body('name').notEmpty().withMessage('Template name is required'),
    body('fields').isArray({ min: 1 }).withMessage('At least one field is required'),
    body('fields.*.name').notEmpty().withMessage('Field name is required'),
    body('fields.*.label').notEmpty().withMessage('Field label is required'),
    body('fields.*.unit').notEmpty().withMessage('Field unit is required')
  ],
  validate,
  async (req, res) => {
    try {
      const { name, description, fields, isPublic, category } = req.body;

      // Check if template name already exists
      const existing = await VitalsTemplate.findOne({ name });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Template with this name already exists'
        });
      }

      const template = await VitalsTemplate.create({
        name,
        description,
        fields,
        isPublic: req.user.role === 'admin' ? isPublic : false, // Only admins can create public templates
        category: category || 'custom',
        createdBy: req.user._id
      });

      await template.populate('createdBy', 'name role');

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: { template }
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating template',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/v1/templates/:id
// @desc    Update template
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const template = await VitalsTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user owns the template or is admin
    if (template.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this template'
      });
    }

    const { name, description, fields, isPublic, category } = req.body;

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (fields) template.fields = fields;
    if (category) template.category = category;
    if (isPublic !== undefined && req.user.role === 'admin') {
      template.isPublic = isPublic;
    }

    await template.save();
    await template.populate('createdBy', 'name role');

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: { template }
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
});

// @route   DELETE /api/v1/templates/:id
// @desc    Delete template
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const template = await VitalsTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user owns the template or is admin
    if (template.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this template'
      });
    }

    await template.deleteOne();

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
});

module.exports = router;
