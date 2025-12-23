const request = require('supertest');
const express = require('express');
const User = require('../../src/models/User');
const Patient = require('../../src/models/Patient');
const patientRoutes = require('../../src/routes/patient.routes');
const { generateToken } = require('../../src/utils/jwt');

const app = express();
app.use(express.json());
app.use('/api/v1/patients', patientRoutes);

describe('Patient API Integration Tests', () => {
  let nurseToken, doctorToken, adminToken;
  let nurseUser, doctorUser, adminUser;

  beforeEach(async () => {
    // Create test users
    nurseUser = await User.create({
      email: 'nurse@test.com',
      password: 'Nurse123',
      name: 'Test Nurse',
      role: 'nurse'
    });

    doctorUser = await User.create({
      email: 'doctor@test.com',
      password: 'Doctor123',
      name: 'Test Doctor',
      role: 'doctor'
    });

    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'Admin123',
      name: 'Test Admin',
      role: 'admin'
    });

    nurseToken = generateToken(nurseUser._id);
    doctorToken = generateToken(doctorUser._id);
    adminToken = generateToken(adminUser._id);
  });

  describe('POST /api/v1/patients', () => {
    test('should create new patient with valid data', async () => {
      const patientData = {
        mrn: 'MRN001',
        name: 'John Doe',
        dob: '1990-01-15',
        gender: 'male',
        ward: 'ICU-1',
        bed: 'A1',
        consent: true,
        template: 'general'
      };

      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(patientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patient.mrn).toBe('MRN001');
      expect(response.body.data.patient.name).toBe('John Doe');
    });

    test('should reject duplicate MRN', async () => {
      await Patient.create({
        mrn: 'MRN002',
        name: 'Jane Doe',
        dob: new Date('1985-05-20'),
        gender: 'female',
        ward: 'ICU-1',
        bed: 'A2',
        consent: true
      });

      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          mrn: 'MRN002',
          name: 'Another Patient',
          dob: '1990-01-01',
          gender: 'male',
          ward: 'ICU-2',
          bed: 'B1'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/patients')
        .send({
          mrn: 'MRN003',
          name: 'Test Patient',
          dob: '1990-01-01',
          gender: 'male',
          ward: 'ICU-1'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          mrn: 'MRN004',
          name: 'Incomplete Patient'
          // Missing dob, gender, ward
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/patients', () => {
    beforeEach(async () => {
      await Patient.create([
        {
          mrn: 'MRN010',
          name: 'Patient One',
          dob: new Date('1990-01-01'),
          gender: 'male',
          ward: 'ICU-1',
          bed: 'A1',
          active: true
        },
        {
          mrn: 'MRN011',
          name: 'Patient Two',
          dob: new Date('1985-05-15'),
          gender: 'female',
          ward: 'ICU-2',
          bed: 'B2',
          active: true
        }
      ]);
    });

    test('should return list of patients', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patients).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should filter by ward', async () => {
      const response = await request(app)
        .get('/api/v1/patients?ward=ICU-1')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patients).toHaveLength(1);
      expect(response.body.data.patients[0].ward).toBe('ICU-1');
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/patients?page=1&limit=1')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patients).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/v1/patients/:id', () => {
    test('should return patient details', async () => {
      const patient = await Patient.create({
        mrn: 'MRN020',
        name: 'Detailed Patient',
        dob: new Date('1992-03-10'),
        gender: 'male',
        ward: 'ICU-1',
        bed: 'C1'
      });

      const response = await request(app)
        .get(`/api/v1/patients/${patient._id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patient.mrn).toBe('MRN020');
      expect(response.body.data.patient._id).toBe(patient._id.toString());
    });

    test('should return 404 for non-existent patient', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/patients/${fakeId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/patients/:id', () => {
    test('should update patient information', async () => {
      const patient = await Patient.create({
        mrn: 'MRN030',
        name: 'Update Patient',
        dob: new Date('1988-07-20'),
        gender: 'female',
        ward: 'ICU-1',
        bed: 'D1'
      });

      const response = await request(app)
        .put(`/api/v1/patients/${patient._id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          name: 'Updated Name',
          bed: 'D2'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patient.name).toBe('Updated Name');
      expect(response.body.data.patient.bed).toBe('D2');
      expect(response.body.data.patient.mrn).toBe('MRN030'); // MRN unchanged
    });

    test('should not allow MRN changes', async () => {
      const patient = await Patient.create({
        mrn: 'MRN040',
        name: 'Protected MRN',
        dob: new Date('1995-11-30'),
        gender: 'male',
        ward: 'ICU-2',
        bed: 'E1'
      });

      const response = await request(app)
        .put(`/api/v1/patients/${patient._id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          mrn: 'MRN041',
          name: 'Trying to Change MRN'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('MRN');
    });
  });

  describe('DELETE /api/v1/patients/:id', () => {
    test('should allow doctor to soft delete patient', async () => {
      const patient = await Patient.create({
        mrn: 'MRN050',
        name: 'Delete Patient',
        dob: new Date('1980-04-05'),
        gender: 'male',
        ward: 'ICU-1',
        bed: 'F1'
      });

      const response = await request(app)
        .delete(`/api/v1/patients/${patient._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify soft delete
      const deletedPatient = await Patient.findById(patient._id);
      expect(deletedPatient.active).toBe(false);
    });

    test('should allow admin to delete patient', async () => {
      const patient = await Patient.create({
        mrn: 'MRN051',
        name: 'Admin Delete',
        dob: new Date('1975-12-25'),
        gender: 'female',
        ward: 'ICU-2',
        bed: 'G1'
      });

      const response = await request(app)
        .delete(`/api/v1/patients/${patient._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject nurse deletion attempts', async () => {
      const patient = await Patient.create({
        mrn: 'MRN052',
        name: 'Nurse Cannot Delete',
        dob: new Date('1970-08-10'),
        gender: 'male',
        ward: 'ICU-1',
        bed: 'H1'
      });

      const response = await request(app)
        .delete(`/api/v1/patients/${patient._id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
