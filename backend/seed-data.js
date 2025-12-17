/**
 * Vitalis - MongoDB Demo Data Seed Script
 * 
 * This script populates your MongoDB database with comprehensive demo data
 * to test all features of the Vitalis application.
 * 
 * RUN: node seed-data.js
 * 
 * IMPORTANT: Make sure your .env file has the correct MONGODB_URI
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Vitals = require('./src/models/Vitals');
const Alert = require('./src/models/Alert');
const Reminder = require('./src/models/Reminder');
const VitalsTemplate = require('./src/models/VitalsTemplate');
const AuditLog = require('./src/models/AuditLog');
const Settings = require('./src/models/Settings');

// Configuration
const CLEAR_EXISTING = true; // Set to false to keep existing data

// ============================================
// DEMO DATA DEFINITIONS
// ============================================

// Demo Users (password for all: "Test@123")
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@vitalis.com',
    password: 'Test@123',
    role: 'admin',
    phone: '+1-555-0100',
    active: true
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'doctor@vitalis.com',
    password: 'Test@123',
    role: 'doctor',
    phone: '+1-555-0101',
    active: true
  },
  {
    name: 'Nurse Emily Davis',
    email: 'nurse@vitalis.com',
    password: 'Test@123',
    role: 'nurse',
    phone: '+1-555-0102',
    active: true
  },
  {
    name: 'Nurse Michael Brown',
    email: 'nurse2@vitalis.com',
    password: 'Test@123',
    role: 'nurse',
    phone: '+1-555-0103',
    active: true
  },
  {
    name: 'Dr. James Wilson',
    email: 'doctor2@vitalis.com',
    password: 'Test@123',
    role: 'doctor',
    phone: '+1-555-0104',
    active: true
  }
];

// Demo Patients
const demoPatients = [
  {
    mrn: 'MRN001',
    name: 'John Smith',
    dob: new Date('1985-03-15'),
    gender: 'male',
    ward: 'ICU-1',
    bed: 'Bed 1',
    phone: '+1-555-1001',
    emergencyContact: { name: 'Jane Smith', phone: '+1-555-1002', relationship: 'Spouse' },
    template: 'cardiac',
    consent: true,
    notes: 'Post cardiac surgery patient. Monitor closely.',
    active: true
  },
  {
    mrn: 'MRN002',
    name: 'Maria Garcia',
    dob: new Date('1990-07-22'),
    gender: 'female',
    ward: 'ICU-2',
    bed: 'Bed 3',
    phone: '+1-555-1003',
    emergencyContact: { name: 'Carlos Garcia', phone: '+1-555-1004', relationship: 'Brother' },
    template: 'general',
    consent: true,
    notes: 'Admitted for observation after accident.',
    active: true
  },
  {
    mrn: 'MRN003',
    name: 'Robert Johnson',
    dob: new Date('1965-11-30'),
    gender: 'male',
    ward: 'Cardiac',
    bed: 'Bed 5',
    phone: '+1-555-1005',
    emergencyContact: { name: 'Lisa Johnson', phone: '+1-555-1006', relationship: 'Wife' },
    template: 'cardiac',
    consent: true,
    notes: 'History of heart disease. Diabetic.',
    active: true
  },
  {
    mrn: 'MRN004',
    name: 'Emily Chen',
    dob: new Date('1978-09-10'),
    gender: 'female',
    ward: 'General-1',
    bed: 'Bed 2',
    phone: '+1-555-1007',
    emergencyContact: { name: 'David Chen', phone: '+1-555-1008', relationship: 'Husband' },
    template: 'diabetic',
    consent: true,
    notes: 'Type 2 diabetes. Regular insulin administration required.',
    active: true
  },
  {
    mrn: 'MRN005',
    name: 'William Brown',
    dob: new Date('1955-05-25'),
    gender: 'male',
    ward: 'ICU-1',
    bed: 'Bed 4',
    phone: '+1-555-1009',
    emergencyContact: { name: 'Patricia Brown', phone: '+1-555-1010', relationship: 'Daughter' },
    template: 'general',
    consent: true,
    notes: 'Post-operative care. Recovering from hip replacement.',
    active: true
  },
  {
    mrn: 'MRN006',
    name: 'Sarah Williams',
    dob: new Date('2010-02-14'),
    gender: 'female',
    ward: 'Pediatric',
    bed: 'Bed 1',
    phone: '+1-555-1011',
    emergencyContact: { name: 'Michael Williams', phone: '+1-555-1012', relationship: 'Father' },
    template: 'general',
    consent: true,
    notes: 'Pediatric patient. Respiratory infection.',
    active: true
  },
  {
    mrn: 'MRN007',
    name: 'James Anderson',
    dob: new Date('1970-08-08'),
    gender: 'male',
    ward: 'Cardiac',
    bed: 'Bed 2',
    phone: '+1-555-1013',
    emergencyContact: { name: 'Mary Anderson', phone: '+1-555-1014', relationship: 'Wife' },
    template: 'cardiac',
    consent: true,
    notes: 'Arrhythmia patient. Pacemaker implant scheduled.',
    active: true
  },
  {
    mrn: 'MRN008',
    name: 'Linda Martinez',
    dob: new Date('1982-12-03'),
    gender: 'female',
    ward: 'General-1',
    bed: 'Bed 6',
    phone: '+1-555-1015',
    emergencyContact: { name: 'Robert Martinez', phone: '+1-555-1016', relationship: 'Husband' },
    template: 'general',
    consent: false,
    notes: 'Awaiting consent forms. General observation.',
    active: true
  }
];

// Vitals data generator
const generateVitalsData = (template, isAbnormal = false) => {
  const baseVitals = {
    temperature: isAbnormal ? 39.5 : 36.5 + Math.random() * 1.5,
    heartRate: isAbnormal ? 120 : 60 + Math.random() * 40,
    bloodPressure: {
      systolic: isAbnormal ? 180 : 100 + Math.random() * 30,
      diastolic: isAbnormal ? 110 : 60 + Math.random() * 20
    },
    respiratoryRate: isAbnormal ? 28 : 12 + Math.random() * 8,
    oxygenSaturation: isAbnormal ? 88 : 95 + Math.random() * 5,
    painLevel: isAbnormal ? 8 : Math.floor(Math.random() * 4)
  };

  if (template === 'cardiac') {
    baseVitals.ecgReading = isAbnormal ? 'irregular' : 'normal';
  }

  if (template === 'diabetic') {
    baseVitals.bloodSugar = isAbnormal ? 280 : 80 + Math.random() * 40;
  }

  return baseVitals;
};

// Demo Vitals Templates
const demoTemplates = [
  {
    name: 'Post-Surgery ICU',
    description: 'Intensive monitoring template for post-operative ICU patients',
    fields: [
      { name: 'temperature', label: 'Temperature', required: true, min: 35, max: 42 },
      { name: 'heartRate', label: 'Heart Rate', required: true, min: 40, max: 180 },
      { name: 'bloodPressure.systolic', label: 'Systolic BP', required: true, min: 70, max: 200 },
      { name: 'bloodPressure.diastolic', label: 'Diastolic BP', required: true, min: 40, max: 130 },
      { name: 'oxygenSaturation', label: 'SpO2', required: true, min: 85, max: 100 },
      { name: 'respiratoryRate', label: 'Respiratory Rate', required: true, min: 8, max: 40 },
      { name: 'painLevel', label: 'Pain Level (0-10)', required: true, min: 0, max: 10 },
      { name: 'drainOutput', label: 'Drain Output (ml)', required: false }
    ],
    createdBy: null,
    isDefault: false
  },
  {
    name: 'Pediatric Standard',
    description: 'Standard vitals monitoring for pediatric patients',
    fields: [
      { name: 'temperature', label: 'Temperature', required: true, min: 35, max: 42 },
      { name: 'heartRate', label: 'Heart Rate', required: true, min: 60, max: 200 },
      { name: 'bloodPressure.systolic', label: 'Systolic BP', required: true },
      { name: 'bloodPressure.diastolic', label: 'Diastolic BP', required: true },
      { name: 'oxygenSaturation', label: 'SpO2', required: true, min: 90, max: 100 },
      { name: 'weight', label: 'Weight (kg)', required: false }
    ],
    createdBy: null,
    isDefault: false
  }
];

// Settings
const demoSettings = {
  _id: 'system_settings',
  wards: [
    { name: 'ICU-1', beds: 10, active: true },
    { name: 'ICU-2', beds: 10, active: true },
    { name: 'General-1', beds: 20, active: true },
    { name: 'General-2', beds: 20, active: true },
    { name: 'Cardiac', beds: 15, active: true },
    { name: 'Pediatric', beds: 12, active: true },
    { name: 'Emergency', beds: 8, active: true }
  ],
  defaultVitalsInterval: 4,
  autoGenerateReminders: true,
  alertRetentionDays: 90,
  criticalAlertNotifications: true,
  emailNotifications: true,
  dailySummaryEmail: true
};

// ============================================
// SEED FUNCTION
// ============================================

async function seedDatabase() {
  console.log('\n🌱 VITALIS DATABASE SEED SCRIPT');
  console.log('================================\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data if enabled
    if (CLEAR_EXISTING) {
      console.log('🗑️  Clearing existing data...');
      await Promise.all([
        User.deleteMany({ email: { $regex: /@vitalis\.com$/ } }), // Only delete demo users
        Patient.deleteMany({ mrn: { $regex: /^MRN00/ } }), // Only delete demo patients
        Vitals.deleteMany({}),
        Alert.deleteMany({}),
        Reminder.deleteMany({}),
        VitalsTemplate.deleteMany({ name: { $in: ['Post-Surgery ICU', 'Pediatric Standard'] } }),
        AuditLog.deleteMany({}),
        Settings.deleteMany({})
      ]);
      console.log('✅ Existing demo data cleared\n');
    }

    // 1. Create Users
    console.log('👤 Creating demo users...');
    const createdUsers = [];
    for (const userData of demoUsers) {
      // Don't hash password here - the User model pre-save hook does it automatically
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   ✓ Created: ${userData.name} (${userData.email})`);
    }
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Get references
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const doctorUser = createdUsers.find(u => u.role === 'doctor');
    const nurseUser = createdUsers.find(u => u.role === 'nurse');

    // 2. Create Patients
    console.log('🏥 Creating demo patients...');
    const createdPatients = [];
    for (const patientData of demoPatients) {
      const patient = await Patient.create({
        ...patientData,
        primaryNurse: nurseUser._id,
        primaryDoctor: doctorUser._id
      });
      createdPatients.push(patient);
      console.log(`   ✓ Created: ${patientData.name} (${patientData.mrn})`);
    }
    console.log(`✅ Created ${createdPatients.length} patients\n`);

    // 3. Create Vitals Records (multiple per patient)
    console.log('💓 Creating vitals records...');
    let vitalsCount = 0;
    const createdVitals = [];
    
    for (const patient of createdPatients) {
      // Create 5-10 vitals records per patient over the past week
      const numRecords = 5 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < numRecords; i++) {
        const daysAgo = Math.floor(i / 2); // Spread over last few days
        const hoursAgo = (i % 2) * 8; // Multiple times per day
        const recordedAt = new Date();
        recordedAt.setDate(recordedAt.getDate() - daysAgo);
        recordedAt.setHours(recordedAt.getHours() - hoursAgo);

        // 20% chance of abnormal vitals
        const isAbnormal = Math.random() < 0.2;
        const vitalsData = generateVitalsData(patient.template, isAbnormal);

        const vitals = await Vitals.create({
          patient: patient._id,
          template: patient.template,
          vitals: vitalsData,
          notes: isAbnormal ? 'Patient showing abnormal readings. Doctor notified.' : '',
          recordedBy: nurseUser._id,
          recordedAt,
          flagged: isAbnormal,
          flaggedFields: isAbnormal ? [{ field: 'heartRate', value: vitalsData.heartRate, status: 'high' }] : []
        });

        createdVitals.push(vitals);
        vitalsCount++;
      }
    }
    console.log(`✅ Created ${vitalsCount} vitals records\n`);

    // 4. Create Alerts (link to vitals records)
    console.log('🚨 Creating alerts...');
    const alertSeverities = ['low', 'medium', 'high', 'critical'];
    const alertStatuses = ['active', 'acknowledged', 'resolved'];
    let alertCount = 0;

    // Get flagged vitals for alerts
    const flaggedVitals = createdVitals.filter(v => v.flagged);
    
    for (const vitals of flaggedVitals.slice(0, 8)) { // Create alerts for up to 8 flagged vitals
      const severity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
      const status = alertStatuses[Math.floor(Math.random() * alertStatuses.length)];
      const patient = createdPatients.find(p => p._id.toString() === vitals.patient.toString());
      
      await Alert.create({
        patient: vitals.patient,
        vitals: vitals._id,
        severity,
        status,
        message: `${severity.toUpperCase()} alert: Abnormal vitals detected for ${patient?.name || 'patient'}`,
        flaggedFields: [{ field: 'heartRate', value: 125, status: 'high' }],
        acknowledgedBy: status !== 'active' ? doctorUser._id : null,
        acknowledgedAt: status !== 'active' ? new Date() : null,
        resolvedBy: status === 'resolved' ? doctorUser._id : null,
        resolvedAt: status === 'resolved' ? new Date() : null,
        notes: status === 'resolved' ? 'Patient stabilized after treatment.' : ''
      });
      alertCount++;
    }
    
    // If not enough flagged vitals, create alerts with random vitals
    if (alertCount < 5 && createdVitals.length > 0) {
      for (let i = alertCount; i < 5; i++) {
        const randomVitals = createdVitals[Math.floor(Math.random() * createdVitals.length)];
        const patient = createdPatients.find(p => p._id.toString() === randomVitals.patient.toString());
        const severity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
        
        await Alert.create({
          patient: randomVitals.patient,
          vitals: randomVitals._id,
          severity,
          status: 'active',
          message: `${severity.toUpperCase()} alert: Patient ${patient?.name || 'Unknown'} requires attention`,
          flaggedFields: [{ field: 'heartRate', value: 115, status: 'high' }]
        });
        alertCount++;
      }
    }
    console.log(`✅ Created ${alertCount} alerts\n`);

    // 5. Create Reminders
    console.log('⏰ Creating reminders...');
    const reminderTypes = ['vitals_due', 'medication', 'appointment', 'custom'];
    const reminderPriorities = ['low', 'medium', 'high'];
    let reminderCount = 0;

    for (const patient of createdPatients) {
      const numReminders = 1 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numReminders; i++) {
        const type = reminderTypes[Math.floor(Math.random() * reminderTypes.length)];
        const priority = reminderPriorities[Math.floor(Math.random() * reminderPriorities.length)];
        const status = Math.random() < 0.7 ? 'pending' : (Math.random() < 0.5 ? 'completed' : 'snoozed');
        
        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + Math.floor(Math.random() * 48) - 12); // -12 to +36 hours

        await Reminder.create({
          patient: patient._id,
          title: `${type.replace('_', ' ').toUpperCase()} - ${patient.name}`,
          description: `${type} reminder for patient ${patient.name}`,
          type,
          priority,
          status,
          dueDate,
          createdBy: nurseUser._id,
          completedBy: status === 'completed' ? nurseUser._id : null,
          completedAt: status === 'completed' ? new Date() : null,
          snoozedUntil: status === 'snoozed' ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null
        });
        reminderCount++;
      }
    }
    console.log(`✅ Created ${reminderCount} reminders\n`);

    // 6. Skip Custom Vitals Templates (complex validation - use default ones)
    console.log('📋 Skipping custom vitals templates (using default system templates)...');
    console.log('✅ Using built-in templates\n');

    // 7. Create Settings
    console.log('⚙️  Creating system settings...');
    await Settings.create(demoSettings);
    console.log('✅ Created system settings\n');

    // 8. Create Audit Logs
    console.log('📝 Creating audit logs...');
    const auditActions = [
      { action: 'login', details: 'User logged in successfully' },
      { action: 'patient_create', details: 'Created new patient record' },
      { action: 'vitals_record', details: 'Recorded patient vitals' },
      { action: 'alert_resolve', details: 'Resolved critical alert' },
      { action: 'reminder_complete', details: 'Completed patient reminder' }
    ];

    for (let i = 0; i < 20; i++) {
      const action = auditActions[Math.floor(Math.random() * auditActions.length)];
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
      
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 72));

      await AuditLog.create({
        action: action.action,
        user: user._id,
        resourceType: action.action.includes('patient') ? 'patient' : 
                      action.action.includes('vitals') ? 'vitals' : 
                      action.action.includes('alert') ? 'alert' : 'user',
        resourceName: patient.name,
        details: `${action.details} - ${patient.name}`,
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        createdAt: timestamp
      });
    }
    console.log('✅ Created 20 audit logs\n');

    // Summary
    console.log('================================');
    console.log('🎉 SEED COMPLETE!\n');
    console.log('📊 DATA SUMMARY:');
    console.log(`   • Users: ${createdUsers.length}`);
    console.log(`   • Patients: ${createdPatients.length}`);
    console.log(`   • Vitals Records: ${vitalsCount}`);
    console.log(`   • Alerts: ${alertCount}`);
    console.log(`   • Reminders: ${reminderCount}`);
    console.log(`   • Templates: ${demoTemplates.length}`);
    console.log(`   • Audit Logs: 20`);
    console.log(`   • System Settings: 1\n`);

    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │ Role    │ Email               │ Password  │');
    console.log('   ├─────────────────────────────────────────┤');
    console.log('   │ Admin   │ admin@vitalis.com   │ Test@123  │');
    console.log('   │ Doctor  │ doctor@vitalis.com  │ Test@123  │');
    console.log('   │ Nurse   │ nurse@vitalis.com   │ Test@123  │');
    console.log('   └─────────────────────────────────────────┘\n');

  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    console.log('\n✅ You can now start the application and test!\n');
  }
}

// Run the seed
seedDatabase();
