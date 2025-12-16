const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Vitals = require('../models/Vitals');
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

// @route   GET /api/v1/vitals/templates
// @desc    Get all vital templates
// @access  Private
router.get('/templates', (req, res) => {
  const templates = Vitals.getTemplates();
  res.json({
    success: true,
    data: { templates }
  });
});

// @route   GET /api/v1/vitals/templates/:name
// @desc    Get specific template
// @access  Private
router.get('/templates/:name', (req, res) => {
  const template = Vitals.getTemplate(req.params.name);
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }

  res.json({
    success: true,
    data: { template }
  });
});

// @route   POST /api/v1/vitals
// @desc    Record new vitals
// @access  Private
router.post(
  '/',
  [
    body('patient').isMongoId().withMessage('Valid patient ID is required'),
    body('template').isIn(['general', 'cardiac', 'diabetic']).withMessage('Valid template is required'),
    body('vitals').isObject().withMessage('Vitals data is required')
  ],
  validate,
  async (req, res) => {
    try {
      const { patient, template, vitals, notes } = req.body;

      // Verify patient exists
      const patientDoc = await Patient.findById(patient);
      if (!patientDoc) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Create vitals record
      const vitalsRecord = await Vitals.create({
        patient,
        template,
        vitals,
        notes,
        recordedBy: req.user._id
      });

      // If vitals are flagged, create an alert
      if (vitalsRecord.flagged && vitalsRecord.flaggedFields.length > 0) {
        const Alert = require('../models/Alert');
        
        const severity = Alert.calculateSeverity(vitalsRecord.flaggedFields);
        
        const fieldsList = vitalsRecord.flaggedFields.map(f => f.field).join(', ');
        const message = `Abnormal vitals detected: ${fieldsList}`;
        
        await Alert.create({
          patient,
          vitals: vitalsRecord._id,
          severity,
          message,
          flaggedFields: vitalsRecord.flaggedFields
        });
      }

      await vitalsRecord.populate([
        { path: 'patient', select: 'name mrn ward' },
        { path: 'recordedBy', select: 'name role' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Vitals recorded successfully',
        data: { vitals: vitalsRecord }
      });
    } catch (error) {
      console.error('Record vitals error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording vitals',
        error: error.message
      });
    }
  }
);

// @route   GET /api/v1/vitals/patient/:patientId
// @desc    Get vitals for a specific patient
// @access  Private
router.get(
  '/patient/:patientId',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('flagged').optional().isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = { patient: req.params.patientId };
      
      if (req.query.flagged !== undefined) {
        filter.flagged = req.query.flagged === 'true';
      }

      const vitals = await Vitals.find(filter)
        .populate('recordedBy', 'name role')
        .sort({ recordedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Vitals.countDocuments(filter);

      res.json({
        success: true,
        data: {
          vitals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get patient vitals error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vitals',
        error: error.message
      });
    }
  }
);

// @route   GET /api/v1/vitals/patient/:patientId/latest
// @desc    Get latest vitals for a patient
// @access  Private
router.get('/patient/:patientId/latest', async (req, res) => {
  try {
    const vitals = await Vitals.findOne({ patient: req.params.patientId })
      .populate('recordedBy', 'name role')
      .sort({ recordedAt: -1 });

    res.json({
      success: true,
      data: { vitals }
    });
  } catch (error) {
    console.error('Get latest vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest vitals',
      error: error.message
    });
  }
});

// @route   GET /api/v1/vitals/patient/:patientId/trends
// @desc    Get vitals trends for charts
// @access  Private
router.get('/patient/:patientId/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const vitals = await Vitals.find({
      patient: req.params.patientId,
      recordedAt: { $gte: startDate }
    })
      .select('vitals recordedAt template')
      .sort({ recordedAt: 1 });

    res.json({
      success: true,
      data: { vitals }
    });
  } catch (error) {
    console.error('Get vitals trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vitals trends',
      error: error.message
    });
  }
});

// @route   DELETE /api/v1/vitals/:id
// @desc    Delete vitals record
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const vitals = await Vitals.findById(req.params.id);

    if (!vitals) {
      return res.status(404).json({
        success: false,
        message: 'Vitals record not found'
      });
    }

    await vitals.deleteOne();

    res.json({
      success: true,
      message: 'Vitals record deleted successfully'
    });
  } catch (error) {
    console.error('Delete vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vitals record',
      error: error.message
    });
  }
});

// @route   DELETE /api/v1/vitals/:id
// @desc    Delete a vital record
// @access  Private (doctors, nurses, admins only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const vital = await Vitals.findById(req.params.id);

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital record not found'
      });
    }

    await vital.deleteOne();

    res.json({
      success: true,
      message: 'Vital record deleted successfully'
    });
  } catch (error) {
    console.error('Delete vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vital record',
      error: error.message
    });
  }
});

module.exports = router;
