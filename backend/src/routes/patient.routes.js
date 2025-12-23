const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');
const Reminder = require('../models/Reminder');
const SharedLink = require('../models/SharedLink');
const Vitals = require('../models/Vitals');
const { protect, authorize } = require('../middleware/auth');
const { logAudit, ACTIONS } = require('../utils/auditLogger');

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
    body('template').optional().custom((value) => {
      // Allow built-in templates or MongoDB ObjectId for custom templates
      const builtIn = ['general', 'cardiac', 'diabetic', 'custom'];
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      if (builtIn.includes(value) || isObjectId) {
        return true;
      }
      throw new Error('Template must be general, cardiac, diabetic, or a valid custom template ID');
    })
  ],
  validate,
  async (req, res) => {
    try {
      const { mrn, name, dob, gender, ward, bed, consent, phone, emergencyContact, template, notes, customTemplateId } = req.body;

      // Check if MRN already exists
      const existingPatient = await Patient.findOne({ mrn: mrn.toUpperCase() });
      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Patient with this MRN already exists'
        });
      }

      // Determine if template is custom
      const builtInTemplates = ['general', 'cardiac', 'diabetic'];
      let templateValue = template || 'general';
      let customTempId = null;

      // If template is not a built-in one, treat it as a custom template ID
      if (!builtInTemplates.includes(template)) {
        const VitalsTemplate = require('../models/VitalsTemplate');
        const customTemplate = await VitalsTemplate.findById(template);
        
        if (customTemplate) {
          templateValue = 'custom';
          customTempId = template;
        }
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
        template: templateValue,
        customTemplateId: customTempId,
        notes
      });

      // Populate primary nurse details
      await patient.populate('primaryNurse', 'name email role');

      // Log the creation
      await logAudit({
        action: ACTIONS.PATIENT_CREATE,
        userId: req.user._id,
        resourceType: 'patient',
        resourceId: patient._id,
        resourceName: patient.name,
        details: `Created patient ${patient.name} (MRN: ${patient.mrn})`,
        req
      });

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
        .populate('customTemplateId', 'name category')
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
      .populate('primaryDoctor', 'name email role phone')
      .populate('customTemplateId', 'name description fields category');

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
    body('template').optional().custom((value) => {
      // Allow built-in templates or MongoDB ObjectId for custom templates
      const builtIn = ['general', 'cardiac', 'diabetic', 'custom'];
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      if (builtIn.includes(value) || isObjectId) {
        return true;
      }
      throw new Error('Template must be general, cardiac, diabetic, or a valid custom template ID');
    })
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

      // Handle template update
      if (req.body.template) {
        const builtInTemplates = ['general', 'cardiac', 'diabetic'];
        
        // If template is not a built-in one, treat it as a custom template ID
        if (!builtInTemplates.includes(req.body.template)) {
          const VitalsTemplate = require('../models/VitalsTemplate');
          const customTemplate = await VitalsTemplate.findById(req.body.template);
          
          if (customTemplate) {
            patient.template = 'custom';
            patient.customTemplateId = req.body.template;
          }
        } else {
          patient.template = req.body.template;
          patient.customTemplateId = null;
        }
      }

      // Update allowed fields
      const allowedUpdates = ['name', 'dob', 'gender', 'ward', 'bed', 'consent', 'phone', 'emergencyContact', 'notes', 'primaryDoctor'];
      
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          patient[key] = req.body[key];
        }
      });

      await patient.save();
      await patient.populate('primaryNurse primaryDoctor', 'name email role');

      // Log the update
      await logAudit({
        action: ACTIONS.PATIENT_UPDATE,
        userId: req.user._id,
        resourceType: 'patient',
        resourceId: patient._id,
        resourceName: patient.name,
        details: `Updated patient ${patient.name} (MRN: ${patient.mrn})`,
        req
      });

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
// @desc    Soft delete patient with cascade cleanup
// @access  Private (Admin/Doctor only)
router.delete('/:id', authorize('admin', 'doctor'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Soft delete patient
    patient.active = false;
    await patient.save();

    // Cascade: Resolve all pending/new alerts for this patient
    await Alert.updateMany(
      { patient: patient._id, status: { $in: ['new', 'acknowledged'] } },
      { 
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
        notes: 'Auto-resolved: Patient record deleted'
      }
    );

    // Cascade: Cancel all pending/snoozed reminders for this patient
    await Reminder.updateMany(
      { patient: patient._id, status: { $in: ['pending', 'snoozed'] } },
      { status: 'cancelled' }
    );

    // Cascade: Revoke all active share links for this patient
    await SharedLink.updateMany(
      { patient: patient._id, revoked: false },
      { revoked: true }
    );

    // Cascade: Delete all vitals records for this patient
    const deletedVitals = await Vitals.deleteMany({ patient: patient._id });
    console.log(`Deleted ${deletedVitals.deletedCount} vitals records for patient ${patient.mrn}`);

    // Log the deletion
    await logAudit({
      action: ACTIONS.PATIENT_DELETE,
      userId: req.user._id,
      resourceType: 'patient',
      resourceId: patient._id,
      resourceName: patient.name,
      details: `Deleted patient ${patient.name} (MRN: ${patient.mrn}) with cascade cleanup`,
      req
    });

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

// @route   POST /api/v1/patients/:id/discharge
// @desc    Discharge patient
// @access  Private
router.post(
  '/:id/discharge',
  [
    body('notes').optional().isString().withMessage('Discharge notes must be a string')
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

      if (patient.status === 'discharged') {
        return res.status(400).json({
          success: false,
          message: 'Patient is already discharged'
        });
      }

      // Add current admission to history
      patient.admissionHistory.push({
        admittedAt: patient.admissionDate,
        dischargedAt: new Date(),
        dischargedBy: req.user._id,
        ward: patient.ward,
        bed: patient.bed,
        dischargeNotes: req.body.notes || ''
      });

      // Update patient status
      patient.status = 'discharged';
      patient.dischargedAt = new Date();
      patient.dischargedBy = req.user._id;
      patient.active = false;

      await patient.save();

      // Cascade: Resolve all pending/acknowledged alerts
      await Alert.updateMany(
        { patient: patient._id, status: { $in: ['active', 'acknowledged'] } },
        { 
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedBy: req.user._id,
          notes: 'Auto-resolved: Patient discharged'
        }
      );

      // Cascade: Cancel pending reminders
      await Reminder.updateMany(
        { patient: patient._id, status: { $in: ['pending', 'snoozed'] } },
        { status: 'cancelled' }
      );

      // Log the discharge
      await logAudit({
        action: ACTIONS.PATIENT_DISCHARGE,
        userId: req.user._id,
        resourceType: 'patient',
        resourceId: patient._id,
        resourceName: patient.name,
        details: `Discharged patient ${patient.name} (MRN: ${patient.mrn})`,
        metadata: { dischargeNotes: req.body.notes },
        req
      });

      await patient.populate('dischargedBy', 'name email role');

      res.json({
        success: true,
        message: 'Patient discharged successfully',
        data: { patient }
      });
    } catch (error) {
      console.error('Discharge patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error discharging patient',
        error: error.message
      });
    }
  }
);

// @route   POST /api/v1/patients/:id/readmit
// @desc    Readmit discharged patient
// @access  Private
router.post(
  '/:id/readmit',
  [
    body('ward').notEmpty().withMessage('Ward is required for readmission'),
    body('bed').optional().isString(),
    body('notes').optional().isString()
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

      if (patient.status === 'admitted') {
        return res.status(400).json({
          success: false,
          message: 'Patient is already admitted'
        });
      }

      // Update patient for readmission
      patient.status = 'admitted';
      patient.active = true;
      patient.admissionDate = new Date();
      patient.ward = req.body.ward;
      patient.bed = req.body.bed || '';
      patient.dischargedAt = null;
      patient.dischargedBy = null;
      
      if (req.body.notes) {
        patient.notes = req.body.notes;
      }

      await patient.save();

      // Log the readmission
      await logAudit({
        action: ACTIONS.PATIENT_READMIT,
        userId: req.user._id,
        resourceType: 'patient',
        resourceId: patient._id,
        resourceName: patient.name,
        details: `Readmitted patient ${patient.name} (MRN: ${patient.mrn}) to ${req.body.ward}`,
        metadata: { ward: req.body.ward, bed: req.body.bed, notes: req.body.notes },
        req
      });

      await patient.populate('primaryNurse primaryDoctor', 'name email role');

      res.json({
        success: true,
        message: 'Patient readmitted successfully',
        data: { patient }
      });
    } catch (error) {
      console.error('Readmit patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error readmitting patient',
        error: error.message
      });
    }
  }
);

module.exports = router;
