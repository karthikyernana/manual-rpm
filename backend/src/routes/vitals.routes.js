const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Vitals = require('../models/Vitals');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');
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

// @route   GET /api/v1/vitals/stats
// @desc    Get vitals statistics (today's count, etc.)
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayCount, totalCount, flaggedToday] = await Promise.all([
      Vitals.countDocuments({ recordedAt: { $gte: today } }),
      Vitals.countDocuments(),
      Vitals.countDocuments({ recordedAt: { $gte: today }, flagged: true })
    ]);

    res.json({
      success: true,
      data: {
        todayCount,
        totalCount,
        flaggedToday
      }
    });
  } catch (error) {
    console.error('Get vitals stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vitals stats'
    });
  }
});

// @route   GET /api/v1/vitals/templates
// @desc    Get all vital templates (built-in + user's custom)
// @access  Private
router.get('/templates', async (req, res) => {
  try {
    const builtInTemplates = Vitals.getTemplates();
    
    // Fetch user's custom templates
    const VitalsTemplate = require('../models/VitalsTemplate');
    const customTemplates = await VitalsTemplate.find({
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    }).select('_id name description category');
    
    // Combine built-in and custom templates
    const allTemplates = {
      ...builtInTemplates,
      custom: customTemplates.map(ct => ({
        _id: ct._id,
        name: ct.name,
        description: ct.description,
        category: ct.category
      }))
    };
    
    res.json({
      success: true,
      data: { templates: allTemplates }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  }
});

// @route   GET /api/v1/vitals/templates/:name
// @desc    Get specific template (built-in or custom by ID)
// @access  Private
router.get('/templates/:name', async (req, res) => {
  const { name } = req.params;
  
  // Check if it's a MongoDB ObjectId (custom template)
  if (name.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const VitalsTemplate = require('../models/VitalsTemplate');
      const customTemplate = await VitalsTemplate.findById(name);
      
      if (!customTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Custom template not found'
        });
      }
      
      // Format to match built-in template structure
      const template = {
        name: customTemplate.name,
        fields: customTemplate.fields
      };
      
      return res.json({
        success: true,
        data: { template }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching custom template'
      });
    }
  }
  
  // Otherwise, treat as built-in template
  const template = Vitals.getTemplate(name);
  
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
    body('template').notEmpty().withMessage('Template is required'),
    body('vitals').isObject().withMessage('Vitals data is required')
  ],
  validate,
  async (req, res) => {
    try {
      const { patient, template, vitals, notes, customTemplateId } = req.body;

      // Verify patient exists
      const patientDoc = await Patient.findById(patient);
      if (!patientDoc) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Validate template - accept built-in or custom
      const builtInTemplates = ['general', 'cardiac', 'diabetic'];
      let templateName = template;
      let customTemplate = null;

      if (!builtInTemplates.includes(template)) {
        // Check if it's a custom template ID
        const VitalsTemplate = require('../models/VitalsTemplate');
        customTemplate = await VitalsTemplate.findById(template);
        
        if (!customTemplate) {
          return res.status(400).json({
            success: false,
            message: 'Invalid template. Must be general, cardiac, diabetic, or a valid custom template ID'
          });
        }
        templateName = 'custom';
      }

      // Create vitals record
      const vitalsRecord = await Vitals.create({
        patient,
        template: templateName,
        customTemplateId: customTemplate?._id || customTemplateId,
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

      // Log vitals recording
      await logAudit({
        action: ACTIONS.VITALS_RECORD,
        userId: req.user._id,
        resourceType: 'vitals',
        resourceId: vitalsRecord._id,
        resourceName: patientDoc.name,
        details: `Recorded vitals for ${patientDoc.name}${vitalsRecord.flagged ? ' (FLAGGED)' : ''}`,
        req
      });

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

    // Log vitals deletion
    await logAudit({
      action: ACTIONS.VITALS_DELETE,
      userId: req.user._id,
      resourceType: 'vitals',
      resourceId: vitals._id,
      details: `Deleted vitals record`,
      req
    });

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

module.exports = router;
