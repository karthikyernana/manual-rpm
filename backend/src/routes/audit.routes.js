const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/v1/audit
// @desc    Get audit logs with filters
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      action,
      userId,
      resourceType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter
    const filter = {};
    
    if (action) {
      filter.action = action;
    }
    
    if (userId) {
      filter.user = userId;
    }
    
    if (resourceType) {
      filter.resourceType = resourceType;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count
    const total = await AuditLog.countDocuments(filter);
    
    // Get logs
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// @route   GET /api/v1/audit/recent
// @desc    Get recent activity for dashboard
// @access  Private
router.get('/recent', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
});

// @route   GET /api/v1/audit/stats
// @desc    Get audit log statistics
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalLogs,
      todayLogs,
      actionBreakdown,
      recentUsers
    ] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ createdAt: { $gte: today } }),
      AuditLog.aggregate([
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: today } } },
        {
          $group: {
            _id: '$user',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        todayLogs,
        actionBreakdown,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics'
    });
  }
});

// @route   GET /api/v1/audit/export
// @desc    Export audit logs to CSV
// @access  Private (Admin only)
router.get('/export', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10000); // Max 10k records

    // Generate CSV
    const header = 'Timestamp,User,Email,Role,Action,Resource Type,Resource Name,Details,IP\n';
    const rows = logs.map(log => {
      const timestamp = new Date(log.createdAt).toISOString();
      const userName = log.user?.name || 'Unknown';
      const userEmail = log.user?.email || 'Unknown';
      const userRole = log.user?.role || 'Unknown';
      const details = log.details ? log.details.replace(/,/g, ';') : '';
      const resourceName = log.resourceName ? log.resourceName.replace(/,/g, ';') : '';
      
      return `${timestamp},${userName},${userEmail},${userRole},${log.action},${log.resourceType || ''},${resourceName},${details},${log.ip || ''}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.csv`);
    res.send(header + rows);
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs'
    });
  }
});

module.exports = router;
