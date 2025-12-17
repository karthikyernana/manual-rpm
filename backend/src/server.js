require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting - General API (500 requests per 15 min - generous for app usage)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Auth endpoints (20 requests per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Input sanitization middleware
const { sanitizeBody } = require('./utils/sanitize');
app.use(sanitizeBody);

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Manual-RPM API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const vitalsRoutes = require('./routes/vitals.routes');
const alertRoutes = require('./routes/alert.routes');
const reminderRoutes = require('./routes/reminder.routes');
const templateRoutes = require('./routes/template.routes');
const shareRoutes = require('./routes/share.routes');
const exportRoutes = require('./routes/export.routes');
const auditRoutes = require('./routes/audit.routes');
const settingsRoutes = require('./routes/settings.routes');

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/vitals', vitalsRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/share', shareRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Start schedulers
const { startSchedulers } = require('./services/scheduler');
startSchedulers();

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL}`);
});
