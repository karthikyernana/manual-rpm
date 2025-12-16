const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
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

// @route   GET /api/v1/reminders
// @desc    Get all reminders with filters
// @access  Private
router.get(
  '/',
  [
    query('status').optional().isIn(['pending', 'snoozed', 'completed']),
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
        filter.status = { $in: ['pending', 'snoozed'] };
      }
      
      if (req.query.patient) {
        filter.patient = req.query.patient;
      }

      const reminders = await Reminder.find(filter)
        .populate('patient', 'name mrn ward')
        .populate('completedBy', 'name')
        .sort({ dueDate: 1, priority: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Reminder.countDocuments(filter);

      res.json({
        success: true,
        data: {
          reminders,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get reminders error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching reminders',
        error: error.message
      });
    }
  }
);

// @route   POST /api/v1/reminders
// @desc    Create new reminder
// @access  Private
router.post(
  '/',
  [
    body('patient').isMongoId().withMessage('Valid patient ID is required'),
    body('type').isIn(['vitals_due', 'medication', 'appointment', 'custom']),
    body('title').notEmpty().withMessage('Title is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('priority').optional().isIn(['low', 'medium', 'high'])
  ],
  validate,
  async (req, res) => {
    try {
      const reminder = await Reminder.create({
        ...req.body,
        createdBy: req.user._id
      });

      await reminder.populate('patient', 'name mrn ward');

      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        data: { reminder }
      });
    } catch (error) {
      console.error('Create reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating reminder',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/v1/reminders/:id/snooze
// @desc    Snooze a reminder
// @access  Private
router.put(
  '/:id/snooze',
  [
    body('hours').isInt({ min: 1, max: 72 }).withMessage('Hours must be between 1 and 72')
  ],
  validate,
  async (req, res) => {
    try {
      const reminder = await Reminder.findById(req.params.id);

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }

      const snoozedUntil = new Date(Date.now() + req.body.hours * 60 * 60 * 1000);
      
      reminder.status = 'snoozed';
      reminder.snoozedUntil = snoozedUntil;
      
      await reminder.save();
      await reminder.populate('patient', 'name mrn ward');

      res.json({
        success: true,
        message: `Reminder snoozed for ${req.body.hours} hours`,
        data: { reminder }
      });
    } catch (error) {
      console.error('Snooze reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Error snoozing reminder',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/v1/reminders/:id/complete
// @desc    Mark reminder as completed
// @access  Private
router.put('/:id/complete', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.status = 'completed';
    reminder.completedAt = new Date();
    reminder.completedBy = req.user._id;
    
    await reminder.save();
    await reminder.populate('patient completedBy', 'name mrn ward');

    res.json({
      success: true,
      message: 'Reminder marked as completed',
      data: { reminder }
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing reminder',
      error: error.message
    });
  }
});

// @route   DELETE /api/v1/reminders/:id
// @desc    Delete a reminder
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await reminder.deleteOne();

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reminder',
      error: error.message
    });
  }
});

module.exports = router;
