const request = require('supertest');
const express = require('express');
const User = require('../../src/models/User');
const Patient = require('../../src/models/Patient');
const Vitals = require('../../src/models/Vitals');
const Alert = require('../../src/models/Alert');
const vitalsRoutes = require('../../src/routes/vitals.routes');
const { generateToken } = require('../../src/utils/jwt');

const app = express();
app.use(express.json());
app.use('/api/v1/vitals', vitalsRoutes);

describe('Vitals & Alert Integration Tests', () => {
  let nurseToken, patient;

  beforeEach(async () => {
    const nurse = await User.create({
      email: 'nurse@test.com',
      password: 'Nurse123',
      name: 'Test Nurse',
      role: 'nurse'
    });

    nurseToken = generateToken(nurse._id);

    patient = await Patient.create({
      mrn: 'MRN100',
      name: 'Test Patient',
      dob: new Date('1985-06-15'),
      gender: 'male',
      ward: 'ICU-1',
      bed: 'A1',
      template: 'general'
    });
  });

  describe('POST /api/v1/vitals - Create Vitals Entry', () => {
    test('should record normal vitals without creating alert', async () => {
      const vitalsData = {
        patient: patient._id,
        template: 'general',
        vitals: {
          temperature: 98.6,
          heartRate: 75,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          oxygenSaturation: 98,
          respiratoryRate: 16
        },
        notes: 'All vitals normal'
      };

      const response = await request(app)
        .post('/api/v1/vitals')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(vitalsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vitals.flagged).toBe(false);

      // Verify no alert was created
      const alerts = await Alert.find({ patient: patient._id });
      expect(alerts).toHaveLength(0);
    });

    test('should flag abnormal vitals and create alert', async () => {
      const vitalsData = {
        patient: patient._id,
        template: 'general',
        vitals: {
          temperature: 103.5, // High fever
          heartRate: 120, // Elevated
          bloodPressureSystolic: 160, // High
          bloodPressureDiastolic: 95, // High
          oxygenSaturation: 92, // Low
          respiratoryRate: 24 // Elevated
        },
        notes: 'Patient showing signs of distress'
      };

      const response = await request(app)
        .post('/api/v1/vitals')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(vitalsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vitals.flagged).toBe(true);
      expect(response.body.data.vitals.flaggedFields.length).toBeGreaterThan(0);

      // Verify alert was created
      const alerts = await Alert.find({ patient: patient._id });
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].status).toBe('active');
      expect(['medium', 'high', 'critical']).toContain(alerts[0].severity);
    });

    test('should create critical alert for extremely high values', async () => {
      const vitalsData = {
        patient: patient._id,
        template: 'general',
        vitals: {
          temperature: 105.0, // Dangerously high
          heartRate: 180, // Very high
          bloodPressureSystolic: 200, // Extremely high
          bloodPressureDiastolic: 120, // Extremely high
          oxygenSaturation: 85, // Very low
          respiratoryRate: 35 // Very high
        }
      };

      const response = await request(app)
        .post('/api/v1/vitals')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(vitalsData)
        .expect(201);

      expect(response.body.data.vitals.flagged).toBe(true);

      const alerts = await Alert.find({ patient: patient._id });
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('critical');
    });

    test('should handle cardiac template vitals', async () => {
      patient.template = 'cardiac';
      await patient.save();

      const vitalsData = {
        patient: patient._id,
        template: 'cardiac',
        vitals: {
          heartRate: 65,
          bloodPressureSystolic: 115,
          bloodPressureDiastolic: 75,
          oxygenSaturation: 97,
          temperature: 98.2,
          weight: 180,
          edema: 0,
          chestPain: false
        }
      };

      const response = await request(app)
        .post('/api/v1/vitals')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(vitalsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vitals.template).toBe('cardiac');
    });

    test('should create critical alert for chest pain', async () => {
      patient.template = 'cardiac';
      await patient.save();

      const vitalsData = {
        patient: patient._id,
        template: 'cardiac',
        vitals: {
          heartRate: 85,
          bloodPressureSystolic: 130,
          bloodPressureDiastolic: 85,
          oxygenSaturation: 96,
          temperature: 98.6,
          weight: 185,
          edema: 1,
          chestPain: true // Critical symptom
        }
      };

      const response = await request(app)
        .post('/api/v1/vitals')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(vitalsData)
        .expect(201);

      expect(response.body.data.vitals.flagged).toBe(true);

      const alerts = await Alert.find({ patient: patient._id });
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('critical');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/vitals')
        .send({
          patient: patient._id,
          template: 'general',
          vitals: { heartRate: 75 }
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should validate patient exists', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post('/api/v1/vitals')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patient: fakeId,
          template: 'general',
          vitals: { heartRate: 75 }
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/vitals/patient/:patientId', () => {
    beforeEach(async () => {
      // Create sample vitals history
      await Vitals.create([
        {
          patient: patient._id,
          template: 'general',
          vitals: { heartRate: 72, temperature: 98.6 },
          recordedBy: (await User.findOne({ email: 'nurse@test.com' }))._id,
          recordedAt: new Date('2025-12-20T08:00:00Z')
        },
        {
          patient: patient._id,
          template: 'general',
          vitals: { heartRate: 78, temperature: 98.9 },
          recordedBy: (await User.findOne({ email: 'nurse@test.com' }))._id,
          recordedAt: new Date('2025-12-21T08:00:00Z')
        },
        {
          patient: patient._id,
          template: 'general',
          vitals: { heartRate: 75, temperature: 98.4 },
          recordedBy: (await User.findOne({ email: 'nurse@test.com' }))._id,
          recordedAt: new Date('2025-12-22T08:00:00Z')
        }
      ]);
    });

    test('should return patient vitals history', async () => {
      const response = await request(app)
        .get(`/api/v1/vitals/patient/${patient._id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vitals).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/v1/vitals/patient/${patient._id}?page=1&limit=2`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.data.vitals).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    test('should filter by flagged status', async () => {
      // Create flagged vitals
      const flaggedVitals = await Vitals.create({
        patient: patient._id,
        template: 'general',
        vitals: { heartRate: 150, temperature: 103 },
        recordedBy: (await User.findOne({ email: 'nurse@test.com' }))._id,
        flagged: true,
        flaggedFields: [{ field: 'heartRate', value: 150 }]
      });

      const response = await request(app)
        .get(`/api/v1/vitals/patient/${patient._id}?flagged=true`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const flaggedResults = response.body.data.vitals.filter(v => v.flagged);
      expect(flaggedResults.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/vitals/patient/:patientId/latest', () => {
    test('should return most recent vitals', async () => {
      await Vitals.create([
        {
          patient: patient._id,
          template: 'general',
          vitals: { heartRate: 70 },
          recordedBy: (await User.findOne({ email: 'nurse@test.com' }))._id,
          recordedAt: new Date('2025-12-20T08:00:00Z')
        },
        {
          patient: patient._id,
          template: 'general',
          vitals: { heartRate: 85 },
          recordedBy: (await User.findOne({ email: 'nurse@test.com' }))._id,
          recordedAt: new Date('2025-12-23T08:00:00Z')
        }
      ]);

      const response = await request(app)
        .get(`/api/v1/vitals/patient/${patient._id}/latest`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vitals.vitals.heartRate).toBe(85);
    });

    test('should return null for patient with no vitals', async () => {
      const newPatient = await Patient.create({
        mrn: 'MRN101',
        name: 'New Patient',
        dob: new Date('1990-01-01'),
        gender: 'female',
        ward: 'ICU-2',
        bed: 'B1'
      });

      const response = await request(app)
        .get(`/api/v1/vitals/patient/${newPatient._id}/latest`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vitals).toBeNull();
    });
  });
});
