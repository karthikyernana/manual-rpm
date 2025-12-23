# Manual-RPM AI Coding Assistant Guide

## Project Overview
Manual-RPM is a healthcare patient monitoring dashboard built with the MERN stack (MongoDB, Express, React, Node.js). This is a **4-day sprint project** (96 hours) designed for solo developers to rebuild a production-ready patient vitals tracking system.

## Architecture Overview

### Tech Stack
- **Frontend**: React 18.2+ (JavaScript, NOT TypeScript), Vite, Tailwind CSS, Shadcn/UI, Framer Motion, React Router v6
- **Backend**: Node.js 18+ with Express, Mongoose ODM
- **Database**: MongoDB Atlas (Free M0 tier)
- **Deployment**: Vercel (frontend), Render (backend), MongoDB Atlas (database)
- **Testing**: Jest + Supertest (backend), React Testing Library (frontend), CodeRabbit (AI reviews), testSprite (E2E)

### Project Structure
```
manual-rpm/
├── frontend/     # React app with Vite
├── backend/      # Express API server
└── docs/         # Comprehensive project documentation
```

## Core Patterns & Conventions

### MongoDB Schema Design
All Mongoose models follow this structure:
- Use timestamps: `{ timestamps: true }` for `createdAt`/`updatedAt`
- Reference relationships with `mongoose.Schema.Types.ObjectId` and `.ref()`
- Pre-save hooks for password hashing: `userSchema.pre('save', async function...)`
- Indexes for performance: `schema.index({ email: 1 })`

**Key Collections**: `users`, `patients`, `vitals`, `alerts`, `reminders`, `templates`, `sharedLinks`, `auditLogs`

### Authentication Pattern
- JWT-based auth with tokens stored in `localStorage` (frontend)
- Token format: `Bearer <token>` in Authorization header
- Auth middleware: `protect` (verifies JWT), `authorize(...roles)` (checks roles)
- Password security: bcrypt with saltRounds of 10
- JWT expiry: 1 hour default

### API Response Format
All endpoints return consistent structure:
```javascript
// Success
{ success: true, data: {...} }

// Error
{ success: false, message: "Error description" }
```

### Git Workflow (Critical!)
Follow **Conventional Commits** format:
- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `test(scope): description` - Adding tests
- `style(scope): description` - UI/formatting changes
- `chore(scope): description` - Maintenance

**Commit frequency**: Every 2-3 hours or after completing a logical feature unit
**Push phases**: End of Day 1 (v0.1.0-alpha), Day 2 (v0.2.0-beta), Day 3 (v0.3.0-rc), Day 4 (v1.0.0)

## Critical Development Workflows

### Environment Setup
**Backend `.env` essentials**:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
PORT=5001
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env` essentials**:
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

### Running the Application
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Testing
npm run test:unit        # Backend unit tests
npm run test:integration # Backend API tests
npm test                 # Frontend tests
```

### Alert System Architecture
The alert system uses a **rule-based engine** that evaluates vitals against thresholds:
1. Vitals submitted → stored in `vitals` collection with `fieldValues` Map
2. Alert rules (stored in template `defaultThresholds`) check each field
3. If threshold breached → create Alert document with severity (low/medium/high/critical)
4. Frontend displays alerts in real-time on dashboard

### Reminder Scheduler
Uses `node-cron` for automatic reminders:
- Recurrence patterns: "Q4h", "Q8h", "Daily", "Bedtime"
- Quiet hours respected: `quietHoursStart` to `quietHoursEnd` from user preferences
- Status flow: `pending` → `sent` → (`snoozed`) → `completed`

### Secure Sharing System
Patient data sharing via JWT tokens:
1. Generate unique token for patient + expiration time
2. Store in `sharedLinks` collection with `expiresAt` timestamp
3. Public route validates token before displaying read-only patient view
4. QR code generated for easy mobile access
5. Access logged in `accessLog` array for audit trail

## Testing Strategy

### Test Pyramid Ratios
- 70% Unit tests (fast, isolated functions)
- 20% Integration tests (API endpoints with database)
- 10% E2E tests (full user workflows via testSprite)

### Writing Tests
**Backend tests** go in `backend/src/**/*.test.js`:
```javascript
describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({}); // Clean database
  });
  
  test('POST /api/v1/auth/register - should register new user', async () => {
    const response = await request(app).post('/api/v1/auth/register')...
  });
});
```

**Frontend tests** use React Testing Library:
```javascript
test('renders login form', () => {
  render(<Login />);
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
});
```

## UI/UX Patterns

### Color System (Healthcare Theme)
- Primary: `#3B82F6` (blue-600) - Trust, medical
- Success: `#10B981` (green-500) - Normal vitals
- Warning: `#F59E0B` (amber-500) - Threshold warnings
- Danger: `#EF4444` (red-500) - Critical alerts
- Neutral: Gray scale for backgrounds/text

### Component Library
Use **Shadcn/UI** for consistency - install via CLI:
```bash
npx shadcn-ui@latest add button card input
```

### Animation Guidelines
Framer Motion presets for consistency:
- Page transitions: 200-300ms with `opacity` + `y` offset
- Hover effects: `scale: 1.02` on cards
- Button taps: `scale: 0.95`
- Always respect `prefers-reduced-motion`

## Data Flow Patterns

### Vitals Entry Flow
1. Select patient → loads active `template` with fields
2. Render dynamic form from `template.fields` array
3. On submit → validate → POST `/api/v1/vitals` with `fieldValues` Map
4. Backend evaluates alert rules → creates alerts if needed
5. Frontend shows success + any triggered alerts

### Patient Management
- MRN (Medical Record Number) is unique identifier
- Each patient assigned to `primaryNurse` and `primaryDoctor`
- Patient status: `active: true/false` for soft deletes
- Ward/bed assignments for physical location tracking

## Important Conventions

### Date Handling
- Always store as `Date` type in MongoDB
- Frontend displays with local timezone
- Use ISO 8601 format for API transfers

### Error Handling
- Backend: try-catch blocks → return `{ success: false, message }`
- Frontend: Display user-friendly messages, log technical details to console
- Never expose stack traces to users in production

### Security Best Practices
- Input validation: `express-validator` on all endpoints
- Helmet middleware for security headers
- CORS restricted to `FRONTEND_URL` only
- Mongoose prevents NoSQL injection by default
- React escapes XSS by default

## Key Documentation References
- **start_here.md**: Central navigation hub, 4-day timeline overview
- **prd_mongodb.md**: Complete technical spec, MongoDB schemas, API endpoints
- **get_started_guide.md**: Step-by-step implementation with code examples
- **testing_guide.md**: Testing fundamentals, Jest/Supertest setup
- **deploy_brand_guide.md**: Deployment steps, branding guidelines

## AI Agent Best Practices
1. **Before writing code**: Check if implementation already exists in docs/
2. **Schema changes**: Always update Mongoose model + validation rules together
3. **New endpoints**: Follow REST conventions, add to API documentation
4. **Testing**: Write tests as you code features (Day 2 onwards)
5. **Commits**: Use conventional format with appropriate scope
6. **Styling**: Use Tailwind utility classes, reference color system above
7. **Dependencies**: Verify package is in docs/ tech stack before installing

## Common Pitfalls to Avoid
- ❌ Don't use TypeScript (project is JavaScript-only)
- ❌ Don't bypass auth middleware on protected routes
- ❌ Don't store sensitive data (JWT secrets, passwords) in code
- ❌ Don't mutate Mongoose documents directly (use `.save()` or `.update()`)
- ❌ Don't forget to clean test database in `beforeEach()` hooks
- ❌ Don't skip input validation on backend (frontend validation is not enough)
