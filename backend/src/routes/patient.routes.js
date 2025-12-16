const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

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

// @route   POST /api/v1/patients
// @desc    Create new patient
// @access  Private
router.post(
  '/',
  [
    body('mrn').notEmpty().withMessage('MRN is required'),
    body('name').notEmpty().withMessage('Patient name is required'),
    body('dob').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('ward').notEmpty().withMessage('Ward is required'),
    body('template').optional().isIn(['general', 'cardiac', 'diabetic'])
  ],
  validate,
  async (req, res) => {
    try {
      const { mrn, name, dob, gender, ward, bed, consent, phone, emergencyContact, template, notes } = req.body;

      // Check if MRN already exists
      const existingPatient = await Patient.findOne({ mrn: mrn.toUpperCase() });
      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Patient with this MRN already exists'
        });
      }

      // Create patient with current user as primary nurse
      const patient = await Patient.create({
        mrn: mrn.toUpperCase(),
        name,
        dob,
        gender,
        ward,
        bed,
        consent: consent || false,
        primaryNurse: req.user._id,
        phone,
        emergencyContact,
        template: template || 'general',
        notes
      });

      // Populate primary nurse details
      await patient.populate('primaryNurse', 'name email role');

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: { patient }
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating patient',
        error: error.message
      });
    }
  }
);

// @route   GET /api/v1/patients
// @desc    Get all patients with filters and pagination
// @access  Private
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('ward').optional(),
    query('active').optional().isBoolean(),
    query('search').optional()
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      
      if (req.query.ward) {
        filter.ward = req.query.ward;
      }
      
      if (req.query.active !== undefined) {
        filter.active = req.query.active === 'true';
      } else {
        filter.active = true; // Default to active patients only
      }

      // Search by name or MRN
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { mrn: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const patients = await Patient.find(filter)
        .populate('primaryNurse', 'name email role')
        .populate('primaryDoctor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Patient.countDocuments(filter);

      res.json({
        success: true,
        data: {
          patients,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patients',
        error: error.message
      });
    }
  }
);

// @route   GET /api/v1/patients/:id
// @desc    Get single patient
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('primaryNurse', 'name email role phone')
      .populate('primaryDoctor', 'name email role phone');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: { patient }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
});

// @route   PUT /api/v1/patients/:id
// @desc    Update patient
// @access  Private
router.put(
  '/:id',
  [
    body('mrn').optional(),
    body('name').optional().notEmpty(),
    body('dob').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('ward').optional().notEmpty(),
    body('template').optional().isIn(['general', 'cardiac', 'diabetic'])
  ],
  validate,
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Don't allow MRN changes
      if (req.body.mrn && req.body.mrn.toUpperCase() !== patient.mrn) {
        return res.status(400).json({
          success: false,
          message: 'MRN cannot be changed'
        });
      }

      // Update allowed fields
      const allowedUpdates = ['name', 'dob', 'gender', 'ward', 'bed', 'consent', 'phone', 'emergencyContact', 'template', 'notes', 'primaryDoctor'];
      
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          patient[key] = req.body[key];
        }
      });

      await patient.save();
      await patient.populate('primaryNurse primaryDoctor', 'name email role');

      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: { patient }
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating patient',
        error: error.message
      });
    }
  }
);

// @route   DELETE /api/v1/patients/:id
// @desc    Soft delete patient
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Soft delete
    patient.active = false;
    await patient.save();

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
});

module.exports = router;
