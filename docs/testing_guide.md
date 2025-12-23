# TESTING GUIDE - Manual-RPM
## Comprehensive Testing Strategy with CodeRabbit & testSprite

**Purpose:** Learn all testing types, frameworks, and tools for the Manual-RPM project  
**Audience:** Solo developer with beginner-intermediate experience  
**Tools:** Jest, Supertest, React Testing Library, CodeRabbit, testSprite  

---

## 📚 TABLE OF CONTENTS

1. [Testing Fundamentals](#fundamentals)
2. [Testing Types Explained](#types)
3. [Backend Testing Setup](#backend-testing)
4. [Frontend Testing Setup](#frontend-testing)
5. [Using CodeRabbit for AI Reviews](#coderabbit)
6. [Using testSprite for Automation](#testsprite)
7. [Manual Testing Checklist](#manual-testing)
8. [CI/CD Testing Pipeline](#cicd)

---

## 🎓 TESTING FUNDAMENTALS {#fundamentals}

### What is Testing?
Testing is the process of verifying that your code works as expected and doesn't break when changes are made.

### Why Test?
- **Catch bugs early** - Find issues before users do
- **Confidence in changes** - Refactor without fear
- **Documentation** - Tests show how code should work
- **Quality assurance** - Ensure features meet requirements

### The Testing Pyramid

```
       /\
      /E2E\     <- Few, slow, expensive (testSprite)
     /____\
    /      \
   /Integr.\   <- Some, medium speed (Supertest)
  /________\
 /          \
/Unit Tests  \  <- Many, fast, cheap (Jest)
/______________\
```

**Bottom Layer (Unit Tests - 70%):**
- Test individual functions/methods
- Fast execution (milliseconds)
- Easy to write and maintain
- Example: Testing password hashing function

**Middle Layer (Integration Tests - 20%):**
- Test multiple components working together
- Medium speed (seconds)
- Test API endpoints with database
- Example: Testing login endpoint

**Top Layer (E2E Tests - 10%):**
- Test complete user workflows
- Slow execution (minutes)
- Test through UI like a real user
- Example: Testing full patient registration flow

---

## 🧩 TESTING TYPES EXPLAINED {#types}

### 1. Unit Testing
**What:** Test individual functions in isolation  
**When:** For utilities, helpers, pure functions  
**Tool:** Jest

**Example:**
```javascript
// utils/validators.js
export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

// utils/validators.test.js
import { isValidEmail } from './validators';

describe('Email Validator', () => {
  test('should return true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  test('should return false for invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});
```

### 2. Integration Testing
**What:** Test multiple units working together  
**When:** For API endpoints, database operations  
**Tool:** Jest + Supertest

**Example:**
```javascript
// routes/auth.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth API', () => {
  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({});
  });

  test('POST /api/v1/auth/register - should register new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.token).toBeDefined();
  });

  test('POST /api/v1/auth/login - should login existing user', async () => {
    // First create a user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    // Then try to login
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### 3. Component Testing
**What:** Test React components in isolation  
**When:** For reusable UI components  
**Tool:** React Testing Library

**Example:**
```javascript
// components/LoginForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('LoginForm Component', () => {
  test('should render email and password inputs', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('should show error for invalid email', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  test('should call onSubmit with form data', () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### 4. End-to-End (E2E) Testing
**What:** Test complete user workflows through UI  
**When:** For critical user journeys  
**Tool:** testSprite, Playwright, Cypress

**Example (testSprite):**
```javascript
// tests/e2e/patient-registration.spec.js
import { test, expect } from '@testsprite/test';

test('should register new patient successfully', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:5173/login');
  await page.fill('[name="email"]', 'nurse@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard');
  
  // Click Add Patient button
  await page.click('text=Add Patient');
  
  // Fill patient form
  await page.fill('[name="mrn"]', 'MRN-2025-001');
  await page.fill('[name="name"]', 'John Doe');
  await page.fill('[name="dob"]', '1965-04-15');
  await page.selectOption('[name="gender"]', 'male');
  await page.fill('[name="ward"]', 'ICU-2');
  await page.fill('[name="bed"]', '12');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Verify patient appears in list
  await expect(page.locator('text=John Doe')).toBeVisible();
  await expect(page.locator('text=MRN-2025-001')).toBeVisible();
});
```

---

## 🔧 BACKEND TESTING SETUP {#backend-testing}

### Step 1: Install Testing Dependencies

```bash
cd backend
npm install --save-dev jest supertest mongodb-memory-server
```

**Package explanations:**
- `jest` - Testing framework
- `supertest` - HTTP testing library
- `mongodb-memory-server` - In-memory MongoDB for tests

### Step 2: Configure Jest

Create `backend/jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/**/*.test.js'
  ],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### Step 3: Create Test Setup File

`backend/tests/setup.js`:
```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Connect to in-memory database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
```

### Step 4: Create Test Directory Structure

```bash
cd backend
mkdir -p tests/unit tests/integration
```

### Step 5: Write Your First Unit Test

`backend/tests/unit/jwt.test.js`:
```javascript
const { generateToken, verifyToken } = require('../../src/utils/jwt');

describe('JWT Utilities', () => {
  const userId = '507f1f77bcf86cd799439011';

  test('should generate a token', () => {
    const token = generateToken(userId);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('should verify a valid token', () => {
    const token = generateToken(userId);
    const decoded = verifyToken(token);
    
    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe(userId);
  });

  test('should return null for invalid token', () => {
    const decoded = verifyToken('invalid-token');
    expect(decoded).toBeNull();
  });
});
```

### Step 6: Write Your First Integration Test

`backend/tests/integration/auth.test.js`:
```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'nurse'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    test('should fail with duplicate email', async () => {
      // Create first user
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password456',
          name: 'Another User'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    test('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

### Step 7: Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration"
  }
}
```

### Step 8: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

**Reading Test Output:**
```
PASS  tests/unit/jwt.test.js
  JWT Utilities
    ✓ should generate a token (5ms)
    ✓ should verify a valid token (3ms)
    ✓ should return null for invalid token (2ms)

PASS  tests/integration/auth.test.js
  Auth Endpoints
    POST /api/v1/auth/register
      ✓ should register a new user successfully (234ms)
      ✓ should fail with duplicate email (187ms)
      ✓ should fail with invalid email (95ms)

Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        5.234 s
```

---

## 🎨 FRONTEND TESTING SETUP {#frontend-testing}

### Step 1: Install Testing Dependencies

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### Step 2: Configure Vitest

Create `frontend/vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Step 3: Create Test Setup

`frontend/tests/setup.js`:
```javascript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {},
};
global.localStorage = localStorageMock;
```

### Step 4: Write Component Tests

`frontend/src/components/LoginForm.test.jsx`:
```javascript
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

// Helper to render with Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginForm', () => {
  test('renders login form elements', () => {
    renderWithRouter(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows validation error for empty fields', async () => {
    renderWithRouter(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('shows error for invalid email format', async () => {
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  test('calls onSubmit with form data when valid', async () => {
    const handleSubmit = vi.fn();
    renderWithRouter(<LoginForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

### Step 5: Add Test Scripts

`frontend/package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🤖 USING CODERABBIT FOR AI REVIEWS {#coderabbit}

### What is CodeRabbit?
CodeRabbit is an AI-powered code review tool that automatically reviews your pull requests and provides suggestions.

### Step 1: Enable CodeRabbit on GitHub

1. Go to https://coderabbit.ai/
2. Click "Sign in with GitHub"
3. Authorize CodeRabbit
4. Select your `manual-rpm` repository
5. Click "Install"

### Step 2: Create CodeRabbit Configuration

Create `.coderabbit.yaml` in project root:
```yaml
# CodeRabbit Configuration
reviews:
  auto_review: true
  request_changes_workflow: true
  
  # What to review
  path_filters:
    include:
      - "**/*.js"
      - "**/*.jsx"
      - "**/*.json"
    exclude:
      - "**/node_modules/**"
      - "**/dist/**"
      - "**/build/**"

  # Review focus areas
  review_profile: "chill"  # Options: assertive, chill, pythonic
  
  # Auto-merge safe PRs
  auto_merge:
    enabled: false
    
  # Custom instructions
  instructions: |
    - Focus on security vulnerabilities
    - Check for MongoDB injection risks
    - Verify JWT handling is secure
    - Suggest performance improvements
    - Check for React best practices
```

### Step 3: Create a Pull Request

```bash
# Create a new branch for your feature
git checkout -b feature/patient-crud

# Make changes...
# ... code patient CRUD ...

# Commit changes
git add .
git commit -m "feat: implement patient CRUD operations"

# Push to GitHub
git push origin feature/patient-crud
```

### Step 4: Create PR on GitHub

1. Go to your repository on GitHub
2. Click "Compare & pull request"
3. Fill in title: "feat: implement patient CRUD operations"
4. Fill in description:
```markdown
## Changes
- Added Patient model with validation
- Implemented CRUD endpoints
- Added tests for patient routes

## Testing
- [x] Unit tests passing
- [x] Integration tests passing
- [x] Manual testing completed

## Screenshots
(Add if applicable)
```
5. Click "Create pull request"

### Step 5: CodeRabbit Reviews Your PR

Within 1-2 minutes, CodeRabbit will:
- Analyze all changed files
- Add inline comments with suggestions
- Create a summary comment
- Rate code quality

**Example CodeRabbit Comment:**
```
🤖 CodeRabbit Review Summary

Overall: 85/100 - Good code quality

✅ Strengths:
- Proper input validation
- Good error handling
- Comprehensive tests

⚠️ Suggestions:
- Consider adding rate limiting to endpoints
- Use parameterized queries to prevent NoSQL injection
- Add JSDoc comments for public methods

📝 Details:
- 12 files changed
- 450 lines added
- 23 comments generated
```

### Step 6: Respond to CodeRabbit Comments

1. Read each suggestion
2. Click "Resolve" if you agree and fix it
3. Reply if you disagree and explain why
4. Push new commits to address feedback

```bash
# Make fixes based on CodeRabbit feedback
git add .
git commit -m "fix: address CodeRabbit security suggestions"
git push origin feature/patient-crud
```

### Step 7: Merge PR

Once CodeRabbit approves and all checks pass:
1. Click "Merge pull request"
2. Choose "Squash and merge" (keeps history clean)
3. Delete the feature branch

---

## 🧪 USING TESTSPRITE FOR AUTOMATION {#testsprite}

### What is testSprite?
testSprite is an AI-powered testing platform that generates and runs E2E tests automatically.

### Step 1: Install testSprite CLI

```bash
npm install -g @testsprite/cli

# Login
testsprite login
```

### Step 2: Initialize testSprite in Project

```bash
cd manual-rpm
testsprite init

# Follow prompts:
# Project name: Manual-RPM
# Test directory: tests/e2e
# Base URL: http://localhost:5173
```

This creates `testsprite.config.js`:
```javascript
module.exports = {
  projectName: 'Manual-RPM',
  baseUrl: 'http://localhost:5173',
  testDir: 'tests/e2e',
  
  // Browser configuration
  browsers: ['chromium', 'firefox', 'webkit'],
  
  // Screenshot on failure
  screenshot: 'only-on-failure',
  
  // Video recording
  video: 'retain-on-failure',
  
  // Test timeout
  timeout: 30000,
  
  // Parallel execution
  workers: 2,
};
```

### Step 3: Generate Tests with AI

```bash
# Start your application
npm run dev  # Backend on 5001
cd frontend && npm run dev  # Frontend on 5173

# In new terminal, generate tests
testsprite generate --flow "user-registration"
```

testSprite will:
1. Open your app in browser
2. Record you performing the registration flow
3. Generate test code automatically

**OR manually write tests:**

`tests/e2e/authentication.spec.js`:
```javascript
const { test, expect } = require('@testsprite/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register new user', async ({ page }) => {
    // Click register link
    await page.click('text=Register');
    
    // Fill form
    await page.fill('[name="name"]', 'Test Nurse');
    await page.fill('[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'password123');
    await page.selectOption('[name="role"]', 'nurse');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/dashboard');
    
    // Verify logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    // Go to login
    await page.click('text=Login');
    
    // Fill credentials
    await page.fill('[name="email"]', 'nurse@test.com');
    await page.fill('[name="password"]', 'password123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirect
    await page.waitForURL('**/dashboard');
    
    // Check user name displayed
    await expect(page.locator('text=Test Nurse')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await expect(page.url()).toContain('/login');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

### Step 4: Run testSprite Tests

```bash
# Run all E2E tests
testsprite run

# Run specific test file
testsprite run tests/e2e/authentication.spec.js

# Run in headed mode (see browser)
testsprite run --headed

# Run with specific browser
testsprite run --browser=chromium

# Generate HTML report
testsprite run --reporter=html
```

### Step 5: View Test Results

After tests run, you'll see:
```
Running 3 tests using 2 workers

  ✓ Authentication Flow › should register new user (4.2s)
  ✓ Authentication Flow › should login existing user (2.1s)
  ✓ Authentication Flow › should show error for invalid credentials (1.8s)

  3 passed (8.1s)
```

HTML report opens automatically in browser showing:
- Test results
- Screenshots of failures
- Video recordings
- Performance metrics

---

## ✅ MANUAL TESTING CHECKLIST {#manual-testing}

### Day 1 Testing Checklist
```
Authentication:
[ ] Can register with valid email/password
[ ] Cannot register with existing email
[ ] Cannot register with invalid email format
[ ] Cannot register with short password (<6 chars)
[ ] Can login with correct credentials
[ ] Cannot login with wrong password
[ ] Cannot login with non-existent email
[ ] Token stored in localStorage after login
[ ] User redirected to dashboard after login
[ ] Can access /api/v1/auth/me with valid token
[ ] Cannot access /api/v1/auth/me without token
[ ] Token expires after 1 hour
[ ] Expired token redirects to login
```

### Day 2 Testing Checklist
```
Patient Management:
[ ] Can view patient list
[ ] Can add new patient with all required fields
[ ] Cannot add patient with missing required fields
[ ] Cannot add patient with duplicate MRN
[ ] Can edit patient details
[ ] Can delete patient (with confirmation)
[ ] Can search patients by name/MRN
[ ] Can filter patients by ward
[ ] Patient list shows correct data
[ ] Pagination works (if >10 patients)

Vitals Entry:
[ ] Can submit vitals for a patient
[ ] Cannot submit vitals without timestamp
[ ] Cannot submit vitals with invalid values
[ ] Last vitals value displayed correctly
[ ] Notes field accepts text
[ ] Vitals saved to database correctly
[ ] Vitals appear in patient history
```

### Day 3 Testing Checklist
```
Alerts:
[ ] Alert created when threshold exceeded
[ ] Alert shows correct severity
[ ] Can acknowledge alert
[ ] Can resolve alert
[ ] Can add note to alert
[ ] Alerts filtered by status work
[ ] Alert badge shows count on patient card

Reminders:
[ ] Automatic reminders generated based on schedule
[ ] Manual reminder can be created
[ ] Can snooze reminder
[ ] Can complete reminder
[ ] Quiet hours respected
[ ] Reminder status updates correctly

Sharing:
[ ] Can generate share link for patient
[ ] Share link works without login
[ ] Share link shows patient data
[ ] Share link shows vitals history
[ ] Share link shows active alerts
[ ] Share link expires after set time
[ ] Can revoke share link
[ ] QR code generated correctly
[ ] QR code scannable on mobile
```

### Day 4 Testing Checklist
```
Export:
[ ] Can download PDF report
[ ] PDF contains patient demographics
[ ] PDF contains vitals table
[ ] PDF contains alerts section
[ ] Can download CSV export
[ ] CSV contains all vitals data
[ ] CSV opens correctly in Excel

Charts:
[ ] Trend chart displays for heart rate
[ ] Trend chart displays for blood pressure
[ ] Trend chart shows correct time range
[ ] Chart tooltip shows values on hover
[ ] Chart responsive on mobile

General:
[ ] All pages responsive on mobile
[ ] All pages responsive on tablet
[ ] No console errors
[ ] Loading states show properly
[ ] Error messages user-friendly
[ ] Success messages show
[ ] Navigation works
[ ] Logout clears token
```

---

## 🔄 CI/CD TESTING PIPELINE {#cicd}

### Step 1: Create GitHub Actions Workflow

`.github/workflows/test.yml`:
```yaml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
        
      - name: Run unit tests
        working-directory: ./backend
        run: npm run test:unit
        
      - name: Run integration tests
        working-directory: ./backend
        run: npm run test:integration
        
      - name: Generate coverage
        working-directory: ./backend
        run: npm run test:coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage/coverage-final.json
          
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Run tests
        working-directory: ./frontend
        run: npm test
        
      - name: Generate coverage
        working-directory: ./frontend
        run: npm run test:coverage
        
  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
          
      - name: Start backend
        working-directory: ./backend
        run: npm start &
        
      - name: Start frontend
        working-directory: ./frontend
        run: npm run dev &
        
      - name: Wait for services
        run: |
          npx wait-on http://localhost:5001/api/health
          npx wait-on http://localhost:5173
          
      - name: Run E2E tests
        run: testsprite run
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-results
          path: test-results/
```

### Step 2: Enable Actions

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click "I understand my workflows, go ahead and enable them"

### Step 3: Push Code

```bash
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions test pipeline"
git push origin main
```

GitHub Actions will now:
- Run tests on every push
- Run tests on every PR
- Show test results in PR
- Block merge if tests fail

---

## 📊 COVERAGE GOALS

**Target Coverage by Day:**
- **Day 2:** 60% backend coverage
- **Day 3:** 75% backend coverage, 50% frontend coverage
- **Day 4:** 80% backend coverage, 70% frontend coverage

**Priority:**
- Critical paths: 90%+ coverage (auth, patient CRUD, vitals entry)
- Business logic: 80%+ coverage (rule engine, scheduler)
- UI components: 70%+ coverage
- Utility functions: 90%+ coverage

---

## 🎯 TESTING BEST PRACTICES

1. **Write tests as you code** - Don't leave all testing for Day 4
2. **Test behavior, not implementation** - Test what the code does, not how
3. **Keep tests simple** - One concept per test
4. **Use descriptive test names** - "should register user with valid data" vs "test1"
5. **Follow AAA pattern** - Arrange, Act, Assert
6. **Mock external dependencies** - Don't call real APIs in tests
7. **Don't test third-party code** - Trust React, Express, etc. work
8. **Test edge cases** - Empty strings, null values, large numbers
9. **Run tests frequently** - Catch bugs early
10. **Maintain tests** - Update tests when features change

---

**Document Version:** 1.0.0  
**Last Updated:** December 16, 2025  
**Next Review:** After Day 4 testing phase
