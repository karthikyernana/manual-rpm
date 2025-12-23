# Product Requirements Document – Manual-RPM (MongoDB Edition)

**Project:** Manual Remote Patient Monitoring Dashboard - Complete Rebuild  
**Version:** 3.0.0 (Production Ready)  
**Author:** Karthik Yernana  
**Status:** ✅ Completed & Deployed  
**Completion Date:** December 23, 2025  

---

## 🎯 EXECUTIVE SUMMARY

Complete production-ready healthcare monitoring dashboard with advanced features:
- ✅ Full-stack MERN application with MongoDB Atlas
- ✅ Real-time notifications via Server-Sent Events (SSE)
- ✅ Email notifications with Nodemailer
- ✅ Admin panel with user management & audit logs
- ✅ System settings with ward/bed management
- ✅ Patient discharge & readmission workflows
- ✅ Rate limiting & security hardening
- ✅ Comprehensive documentation & testing guides

**Core Achievement:** Built production-grade healthcare monitoring dashboard with enterprise features including notification system, admin controls, and audit trails.

---

## 📋 TABLE OF CONTENTS

1. [Tech Stack & Architecture](#tech-stack)
2. [4-Day Development Timeline](#timeline)
3. [Git Workflow Strategy](#git-workflow)
4. [Testing Strategy](#testing)
5. [MongoDB Schema Design](#mongodb-schema)
6. [Feature Implementation Priority](#features)
7. [Deployment Strategy](#deployment)
8. [Branding Guidelines](#branding)
9. [Quality Assurance Checklist](#qa-checklist)

---

## 🛠️ TECH STACK & ARCHITECTURE {#tech-stack}

### Frontend Stack
```
React 19.2.0 (JavaScript, NOT TypeScript)
├── Vite 7.2.4 (Build tool & dev server)
├── Tailwind CSS 3.4.19 (Styling)
├── Framer Motion 12.23.26 (Animations)
├── React Router v7.10.1 (Navigation)
├── Axios 1.13.2 (HTTP client)
├── React Hot Toast 2.6.0 (Notifications)
├── Recharts 3.6.0 (Data visualization)
├── Lucide React 0.561.0 (Icons)
├── jsPDF 3.0.4 (PDF generation)
├── jsPDF-AutoTable 5.0.2 (PDF tables)
└── QRCode 1.5.4 (QR code generation)
```

### Backend Stack
```
Node.js 18+ with Express 5.2.1
├── Mongoose 9.0.1 (MongoDB ODM)
├── bcryptjs 3.0.3 (Password hashing)
├── jsonwebtoken 9.0.3 (JWT authentication)
├── express-validator 7.3.1 (Input validation)
├── express-rate-limit 8.2.1 (Rate limiting)
├── helmet 8.1.0 (Security headers)
├── cors 2.8.5 (Cross-origin requests)
├── morgan 1.10.1 (HTTP logging)
├── node-cron 4.2.1 (Scheduled tasks)
├── nodemailer 7.0.12 (Email notifications)
├── qrcode 1.5.4 (QR code backend)
└── validator 13.15.23 (Input validation)
```

### Database
```
MongoDB Atlas (Free Tier - M0)
├── 512MB storage
├── Shared cluster
├── No credit card required
└── Community edition compatible
```

### Development Tools
```
Git + GitHub
├── CodeRabbit (AI code reviews)
├── testSprite (Testing automation)
├── ESLint (Code linting)
├── Prettier (Code formatting)
└── Postman/Thunder Client (API testing)
```

### Deployment
```
Frontend: Vercel (Free tier)
Backend: Render (Free tier)
Database: MongoDB Atlas (Free tier)
```

---

## ⏱️ 4-DAY DEVELOPMENT TIMELINE {#timeline}

### **DAY 1: Foundation & Infrastructure** (24 hours)
**Hours 0-8: Project Setup**
- [ ] Initialize Git repository
- [ ] Create project structure
- [ ] Setup MongoDB Atlas cluster
- [ ] Configure environment variables
- [ ] Install dependencies
- **GIT COMMIT #1:** `feat: initial project setup with MongoDB config`

**Hours 9-16: Authentication System**
- [ ] User model with Mongoose
- [ ] Registration endpoint
- [ ] Login endpoint with JWT
- [ ] Auth middleware
- [ ] Protected route testing
- **GIT COMMIT #2:** `feat: implement JWT authentication system`

**Hours 17-24: Basic UI Setup**
- [ ] React Router setup
- [ ] Login/Register pages
- [ ] Protected route wrapper
- [ ] Shadcn/UI installation
- [ ] Tailwind configuration
- **GIT COMMIT #3:** `feat: setup frontend auth pages with Shadcn UI`

**END OF DAY 1 - PUSH TO GITHUB (Phase 1)**
```bash
git push origin main
# Tag: v0.1.0-alpha
```

---

### **DAY 2: Core Features** (24 hours)
**Hours 25-32: Patient Management**
- [ ] Patient Mongoose model
- [ ] CRUD API endpoints
- [ ] Patient list page
- [ ] Add patient form
- [ ] Patient detail view
- **GIT COMMIT #4:** `feat: implement patient CRUD operations`

**Hours 33-40: Vitals Entry System**
- [ ] Vitals model with schema validation
- [ ] Template system (General/Cardiac/Diabetic)
- [ ] Dynamic form rendering
- [ ] Vitals submission API
- [ ] Last value display
- **GIT COMMIT #5:** `feat: add vitals entry with templates`

**Hours 41-48: Alert System**
- [ ] Alert model
- [ ] Rule engine service
- [ ] Threshold evaluation
- [ ] Alert creation on vitals submit
- [ ] Alert management UI
- **GIT COMMIT #6:** `feat: implement alert system with rule engine`

**END OF DAY 2 - PUSH TO GITHUB (Phase 2)**
```bash
git push origin main
# Tag: v0.2.0-beta
```

---

### **DAY 3: Advanced Features** (24 hours)
**Hours 49-56: Reminder System**
- [ ] Reminder model
- [ ] Node-cron scheduler service
- [ ] Automatic reminder generation
- [ ] Manual reminder creation
- [ ] Snooze/complete endpoints
- **GIT COMMIT #7:** `feat: add scheduler service with reminders`

**Hours 57-64: Sharing System**
- [ ] Share token model
- [ ] JWT-based share links
- [ ] Public patient view
- [ ] QR code generation
- [ ] Link revocation
- **GIT COMMIT #8:** `feat: implement secure sharing with QR codes`

**Hours 65-72: Export & Visualization**
- [ ] PDF export service
- [ ] CSV export service
- [ ] Trend charts with Recharts
- [ ] Data aggregation queries
- [ ] Download endpoints
- **GIT COMMIT #9:** `feat: add PDF/CSV export and trend charts`

**END OF DAY 3 - PUSH TO GITHUB (Phase 3)**
```bash
git push origin main
# Tag: v0.3.0-rc
```

---

### **DAY 4: Testing, Polish & Deployment** (24 hours)
**Hours 73-80: Testing**
- [ ] Unit tests for services
- [ ] API endpoint tests
- [ ] Frontend component tests
- [ ] Integration tests
- [ ] CodeRabbit review
- **GIT COMMIT #10:** `test: add comprehensive test suite`

**Hours 81-88: UI Polish & Branding**
- [ ] Consistent color scheme
- [ ] Loading states
- [ ] Error boundaries
- [ ] Animations with Framer Motion
- [ ] Responsive design fixes
- **GIT COMMIT #11:** `style: apply branding and polish UI`

**Hours 89-96: Deployment**
- [ ] Vercel frontend deployment
- [ ] Render backend deployment
- [ ] Environment variable configuration
- [ ] Production testing
- [ ] Documentation updates
- **GIT COMMIT #12:** `chore: production deployment configuration`

**END OF DAY 4 - FINAL PUSH & RELEASE**
```bash
git push origin main
git tag v1.0.0
git push origin v1.0.0
```

---

## 🔄 GIT WORKFLOW STRATEGY {#git-workflow}

### Repository Structure
```
manual-rpm/
├── .github/
│   └── workflows/
│       └── coderabbit.yml
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
├── docs/
│   ├── API.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
├── .gitignore
├── README.md
└── package.json
```

### Commit Convention (Conventional Commits)
```
<type>(<scope>): <subject>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

Examples:
feat(auth): add JWT token refresh endpoint
fix(alerts): correct threshold evaluation logic
docs(api): update patient endpoints documentation
test(vitals): add unit tests for vitals service
```

### When to Commit & Push

**COMMIT FREQUENCY:** Every 2-3 hours OR after completing a logical feature unit

**Phase 1 Commits (Day 1):**
```bash
# After project setup
git add .
git commit -m "feat: initial project setup with MongoDB config"

# After auth backend
git add backend/
git commit -m "feat: implement JWT authentication system"

# After auth frontend
git add frontend/
git commit -m "feat: setup frontend auth pages with Shadcn UI"

# Push to GitHub (end of Day 1)
git push origin main
git tag v0.1.0-alpha
git push origin v0.1.0-alpha
```

**Phase 2 Commits (Day 2):**
```bash
# After patient CRUD
git commit -m "feat: implement patient CRUD operations"

# After vitals system
git commit -m "feat: add vitals entry with templates"

# After alert system
git commit -m "feat: implement alert system with rule engine"

# Push to GitHub (end of Day 2)
git push origin main
git tag v0.2.0-beta
git push origin v0.2.0-beta
```

**Phase 3 Commits (Day 3):**
```bash
# After reminder system
git commit -m "feat: add scheduler service with reminders"

# After sharing system
git commit -m "feat: implement secure sharing with QR codes"

# After export features
git commit -m "feat: add PDF/CSV export and trend charts"

# Push to GitHub (end of Day 3)
git push origin main
git tag v0.3.0-rc
git push origin v0.3.0-rc
```

**Phase 4 Commits (Day 4):**
```bash
# After testing
git commit -m "test: add comprehensive test suite"

# After UI polish
git commit -m "style: apply branding and polish UI"

# After deployment
git commit -m "chore: production deployment configuration"

# Final push
git push origin main
git tag v1.0.0
git push origin v1.0.0
```

### .gitignore Configuration
```gitignore
# Node modules
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/
*.log

# IDE files
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/

# MongoDB
*.mongodb
```

---

## 🧪 TESTING STRATEGY {#testing}

### Testing Pyramid
```
       /\
      /  \  E2E Tests (testSprite)
     /    \
    /------\  Integration Tests (Jest + Supertest)
   /        \
  /----------\  Unit Tests (Jest)
 /__________\
```

### Tools & Frameworks

**1. Jest (Unit & Integration Tests)**
```bash
npm install --save-dev jest @types/jest supertest
```

**2. testSprite (AI-Powered Testing)**
- Automated UI testing
- Visual regression testing
- Accessibility testing

**3. CodeRabbit (AI Code Reviews)**
- Automatic PR reviews
- Code quality checks
- Security vulnerability scanning

### Test Structure

**Backend Tests (`backend/tests/`):**
```
tests/
├── unit/
│   ├── models/
│   │   ├── user.test.js
│   │   ├── patient.test.js
│   │   └── vitals.test.js
│   ├── services/
│   │   ├── ruleEngine.test.js
│   │   └── scheduler.test.js
│   └── utils/
│       └── validators.test.js
├── integration/
│   ├── auth.test.js
│   ├── patients.test.js
│   ├── vitals.test.js
│   └── alerts.test.js
└── setup.js
```

**Frontend Tests (`frontend/tests/`):**
```
tests/
├── components/
│   ├── LoginForm.test.jsx
│   ├── PatientList.test.jsx
│   └── VitalsForm.test.jsx
├── pages/
│   ├── Dashboard.test.jsx
│   └── PatientDetail.test.jsx
└── setup.js
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- user.test.js

# Run integration tests only
npm run test:integration

# Run testSprite tests
npx testsprite run
```

### Manual Testing Checklist (Day 4)
```
[ ] User Registration & Login
[ ] JWT token expiration handling
[ ] Patient CRUD operations
[ ] Vitals entry with validation
[ ] Alert generation on threshold breach
[ ] Reminder scheduling
[ ] Share link generation and access
[ ] PDF/CSV export downloads
[ ] Responsive design (mobile/tablet/desktop)
[ ] Cross-browser testing (Chrome, Firefox, Safari)
```

---

## 📊 MONGODB SCHEMA DESIGN {#mongodb-schema}

### Database Architecture

**Collections:**
1. users
2. patients
3. vitals
4. alerts
5. reminders
6. templates
7. sharedLinks
8. auditLogs

### Mongoose Schemas

**1. User Schema**
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'nurse', 'coordinator'],
    default: 'nurse'
  },
  phone: String,
  notificationPrefs: {
    automaticMode: { type: Boolean, default: true },
    manualTime: String,
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '07:00' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**2. Patient Schema**
```javascript
{
  mrn: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  ward: String,
  bed: String,
  consent: { type: Boolean, default: false },
  primaryNurse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  primaryDoctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  template: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Template' 
  },
  active: { type: Boolean, default: true },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**3. Vitals Schema**
```javascript
{
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient',
    required: true 
  },
  enteredBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  fieldValues: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
    // Example: { "heart_rate": 75, "blood_pressure_systolic": 120 }
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
}
```

**4. Alert Schema**
```javascript
{
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient',
    required: true 
  },
  vitalsEntry: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vitals' 
  },
  rule: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AlertRule' 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['new', 'acknowledged', 'resolved'],
    default: 'new'
  },
  message: String,
  acknowledgedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  notes: [String],
  createdAt: { type: Date, default: Date.now }
}
```

**5. Reminder Schema**
```javascript
{
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient',
    required: true 
  },
  targetFields: [String],
  scheduledTime: { type: Date, required: true },
  recurrenceRule: String, // "Q4h", "Q8h", "Daily", "Bedtime"
  assignedUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'snoozed', 'completed'],
    default: 'pending'
  },
  snoozeUntil: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
}
```

**6. Template Schema**
```javascript
{
  name: { type: String, required: true },
  description: String,
  fields: [{
    key: String,
    label: String,
    type: { 
      type: String, 
      enum: ['number', 'text', 'boolean', 'date'] 
    },
    unit: String,
    required: Boolean,
    defaultThresholds: {
      low: Number,
      high: Number,
      severityLow: String,
      severityHigh: String
    },
    frequency: String
  }],
  active: { type: Boolean, default: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { type: Date, default: Date.now }
}
```

**7. SharedLink Schema**
```javascript
{
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient',
    required: true 
  },
  token: { type: String, required: true, unique: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  accessLog: [{
    accessedAt: Date,
    ipAddress: String
  }],
  createdAt: { type: Date, default: Date.now }
}
```

**8. AuditLog Schema**
```javascript
{
  actor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  action: { type: String, required: true },
  targetModel: String,
  targetId: mongoose.Schema.Types.ObjectId,
  payload: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
}
```

### Indexes for Performance
```javascript
// Users
userSchema.index({ email: 1 });

// Patients
patientSchema.index({ mrn: 1 });
patientSchema.index({ ward: 1, active: 1 });
patientSchema.index({ primaryNurse: 1 });

// Vitals
vitalsSchema.index({ patient: 1, timestamp: -1 });
vitalsSchema.index({ enteredBy: 1 });

// Alerts
alertSchema.index({ patient: 1, status: 1 });
alertSchema.index({ createdAt: -1 });

// Reminders
reminderSchema.index({ scheduledTime: 1, status: 1 });
reminderSchema.index({ patient: 1 });

// SharedLinks
sharedLinkSchema.index({ token: 1 });
sharedLinkSchema.index({ expiresAt: 1 });

// AuditLogs
auditLogSchema.index({ actor: 1, createdAt: -1 });
```

---

## 🚀 IMPLEMENTED FEATURES {#features}

### Core Features (Implemented)

**1. Authentication & Authorization**
- ✅ JWT-based authentication with 1-hour expiry
- ✅ Role-based access control (Admin, Doctor, Nurse, Coordinator)
- ✅ Password hashing with bcryptjs (saltRounds: 10)
- ✅ Password validation (min 8 chars, letter + number)
- ✅ **Admin-only user registration** (public registration disabled)
- ✅ Auth middleware with token verification
- ✅ Protected routes on frontend with redirect

**2. Patient Management**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Unique Medical Record Number (MRN) validation
- ✅ Ward and bed assignment
- ✅ Primary nurse and doctor assignment
- ✅ Custom template assignment per patient
- ✅ **Patient discharge workflow with notes**
- ✅ **Patient readmission with new ward/bed assignment**
- ✅ **Admission history tracking**
- ✅ Patient search and filtering
- ✅ Active/inactive patient status

**3. Vitals Recording System**
- ✅ Dynamic form rendering based on templates
- ✅ Pre-built templates (General, Cardiac, Diabetic)
- ✅ Custom template creation
- ✅ Field values stored in flexible Map structure
- ✅ Automatic alert generation on threshold breach
- ✅ Vitals history with timeline view
- ✅ Latest vitals display on patient detail
- ✅ Vitals trend visualization (7-day charts)
- ✅ Notes/comments on vitals entries
- ✅ Recorded by user tracking

**4. Alert System**
- ✅ Automatic alert creation via rule engine
- ✅ Severity levels: Low, Medium, High, Critical
- ✅ Alert workflow: New → Acknowledged → Resolved
- ✅ Alert filtering by status and severity
- ✅ Alert acknowledgment with timestamp
- ✅ Resolution notes capability
- ✅ **Automatic alert resolution on patient discharge**
- ✅ Alert badges with color coding
- ✅ Alert count on dashboard

**5. Reminder System**
- ✅ Manual reminder creation
- ✅ **Automated reminder generation (daily 8 AM via node-cron)**
- ✅ Reminder types: Vitals Due, Medication, Appointment, General
- ✅ Priority levels: Low, Medium, High
- ✅ Reminder status: Pending → Sent → Snoozed → Completed
- ✅ **Email notifications on reminder creation**
- ✅ **Quiet hours support** (no notifications during quiet hours)
- ✅ Snooze functionality
- ✅ Auto-cleanup of overdue reminders (after 7 days)
- ✅ Custom time scheduling with date/time picker

**6. Dashboard & Analytics**
- ✅ **Optimized dashboard with single API call**
- ✅ Real-time statistics: Total patients, active patients, alerts, reminders
- ✅ **Critical alerts count** (High + Critical severity)
- ✅ **Overdue reminders count**
- ✅ Today's vitals recording count
- ✅ **Ward-wise patient distribution**
- ✅ Recent activity feed (last 5 vitals)
- ✅ Quick action buttons
- ✅ Responsive dashboard cards

**7. Sharing System**
- ✅ Secure JWT-based share links
- ✅ QR code generation for easy mobile access
- ✅ 7-day link expiration
- ✅ Public patient view (read-only)
- ✅ Access logging with IP and timestamp
- ✅ Link revocation capability
- ✅ Share modal with copy-to-clipboard

**8. Export & Reporting**
- ✅ PDF export with jsPDF
- ✅ CSV export functionality
- ✅ Patient vitals history export
- ✅ Formatted PDF reports with branding
- ✅ Auto-table generation for vitals data
- ✅ Export with date range filtering

**9. Template Management**
- ✅ Pre-built templates with default thresholds
- ✅ Custom template creation
- ✅ Template activation/deactivation
- ✅ Field configuration (name, type, unit, required)
- ✅ Threshold settings per field
- ✅ Template assignment to patients
- ✅ **Template CRUD operations**

**10. Notification System** (NEW ✨)
- ✅ **Email notifications via Nodemailer**
- ✅ **Gmail SMTP integration**
- ✅ **Professional HTML email templates**
- ✅ **Reminder notifications to assigned users**
- ✅ **Server-Sent Events (SSE) for real-time browser notifications**
- ✅ **SSE subscription endpoint with CORS handling**
- ✅ **Notification preferences in user settings**
- ✅ **Automatic/manual notification modes**
- ✅ **Quiet hours configuration**

**11. Admin Panel** (NEW ✨)
- ✅ **Admin-only user management interface**
- ✅ **Create new users (nurses, doctors, admins)**
- ✅ **View all users with role badges**
- ✅ **User deletion with confirmation**
- ✅ **Audit log viewer** (all system actions)
- ✅ **Audit log filtering** (by user, action, date)
- ✅ **System-wide activity monitoring**

**12. System Settings** (NEW ✨)
- ✅ **Ward/bed management system**
- ✅ **Add/edit/delete wards dynamically**
- ✅ **Bed configuration per ward**
- ✅ **Ward statistics** (patient count, occupancy)
- ✅ **Settings persistence in MongoDB**
- ✅ **Global configuration management**

**13. Security & Performance**
- ✅ **Rate limiting on API endpoints** (express-rate-limit)
- ✅ **Auth rate limiting** (20 req/15min)
- ✅ **General rate limiting** (500 req/15min)
- ✅ Input sanitization middleware
- ✅ Helmet security headers
- ✅ CORS with origin whitelisting
- ✅ Body size limits (10kb max)
- ✅ MongoDB indexes for performance
- ✅ Query optimization with parallel execution

**14. Audit & Compliance**
- ✅ **Comprehensive audit logging**
- ✅ **Action tracking** (CREATE, UPDATE, DELETE, etc.)
- ✅ **User activity tracking**
- ✅ **IP address and user agent logging**
- ✅ **Audit trail for all critical operations**
- ✅ **Searchable audit logs**
- ✅ **Date-range filtering**

### API Endpoints (Complete List)

**Authentication:**
- `POST /api/v1/auth/register` - Register user (Admin only)
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/users` - Get all users (Admin only)
- `DELETE /api/v1/auth/users/:id` - Delete user (Admin only)

**Patients:**
- `GET /api/v1/patients` - List all patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient (soft delete)
- `POST /api/v1/patients/:id/discharge` - Discharge patient (✅ Implemented)
  - Body: `{ notes: string (optional) }`
  - Auto-resolves alerts, cancels reminders
  - Adds to admission history
- `POST /api/v1/patients/:id/readmit` - Readmit patient (✅ Implemented)
  - Body: `{ ward: string (required), bed: string (optional), notes: string (optional) }`
  - Creates new admission record

**Vitals:**
- `GET /api/v1/vitals` - List all vitals
- `POST /api/v1/vitals` - Submit vitals entry
- `GET /api/v1/vitals/patient/:patientId` - Get patient vitals
- `GET /api/v1/vitals/patient/:patientId/latest` - Get latest vitals
- `GET /api/v1/vitals/patient/:patientId/trends` - Get vitals trends
- `GET /api/v1/vitals/stats` - Get vitals statistics
- `DELETE /api/v1/vitals/:id` - Delete vitals entry

**Templates:**
- `GET /api/v1/templates` - List all templates
- `POST /api/v1/templates` - Create template
- `GET /api/v1/templates/:id` - Get template
- `PUT /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template

**Alerts:**
- `GET /api/v1/alerts` - List alerts with filters
- `PUT /api/v1/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/v1/alerts/:id/resolve` - Resolve alert
- `DELETE /api/v1/alerts/:id` - Delete alert

**Reminders:**
- `GET /api/v1/reminders` - List reminders
- `POST /api/v1/reminders` - Create reminder
- `PUT /api/v1/reminders/:id/snooze` - Snooze reminder
- `PUT /api/v1/reminders/:id/complete` - Complete reminder
- `DELETE /api/v1/reminders/:id` - Delete reminder

**Dashboard:**
- `GET /api/v1/dashboard/stats` - Get all dashboard statistics
- `GET /api/v1/dashboard/recent-alerts` - Get recent alerts
- `GET /api/v1/dashboard/recent-vitals` - Get recent vitals

**Sharing:**
- `POST /api/v1/share/generate` - Generate share link
- `GET /api/v1/share/patient/:token` - Get public patient data
- `DELETE /api/v1/share/:id` - Revoke share link

**Export:**
- `GET /api/v1/export/patient/:id/pdf` - Export patient PDF
- `GET /api/v1/export/patient/:id/csv` - Export patient CSV

**Settings:**
- `GET /api/v1/settings` - Get system settings (Admin)
- `PUT /api/v1/settings` - Update settings (Admin)
- `GET /api/v1/settings/wards` - Get wards list
- `POST /api/v1/settings/wards` - Add ward (Admin)
- `PUT /api/v1/settings/wards/:name` - Update ward (Admin)
- `DELETE /api/v1/settings/wards/:name` - Delete ward (Admin)

**Audit:**
- `GET /api/v1/audit` - Get audit logs (Admin)
- `GET /api/v1/audit/:id` - Get specific audit log

**Notifications:**
- `GET /api/v1/notifications/subscribe` - Subscribe to SSE
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PUT /api/v1/notifications/:id/read` - Mark notification as read

---

## 🎨 BRANDING GUIDELINES {#branding}

### Brand Identity

**Product Name:** Manual-RPM  
**Tagline:** "Simplified Patient Monitoring for Healthcare Teams"  
**Mission:** Replace fragmented paper logs with intuitive digital workflows

### Visual Identity

**Color Palette:**
```css
/* Primary Colors */
--color-primary: #3B82F6;      /* Blue 500 - Trust, Medical */
--color-primary-dark: #2563EB; /* Blue 600 - Hover states */
--color-primary-light: #DBEAFE; /* Blue 100 - Backgrounds */

/* Semantic Colors */
--color-success: #10B981;      /* Green 500 - Positive actions */
--color-warning: #F59E0B;      /* Amber 500 - Caution */
--color-danger: #EF4444;       /* Red 500 - Critical alerts */
--color-info: #06B6D4;         /* Cyan 500 - Information */

/* Neutral Colors */
--color-gray-50: #F9FAFB;      /* Backgrounds */
--color-gray-100: #F3F4F6;     /* Card backgrounds */
--color-gray-200: #E5E7EB;     /* Borders */
--color-gray-400: #9CA3AF;     /* Disabled text */
--color-gray-600: #4B5563;     /* Secondary text */
--color-gray-900: #111827;     /* Primary text */

/* Severity Colors */
--alert-low: #D1FAE5;          /* Green 100 */
--alert-medium: #FEF3C7;       /* Amber 100 */
--alert-high: #FEE2E2;         /* Red 100 */
--alert-critical: #DC2626;     /* Red 600 */
```

**Typography:**
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Spacing System:**
```css
/* Tailwind-based spacing */
0.5: 0.125rem  /* 2px */
1:   0.25rem   /* 4px */
2:   0.5rem    /* 8px */
3:   0.75rem   /* 12px */
4:   1rem      /* 16px */
6:   1.5rem    /* 24px */
8:   2rem      /* 32px */
12:  3rem      /* 48px */
16:  4rem      /* 64px */
```

**Border Radius:**
```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Large cards */
--radius-full: 9999px;  /* Pills, badges */
```

### UI Components Style Guide

**Buttons:**
```jsx
// Primary Button
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
  Save Patient
</button>

// Secondary Button
<button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
  Cancel
</button>

// Danger Button
<button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
  Delete
</button>
```

**Cards:**
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  {/* Card content */}
</div>
```

**Badges:**
```jsx
// Status badges
<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Active
</span>

// Severity badges
<span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
  Critical
</span>
```

**Form Inputs:**
```jsx
<input 
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Enter patient name"
/>
```

### Logo & Assets

**Logo Guidelines:**
- Use a medical cross or heart icon combined with monitoring waveform
- Color: Primary blue (#3B82F6)
- Minimum size: 32x32px
- Clear space: Equal to the height of the logo on all sides

**Icon Usage:**
- Use Lucide React icons for consistency
- Icon size: 20px (default), 24px (prominent actions)
- Icon color: Inherit from parent or use semantic colors

### Animation Guidelines

**Framer Motion Presets:**
```jsx
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Card hover
const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

// Button tap
const buttonTap = {
  scale: 0.95
};
```

**Animation Principles:**
- Duration: 200-300ms for micro-interactions
- Easing: `ease-in-out` for most animations
- Avoid excessive animations on critical actions
- Use `prefers-reduced-motion` media query for accessibility

### Accessibility Standards

**WCAG 2.1 Level AA Compliance:**
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text (18px+)
- All interactive elements keyboard accessible
- Focus indicators visible (2px solid blue)
- Alt text for all images
- ARIA labels for icon-only buttons

---

## ✅ QUALITY ASSURANCE CHECKLIST {#qa-checklist}

### Code Quality

**Day 1 Checklist:**
```
[ ] MongoDB connection established
[ ] Environment variables configured
[ ] User model with validation
[ ] Password hashing implemented
[ ] JWT generation working
[ ] Auth middleware protecting routes
[ ] Login page functional
[ ] Register page functional
[ ] Token stored in localStorage
[ ] Protected routes redirect to login
```

**Day 2 Checklist:**
```
[ ] Patient CRUD endpoints tested
[ ] Mongoose validation working
[ ] Patient list page loads data
[ ] Add patient form validates inputs
[ ] Patient detail page displays correctly
[ ] Vitals submission saves to database
[ ] Template fields render dynamically
[ ] Last vitals value displayed
[ ] Alert created on threshold breach
[ ] Alert list page functional
```

**Day 3 Checklist:**
```
[ ] Node-cron scheduler running
[ ] Reminders generated automatically
[ ] Snooze endpoint functional
[ ] Complete endpoint functional
[ ] Share token generated correctly
[ ] Public patient view accessible
[ ] QR code displays properly
[ ] PDF export downloads
[ ] CSV export downloads
[ ] Trend charts render data
```

**Day 4 Checklist:**
```
[ ] All tests passing
[ ] CodeRabbit review addressed
[ ] testSprite results reviewed
[ ] UI responsive on mobile
[ ] UI responsive on tablet
[ ] Animations smooth
[ ] Loading states implemented
[ ] Error messages user-friendly
[ ] No console errors
[ ] Production build successful
```

### Security Checklist
```
[✅] Passwords hashed with bcrypt (saltRounds: 10)
[✅] JWT secret in environment variable
[✅] JWT expiration set (1 hour)
[✅] Auth middleware validates tokens
[✅] Input validation on all endpoints
[✅] SQL injection prevention (Mongoose)
[✅] XSS prevention (React escapes by default)
[✅] CORS configured for frontend origin only
[✅] Helmet middleware applied
[✅] Rate limiting implemented (express-rate-limit)
[✅] Body size limits (10kb max)
[✅] Input sanitization middleware
[✅] Admin-only routes protected
[✅] HTTPS enforced in production
```

### Performance Checklist
```
[ ] MongoDB indexes created
[ ] API responses < 500ms (median)
[ ] Frontend bundle size < 1MB
[ ] Images optimized
[ ] Lazy loading for routes
[ ] Debounced search inputs
[ ] Pagination for large lists
[ ] Caching for static data
```

### Deployment Checklist
```
[ ] Environment variables set on Render
[ ] Environment variables set on Vercel
[ ] MongoDB Atlas whitelist configured
[ ] Production build tested locally
[ ] API base URL configured for production
[ ] CORS origins updated for production
[ ] Health check endpoint responsive
[ ] Error logging configured
[ ] Backup strategy documented
```

---

## 📚 ADDITIONAL RESOURCES

### MongoDB Atlas Setup
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account (no credit card required)
3. Create cluster (M0 free tier)
4. Add database user (username + password)
5. Whitelist IP address (0.0.0.0/0 for development)
6. Get connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

### Environment Variables Template

**Backend (.env):**
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/manual-rpm?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=1h

# Server
PORT=5001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Scheduler
SCHEDULER_ENABLED=true

# Email Notifications (Optional - Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_APP_NAME=Manual-RPM
```

### Email Configuration (Gmail)

To enable email notifications:

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Vitalis Notifications"
   - Copy the 16-character password
   - Use this as `EMAIL_PASS` (remove spaces)

3. **Update .env file**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx  # App password from step 2
   ```

4. **Test Email**
   - Create a reminder - you should receive an email
   - Check spam folder if not in inbox

### Helpful Commands

**MongoDB Mongoose Connection:**
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
```

**JWT Token Generation:**
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
};
```

**Password Hashing:**
```javascript
const bcrypt = require('bcryptjs');

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isMatch = await bcrypt.compare(password, user.password);
```

---

## 🎯 SUCCESS CRITERIA

### Day 1 Success:
- ✅ Can register new user
- ✅ Can login and receive JWT
- ✅ Protected routes require authentication
- ✅ MongoDB connection stable

### Day 2 Success:
- ✅ Can create, read, update, delete patients
- ✅ Can submit vitals entry
- ✅ Alerts generated on threshold violations
- ✅ UI navigable and functional

### Day 3 Success:
- ✅ Reminders created automatically
- ✅ Share links generate and work
- ✅ Can export patient data (PDF/CSV)
- ✅ Charts display vitals trends

### Day 4 Success:
- ✅ All tests passing (>80% coverage)
- ✅ No critical bugs
- ✅ Deployed and accessible online
- ✅ Documentation complete

---

## 📞 SUPPORT & NEXT STEPS

After completing this 4-day build:

**Week 2: Pilot Testing**
- Deploy to real ward with 10-20 patients
- Gather nurse feedback
- Fix critical issues

**Week 3-4: Iteration**
- Implement feedback
- Add missing features
- Performance optimization

**Month 2+: Scale**
- Multi-ward deployment
- Advanced analytics
- Mobile app (React Native)

---

**Document Version:** 3.0.0  
**Last Updated:** December 23, 2025  
**Status:** ✅ Production Ready  
**Author:** Karthik Yernana
