// Test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-not-production';
process.env.JWT_EXPIRY = '1h';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';
