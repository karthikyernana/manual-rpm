const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const authRoutes = require('../../src/routes/auth.routes');
const { generateToken } = require('../../src/utils/jwt');

// Create minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth API Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should require admin auth to register new user', async () => {
      const userData = {
        email: 'nurse@hospital.com',
        password: 'Password123',
        name: 'Test Nurse',
        role: 'nurse'
      };

      // Try to register without auth token
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should allow admin to register new user', async () => {
      // Create admin user
      const admin = await User.create({
        email: 'admin@hospital.com',
        password: 'Admin123',
        name: 'Admin User',
        role: 'admin'
      });

      const token = generateToken(admin._id);

      const userData = {
        email: 'nurse@hospital.com',
        password: 'Password123',
        name: 'Test Nurse',
        role: 'nurse'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should reject registration with duplicate email', async () => {
      // Create admin
      const admin = await User.create({
        email: 'admin@hospital.com',
        password: 'Admin123',
        name: 'Admin User',
        role: 'admin'
      });

      const token = generateToken(admin._id);

      // Create first user
      await User.create({
        email: 'duplicate@hospital.com',
        password: 'Password123',
        name: 'First User',
        role: 'nurse'
      });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'duplicate@hospital.com',
          password: 'Password123',
          name: 'Duplicate User',
          role: 'nurse'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        email: 'login@hospital.com',
        password: 'Password123',
        name: 'Login Test User',
        role: 'nurse'
      });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@hospital.com',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('login@hospital.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@hospital.com',
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@hospital.com',
          password: 'Password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: 'me@hospital.com',
        password: 'Password123',
        name: 'Me Test User',
        role: 'nurse'
      });

      token = generateToken(user._id);
    });

    test('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('me@hospital.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/users (Admin Only)', () => {
    let adminToken;
    let nurseToken;

    beforeEach(async () => {
      const admin = await User.create({
        email: 'admin@hospital.com',
        password: 'Password123',
        name: 'Admin User',
        role: 'admin'
      });

      const nurse = await User.create({
        email: 'nurse@hospital.com',
        password: 'Password123',
        name: 'Nurse User',
        role: 'nurse'
      });

      adminToken = generateToken(admin._id);
      nurseToken = generateToken(nurse._id);
    });

    test('should allow admin to view all users', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThan(0);
      
      // Verify no passwords in response
      response.body.data.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    test('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('authorized');
    });
  });
});
