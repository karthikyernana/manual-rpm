# 🧪 Testing Guide - Manual-RPM

Complete guide for testing the Manual-RPM healthcare application.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Writing New Tests](#writing-new-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run All Tests
```bash
# Backend (from backend/)
npm test

# Frontend (from frontend/)
npm test -- --run

# Both (from root)
cd backend && npm test && cd ../frontend && npm test
```

### Test Results
- **Backend**: 53 tests in 5 suites
- **Frontend**: 57 tests in 3 suites
- **Total**: 110 tests, 100% passing

---

## Backend Testing

### Test Structure
```
backend/tests/
├── setup.js                    # MongoDB Memory Server setup
├── test.env.js                 # Test environment variables
├── unit/
│   ├── user.test.js           # User model tests (16)
│   └── alert.test.js          # Alert model tests (8)
└── integration/
    ├── auth.test.js           # Auth API tests (11)
    ├── patient.test.js        # Patient API tests (14)
    └── vitals.test.js         # Vitals + Alert tests (12)
```

### Test Commands

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/unit/user.test.js

# Run tests matching pattern
npm test -- --testNamePattern="password"

# Verbose output
npm test -- --verbose
```

### Test Environment

**Automatic Setup**:
- MongoDB Memory Server (in-memory database)
- Test environment variables loaded
- Database cleaned before each test
- Connections properly closed after tests

**Environment Variables** (`test.env.js`):
```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-...';
process.env.JWT_EXPIRY = '1h';
process.env.FRONTEND_URL = 'http://localhost:5173';
```

### Writing Backend Tests

#### Unit Test Example (Model)
```javascript
// tests/unit/reminder.test.js
const Reminder = require('../../src/models/Reminder');

describe('Reminder Model', () => {
  test('should calculate next occurrence for Q4h', () => {
    const now = new Date('2025-12-23T08:00:00Z');
    const next = Reminder.calculateNextOccurrence('Q4h', now);
    expect(next).toEqual(new Date('2025-12-23T12:00:00Z'));
  });

  test('should validate recurrence pattern enum', async () => {
    const reminder = new Reminder({
      patient: '507f1f77bcf86cd799439011',
      type: 'vitals',
      recurrence: 'Invalid'
    });

    await expect(reminder.validate()).rejects.toThrow();
  });
});
```

#### Integration Test Example (API)
```javascript
// tests/integration/reminder.test.js
const request = require('supertest');
const express = require('express');
const Reminder = require('../../src/models/Reminder');
const { generateToken } = require('../../src/utils/jwt');

const app = express();
app.use(express.json());
app.use('/api/v1/reminders', reminderRoutes);

describe('Reminder API', () => {
  let nurseToken, patientId;

  beforeEach(async () => {
    const nurse = await User.create({
      email: 'nurse@test.com',
      password: 'Nurse123',
      role: 'nurse'
    });
    nurseToken = generateToken(nurse._id);

    const patient = await Patient.create({
      mrn: 'MRN100',
      name: 'Test Patient'
    });
    patientId = patient._id;
  });

  test('POST /reminders - should create reminder', async () => {
    const response = await request(app)
      .post('/api/v1/reminders')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        patient: patientId,
        type: 'vitals',
        recurrence: 'Q4h',
        message: 'Check vitals'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.reminder.type).toBe('vitals');
  });

  test('GET /reminders - should require authentication', async () => {
    await request(app)
      .get('/api/v1/reminders')
      .expect(401);
  });
});
```

### Test Best Practices

#### Do's ✅
- Clean database in `beforeEach` hook
- Use descriptive test names
- Test both success and error cases
- Mock external services (email, SMS)
- Use proper HTTP status codes
- Validate response structure
- Test authentication/authorization

#### Don'ts ❌
- Don't use production database
- Don't skip cleanup
- Don't test implementation details
- Don't make tests dependent on each other
- Don't hardcode IDs (use generated ones)
- Don't leave console.log statements

---

## Frontend Testing

### Test Structure
```
frontend/tests/
├── setup.js                           # RTL + mocks setup
├── components/
│   └── Navbar.test.jsx               # Navbar tests (2)
├── pages/
│   └── LoginPage.test.jsx            # LoginPage tests (4)
└── utils/
    └── validation.test.js            # Validation tests (51)
```

### Test Commands

```bash
# Run all tests
npm test -- --run

# Watch mode (default)
npm test

# Interactive UI
npm run test:ui

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/pages/LoginPage.test.jsx

# Run tests matching pattern
npm test -- --grep="login"
```

### Test Environment

**Automatic Setup**:
- jsdom for browser environment
- localStorage mock
- matchMedia mock
- IntersectionObserver mock
- React Testing Library cleanup

**Mocks** (`tests/setup.js`):
```javascript
// localStorage mock
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value },
  removeItem: (key) => { delete store[key] },
  clear: () => { store = {} }
};

// window.matchMedia mock
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  addListener: () => {},
  removeListener: () => {}
});
```

### Writing Frontend Tests

#### Component Test Example
```javascript
// tests/components/AlertBadge.test.jsx
import { render, screen } from '@testing-library/react';
import AlertBadge from '../../src/components/AlertBadge';

describe('AlertBadge', () => {
  test('renders critical severity with red color', () => {
    render(<AlertBadge severity="critical" />);
    
    const badge = screen.getByText(/critical/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500');
  });

  test('renders high severity with orange color', () => {
    render(<AlertBadge severity="high" />);
    
    const badge = screen.getByText(/high/i);
    expect(badge).toHaveClass('bg-orange-500');
  });
});
```

#### Page Test Example
```javascript
// tests/pages/PatientsPage.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PatientsPage from '../../src/pages/PatientsPage';
import { AuthProvider } from '../../src/context/AuthContext';
import api from '../../src/services/api';

vi.mock('../../src/services/api');

describe('PatientsPage', () => {
  test('loads and displays patients', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          patients: [
            { _id: '1', name: 'John Doe', mrn: 'MRN001' },
            { _id: '2', name: 'Jane Smith', mrn: 'MRN002' }
          ]
        }
      }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <PatientsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('filters patients by search term', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <PatientsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('John');
    });
  });
});
```

#### Utility Test Example
```javascript
// tests/utils/dateFormatter.test.js
import { formatDate, formatTime } from '../../src/utils/dateFormatter';

describe('Date Formatter', () => {
  test('formats date correctly', () => {
    const date = new Date('2025-12-23T14:30:00Z');
    expect(formatDate(date)).toBe('Dec 23, 2025');
  });

  test('formats time correctly', () => {
    const date = new Date('2025-12-23T14:30:00Z');
    expect(formatTime(date)).toBe('2:30 PM');
  });
});
```

### React Testing Library Queries

**Priority Order**:
1. `getByRole` - Accessibility-first
2. `getByLabelText` - Form fields
3. `getByPlaceholderText` - Inputs
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

**Query Variants**:
- `getBy` - Throws error if not found
- `queryBy` - Returns null if not found
- `findBy` - Async, waits for element

### Test Best Practices

#### Do's ✅
- Test user behavior, not implementation
- Use accessible queries (role, label)
- Wait for async operations
- Mock API calls
- Test error states
- Use userEvent for interactions
- Clean up after tests

#### Don'ts ❌
- Don't test internal state
- Don't use implementation details
- Don't test styling directly
- Don't make snapshot tests brittle
- Don't skip accessibility
- Don't forget loading states

---

## Writing New Tests

### When to Write Tests

**Always test**:
- New features
- Bug fixes
- API endpoints
- Critical business logic
- User authentication/authorization
- Data validation
- Error handling

**Consider testing**:
- Complex utilities
- Reusable components
- Data transformations
- Integrations

### Test Structure Pattern

```javascript
describe('Feature/Component Name', () => {
  // Setup
  beforeEach(() => {
    // Reset state, create test data
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Specific Functionality', () => {
    test('should do something specific', () => {
      // Arrange - Set up test data
      // Act - Perform action
      // Assert - Verify result
    });

    test('should handle error case', () => {
      // Test error scenarios
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {});
    test('should handle null values', () => {});
    test('should handle large datasets', () => {});
  });
});
```

### Test Coverage Goals

**Target Coverage**:
- Statements: > 70%
- Branches: > 70%
- Functions: > 70%
- Lines: > 70%

**Focus Areas**:
- 100% coverage: Authentication, authorization, payment
- 90%+ coverage: Critical business logic, data validation
- 70%+ coverage: UI components, utilities
- 50%+ coverage: Simple helpers, formatters

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
      - run: cd backend && npm run test:coverage
      - uses: codecov/codecov-action@v3

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --run
      - run: cd frontend && npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests before commit
cd backend && npm test && cd ../frontend && npm test -- --run

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ All tests passed"
  exit 0
else
  echo "❌ Tests failed. Commit aborted."
  exit 1
fi
```

---

## Troubleshooting

### Common Issues

#### Backend

**Issue**: `MongoMemoryServer: Unable to start`
```bash
# Solution: Clear MongoDB binaries cache
rm -rf ~/.cache/mongodb-binaries
npm test
```

**Issue**: `JWT must have a value`
```bash
# Solution: Check test.env.js is loaded
# Verify tests/test.env.js exists
# Check setupFilesAfterEnv in jest.config.js
```

**Issue**: Tests timeout
```bash
# Solution: Increase timeout in jest.config.js
module.exports = {
  testTimeout: 60000  // 60 seconds
};
```

#### Frontend

**Issue**: `localStorage is not defined`
```bash
# Solution: Check tests/setup.js has localStorage mock
# Verify setupFiles in vitest.config.js
```

**Issue**: `window.matchMedia is not a function`
```bash
# Solution: Add matchMedia mock to tests/setup.js
# See "Test Environment" section above
```

**Issue**: Can't find component imports
```bash
# Solution: Check path aliases in vite.config.js
# Verify imports use correct relative paths
```

### Debugging Tests

#### Backend
```javascript
// Add console.log to see values
test('should do something', () => {
  console.log('Current value:', value);
  expect(value).toBe(expected);
});

// Use .only to run single test
test.only('debug this test', () => {
  // Only this test runs
});

// Use debugger
test('should debug', () => {
  debugger;  // Pause execution
  expect(true).toBe(true);
});
```

#### Frontend
```javascript
// Debug component output
test('should render', () => {
  const { debug } = render(<Component />);
  debug();  // Prints DOM to console
});

// Check what's rendered
test('should find element', () => {
  render(<Component />);
  screen.debug();  // Prints entire document
  screen.debug(screen.getByText('text'));  // Prints specific element
});
```

### Getting Help

1. **Read error messages carefully** - They usually tell you exactly what's wrong
2. **Check existing tests** - Look for similar test patterns
3. **Review documentation**:
   - Jest: https://jestjs.io/docs/getting-started
   - Vitest: https://vitest.dev/guide/
   - React Testing Library: https://testing-library.com/react
4. **Ask team members** - Share error messages and test code

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

### Best Practices
- [Testing JavaScript](https://testingjavascript.com/)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog/testing)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Tools
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Codecov](https://codecov.io/) - Coverage reports
- [TestSprite](https://testsprite.com/) - E2E testing

---

**Last Updated**: December 23, 2025  
**Tests Passing**: 110/110 ✅  
**Coverage**: Backend ~60%, Frontend ~40%
