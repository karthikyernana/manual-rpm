const express = require('express');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendReminderEmail } = require('../services/emailService');

const router = express.Router();

// Store for SSE clients (for real-time push to browser)
const clients = new Map();

/**
 * @route   OPTIONS /api/v1/notifications/subscribe
 * @desc    Handle CORS preflight for SSE subscription
 * @access  Public (preflight before auth)
 */
router.options('/subscribe', (req, res) => {
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  const requestOrigin = req.headers.origin;
  
  if (requestOrigin && requestOrigin !== allowedOrigin) {
    return res.status(403).end();
  }
  
  if (requestOrigin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.setHeader('Vary', 'Origin');
  }
  
  res.status(204).end();
});

// Middleware to protect all routes
router.use(protect);

/**
 * @route   GET /api/v1/notifications/subscribe
 * @desc    Subscribe to Server-Sent Events for real-time notifications
 * @access  Private
 */
router.get('/subscribe', (req, res) => {
  // Validate CORS - only allow requests from authorized origin
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  const requestOrigin = req.headers.origin;
  
  if (requestOrigin && requestOrigin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Origin not allowed'
    });
  }
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Set CORS header for the allowed origin
  if (requestOrigin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.flushHeaders();

  // Add client to the map (support multiple connections per user)
  const userId = req.user._id.toString();
  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId).push(res);
  console.log(`User ${userId} subscribed to notifications (${clients.get(userId).length} active connections)`);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Notification service connected' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    const userConnections = clients.get(userId);
    if (userConnections) {
      const index = userConnections.indexOf(res);
      if (index !== -1) {
        userConnections.splice(index, 1);
      }
      // Remove user entry if no more connections
      if (userConnections.length === 0) {
        clients.delete(userId);
      }
      console.log(`User ${userId} disconnected from notifications (${userConnections.length} remaining connections)`);
    }
  });
});

/**
 * @route   GET /api/v1/notifications/due
 * @desc    Get due reminders that need attention
 * @access  Private
 */
router.get('/due', async (req, res) => {
  try {
    const now = new Date();
    
    // Find pending reminders that are due (past or within next 5 minutes)
    const dueReminders = await Reminder.find({
      status: 'pending',
      dueDate: { $lte: new Date(now.getTime() + 5 * 60 * 1000) } // Due within 5 minutes
    })
      .populate('patient', 'name mrn ward')
      .sort({ dueDate: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        count: dueReminders.length,
        reminders: dueReminders
      }
    });
  } catch (error) {
    console.error('Error fetching due notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

/**
 * @route   POST /api/v1/notifications/test-email
 * @desc    Send a test email notification
 * @access  Private (Admin only)
 */
router.post('/test-email', authorize('admin'), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Create a test reminder object
    const testReminder = {
      title: 'Test Reminder',
      type: 'custom',
      priority: 'medium',
      dueDate: new Date(),
      description: 'This is a test notification from Vitalis',
      patient: { name: 'Test Patient' }
    };

    const result = await sendReminderEmail(testReminder, email);
    
    if (result) {
      res.json({
        success: true,
        message: `Test email sent to ${email}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email. Check email configuration.'
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

/**
 * Send notification to a specific user via SSE
 */
const sendNotificationToUser = (userId, notification) => {
  const userConnections = clients.get(userId.toString());
  if (userConnections && userConnections.length > 0) {
    userConnections.forEach(client => {
      try {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
      }
    });
    return true;
  }
  return false;
};

/**
 * Broadcast notification to all connected clients
 */
const broadcastNotification = (notification) => {
  clients.forEach((userConnections, userId) => {
    userConnections.forEach(client => {
      try {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
      }
    });
  });
};

/**
 * Process due reminders and send notifications
 * Called by the scheduler
 */
const processDueReminders = async () => {
  try {
    const now = new Date();
    
    // Find reminders that are due and haven't been notified yet
    const dueReminders = await Reminder.find({
      status: 'pending',
      dueDate: { $lte: now },
      notifiedAt: { $exists: false }
    })
      .populate('patient', 'name mrn ward primaryNurse')
      .populate('createdBy', 'name email')
      .limit(20);

    for (const reminder of dueReminders) {
      // Create notification payload
      const notification = {
        type: 'reminder_due',
        id: reminder._id,
        title: reminder.title,
        patient: reminder.patient?.name || 'Unknown',
        priority: reminder.priority,
        dueDate: reminder.dueDate,
        createdAt: new Date()
      };

      // Broadcast to all connected users
      broadcastNotification(notification);

      // Send email to creator if they have an email
      if (reminder.createdBy?.email) {
        await sendReminderEmail(reminder, reminder.createdBy.email);
      }

      // Mark as notified
      await Reminder.findByIdAndUpdate(reminder._id, {
        $set: { notifiedAt: now }
      });
    }

    if (dueReminders.length > 0) {
      console.log(`Processed ${dueReminders.length} due reminder notifications`);
    }
  } catch (error) {
    console.error('Error processing due reminders:', error);
  }
};

module.exports = {
  router,
  sendNotificationToUser,
  broadcastNotification,
  processDueReminders
};
