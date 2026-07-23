require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');


if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('\n❌ FATAL ERROR: JWT_SECRET is not properly configured!');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');
  console.error('Reason: JWT_SECRET must be at least 32 characters long');
  console.error('');
  console.error('To fix this:');
  console.error('  1. Open backend/.env file');
  console.error('  2. Update JWT_SECRET with a random 32+ character string');
  console.error('');
  console.error('Example:');
  console.error('  JWT_SECRET=Kj8fH2nP9mQ4rT7sV1wX6yZ3aB5cD0eF2gH4jK7lM9nP1');
  console.error('');
  console.error('Or run this command to generate one:');
  console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.error('');
  console.error('📖 See FRIEND_SETUP_GUIDE.md for detailed instructions');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('\n❌ FATAL ERROR: MONGODB_URI is not configured!');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');
  console.error('Reason: Database connection string is missing');
  console.error('');
  console.error('To fix this:');
  console.error('  1. Open backend/.env file');
  console.error('  2. Add MONGODB_URI with your MongoDB connection string');
  console.error('');
  console.error('Example:');
  console.error('  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/manual-rpm');
  console.error('');
  console.error('To get a free MongoDB cluster:');
  console.error('  1. Go to https://www.mongodb.com/cloud/atlas');
  console.error('  2. Create a free M0 cluster');
  console.error('  3. Get your connection string from the Connect button');
  console.error('');
  console.error('📖 See FRIEND_SETUP_GUIDE.md for detailed instructions');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(1);
}

const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting - General API (200 requests per 15 min - balanced protection)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
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

// Input sanitization and timezone normalization middleware
const { sanitizeBody, normalizeDates } = require('./utils/sanitize');
app.use(sanitizeBody);
app.use(normalizeDates);

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
const dashboardRoutes = require('./routes/dashboard.routes');

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
app.use('/api/v1/dashboard', dashboardRoutes);

// Initialize Settings
const Settings = require('./models/Settings');
Settings.getSettings().then(() => {
  console.log('✅ System settings initialized');
}).catch(err => {
  console.error('⚠️  Settings initialization warning:', err.message);
});

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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL}`);
});
