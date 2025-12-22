const express = require('express');
const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const Alert = require('../models/Alert');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/v1/dashboard/stats
// @desc    Get all dashboard statistics in a single optimized call
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    // Run all queries in parallel for performance
    const [
      totalPatients,
      activePatients,
      newAlerts,
      pendingReminders,
      todayVitalsCount,
      recentActivity,
      wardStats
    ] = await Promise.all([
      // Total patients count
      Patient.countDocuments({}),
      
      // Active patients count
      Patient.countDocuments({ active: true }),
      
      // New alerts count
      Alert.countDocuments({ status: 'new' }),
      
      // Pending reminders count
      Reminder.countDocuments({ status: 'pending' }),
      
      // Today's vitals recordings
      Vitals.countDocuments({
        recordedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      
      // Recent activity (last 5 vitals)
      Vitals.find({})
        .sort({ recordedAt: -1 })
        .limit(5)
        .populate('patient', 'name mrn ward')
        .populate('recordedBy', 'name')
        .lean(),
      
      // Patients per ward
      Patient.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$ward', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Calculate critical alerts (high + critical severity with 'new' status)
    const criticalAlerts = await Alert.countDocuments({
      status: 'new',
      severity: { $in: ['high', 'critical'] }
    });

    // Get overdue reminders
    const overdueReminders = await Reminder.countDocuments({
      status: 'pending',
      dueDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalPatients,
          activePatients,
          newAlerts,
          criticalAlerts,
          pendingReminders,
          overdueReminders,
          todayVitalsCount
        },
        wardStats: wardStats.map(w => ({
          ward: w._id,
          patientCount: w.count
        })),
        recentActivity: recentActivity.map(v => ({
          id: v._id,
          patientName: v.patient?.name || 'Unknown',
          patientMrn: v.patient?.mrn,
          ward: v.patient?.ward,
          recordedBy: v.recordedBy?.name || 'Unknown',
          recordedAt: v.recordedAt,
          flagged: v.flagged
        })),
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// @route   GET /api/v1/dashboard/quick-stats
// @desc    Get minimal stats for quick refresh (lighter payload)
// @access  Private
router.get('/quick-stats', async (req, res) => {
  try {
    const [activePatients, newAlerts, pendingReminders] = await Promise.all([
      Patient.countDocuments({ active: true }),
      Alert.countDocuments({ status: 'new' }),
      Reminder.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      data: {
        activePatients,
        newAlerts,
        pendingReminders,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quick stats'
    });
  }
});

module.exports = router;
