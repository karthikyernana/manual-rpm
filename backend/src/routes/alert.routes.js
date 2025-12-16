const express = require('express');
const { query, body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
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

// @route   GET /api/v1/alerts
// @desc    Get all alerts with filters
// @access  Private
router.get(
  '/',
  [
    query('status').optional().isIn(['active', 'acknowledged', 'resolved']),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('patient').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      
      if (req.query.status) {
        filter.status = req.query.status;
      } else {
        // Default to active alerts only
        filter.status = 'active';
      }
      
      if (req.query.severity) {
        filter.severity = req.query.severity;
      }
      
      if (req.query.patient) {
        filter.patient = req.query.patient;
      }

      const alerts = await Alert.find(filter)
        .populate('patient', 'name mrn ward')
        .populate('vitals', 'recordedAt')
        .populate('acknowledgedBy', 'name')
        .populate('resolvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Alert.countDocuments(filter);

      res.json({
        success: true,
        data: {
          alerts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching alerts',
        error: error.message
      });
    }
  }
);

// @route   GET /api/v1/alerts/patient/:patientId
// @desc    Get alerts for specific patient
// @access  Private
router.get('/patient/:patientId', async (req, res) => {
  try {
    const alerts = await Alert.find({ 
      patient: req.params.patientId 
    })
      .populate('vitals', 'recordedAt')
      .populate('acknowledgedBy', 'name')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Get patient alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient alerts',
      error: error.message
    });
  }
});

// @route   PUT /api/v1/alerts/:id/acknowledge
// @desc    Acknowledge an alert
// @access  Private
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Alert is not active'
      });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();
    
    await alert.save();
    await alert.populate('patient acknowledgedBy', 'name mrn ward');

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message
    });
  }
});

// @route   PUT /api/v1/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Private
router.put(
  '/:id/resolve',
  [
    body('notes').optional()
  ],
  validate,
  async (req, res) => {
    try {
      const alert = await Alert.findById(req.params.id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      alert.status = 'resolved';
      alert.resolvedBy = req.user._id;
      alert.resolvedAt = new Date();
      
      if (req.body.notes) {
        alert.notes = req.body.notes;
      }
      
      await alert.save();
      await alert.populate('patient resolvedBy', 'name mrn ward');

      res.json({
        success: true,
        message: 'Alert resolved successfully',
        data: { alert }
      });
    } catch (error) {
      console.error('Resolve alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resolving alert',
        error: error.message
      });
    }
  }
);

module.exports = router;
