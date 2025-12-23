const express = require('express');
const { body, validationResult } = require('express-validator');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const { logAudit, ACTIONS } = require('../utils/auditLogger');

const router = express.Router();

// Note: Individual routes specify their own authorization
// Some routes (like /wards GET) are accessible to all authenticated users

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

// @route   GET /api/v1/settings
// @desc    Get system settings
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// @route   PUT /api/v1/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put(
  '/',
  protect,
  authorize('admin'),
  [
    body('defaultVitalsInterval').optional().isIn([1, 2, 4, 6, 8, 12, 24]),
    body('autoGenerateReminders').optional().isBoolean(),
    body('alertRetentionDays').optional().isInt({ min: 7, max: 365 }),
    body('criticalAlertNotifications').optional().isBoolean(),
    body('emailNotifications').optional().isBoolean(),
    body('dailySummaryEmail').optional().isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const updates = {};
      const allowedFields = [
        'defaultVitalsInterval',
        'autoGenerateReminders',
        'alertRetentionDays',
        'criticalAlertNotifications',
        'emailNotifications',
        'dailySummaryEmail'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const settings = await Settings.updateSettings(updates);

      // Log the change
      await logAudit({
        action: ACTIONS.SETTINGS_CHANGE,
        userId: req.user._id,
        resourceType: 'settings',
        details: `Updated system settings: ${Object.keys(updates).join(', ')}`,
        req
      });

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }
  }
);

// @route   GET /api/v1/settings/wards
// @desc    Get all active wards (accessible to all authenticated users)
// @access  Private
router.get('/wards', protect, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      data: settings.wards.filter(w => w.active)
    });
  } catch (error) {
    console.error('Get wards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wards'
    });
  }
});

// @route   POST /api/v1/settings/wards
// @desc    Add a new ward
// @access  Private (Admin only)
router.post(
  '/wards',
  protect,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Ward name is required'),
    body('beds').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res) => {
    try {
      const { name, beds = 10 } = req.body;
      
      const settings = await Settings.getSettings();
      
      // Check if ward already exists
      if (settings.wards.some(w => w.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Ward with this name already exists'
        });
      }

      settings.wards.push({ name, beds, active: true });
      await settings.save();

      // Log the change
      await logAudit({
        action: ACTIONS.SETTINGS_CHANGE,
        userId: req.user._id,
        resourceType: 'settings',
        details: `Added new ward: ${name}`,
        req
      });

      res.status(201).json({
        success: true,
        message: 'Ward added successfully',
        data: settings.wards
      });
    } catch (error) {
      console.error('Add ward error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add ward'
      });
    }
  }
);

// @route   PUT /api/v1/settings/wards/:name
// @desc    Update a ward
// @access  Private (Admin only)
router.put(
  '/wards/:name',
  protect,
  authorize('admin'),
  [
    body('newName').optional().notEmpty(),
    body('beds').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res) => {
    try {
      const { name } = req.params;
      const { newName, beds } = req.body;
      
      const settings = await Settings.getSettings();
      
      const wardIndex = settings.wards.findIndex(
        w => w.name.toLowerCase() === name.toLowerCase()
      );
      
      if (wardIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Ward not found'
        });
      }

      if (newName) {
        settings.wards[wardIndex].name = newName;
      }
      if (beds) {
        settings.wards[wardIndex].beds = beds;
      }

      await settings.save();

      // Log the change
      await logAudit({
        action: ACTIONS.SETTINGS_CHANGE,
        userId: req.user._id,
        resourceType: 'settings',
        details: `Updated ward: ${name}${newName ? ` → ${newName}` : ''}`,
        req
      });

      res.json({
        success: true,
        message: 'Ward updated successfully',
        data: settings.wards
      });
    } catch (error) {
      console.error('Update ward error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ward'
      });
    }
  }
);

// @route   DELETE /api/v1/settings/wards/:name
// @desc    Delete (deactivate) a ward
// @access  Private (Admin only)
router.delete('/wards/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const settings = await Settings.getSettings();
    
    const wardIndex = settings.wards.findIndex(
      w => w.name.toLowerCase() === name.toLowerCase()
    );
    
    if (wardIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found'
      });
    }

    // Soft delete - just deactivate
    settings.wards[wardIndex].active = false;
    await settings.save();

    // Log the change
    await logAudit({
      action: ACTIONS.SETTINGS_CHANGE,
      userId: req.user._id,
      resourceType: 'settings',
      details: `Deleted ward: ${name}`,
      req
    });

    res.json({
      success: true,
      message: 'Ward deleted successfully',
      data: settings.wards.filter(w => w.active)
    });
  } catch (error) {
    console.error('Delete ward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ward'
    });
  }
});

module.exports = router;
