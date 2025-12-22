const express = require('express');
const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes protected
router.use(protect);

// @route   GET /api/v1/export/patient/:patientId/csv
// @desc    Export patient vitals as CSV
// @access  Private
router.get('/patient/:patientId/csv', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const vitals = await Vitals.find({ patient: req.params.patientId })
      .sort({ recordedAt: -1 })
      .limit(100);

    // Generate CSV
    let csv = 'Date,Time,Template';
    
    // Get all possible vital fields
    const allFields = new Set();
    vitals.forEach(v => {
      Object.keys(v.vitals).forEach(key => allFields.add(key));
    });
    
    const fieldArray = Array.from(allFields);
    csv += ',' + fieldArray.join(',') + ',Flagged\n';

    // Add data rows
    vitals.forEach(vital => {
      const date = new Date(vital.recordedAt);
      csv += `${date.toLocaleDateString()},${date.toLocaleTimeString()},${vital.template}`;
      
      fieldArray.forEach(field => {
        csv += `,${vital.vitals[field] !== undefined ? vital.vitals[field] : ''}`;
      });
      
      csv += `,${vital.flagged ? 'Yes' : 'No'}\n`;
    });

    // Send as downloadable file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${patient.name}_vitals_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting CSV',
      error: error.message
    });
  }
});

// @route   GET /api/v1/export/patient/:patientId/data
// @desc    Get patient data for PDF export (frontend will generate PDF)
// @access  Private
router.get('/patient/:patientId/data', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId)
      .populate('primaryNurse', 'name email')
      .populate('primaryDoctor', 'name email');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const vitals = await Vitals.find({ patient: req.params.patientId })
      .sort({ recordedAt: -1 })
      .limit(20)
      .populate('recordedBy', 'name');

    res.json({
      success: true,
      data: {
        patient,
        vitals
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting export data',
      error: error.message
    });
  }
});

// @route   GET /api/v1/export/patient/:patientId/history/csv
// @desc    Export patient admission history as CSV
// @access  Private
router.get('/patient/:patientId/history/csv', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId)
      .populate('dischargedBy', 'name');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Helper to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Generate CSV header
    let csv = 'Admission #,Admitted Date,Discharged Date,Length of Stay (Days),Discharge Notes\n';

    // Add history rows
    if (patient.admissionHistory && patient.admissionHistory.length > 0) {
      patient.admissionHistory.forEach((admission, index) => {
        const admittedDate = new Date(admission.admittedAt);
        const dischargedDate = new Date(admission.dischargedAt);
        const lengthOfStay = Math.ceil((dischargedDate - admittedDate) / (1000 * 60 * 60 * 24));
        
        csv += `${index + 1},`;
        csv += `${escapeCSV(admittedDate.toLocaleDateString())},`;
        csv += `${escapeCSV(dischargedDate.toLocaleDateString())},`;
        csv += `${lengthOfStay},`;
        csv += `${escapeCSV(admission.dischargeNotes || '')}\n`;
      });
    }

    // Add current admission if still admitted
    if (patient.status === 'admitted') {
      const currentAdmissionNum = (patient.admissionHistory?.length || 0) + 1;
      const admittedDate = new Date(patient.admissionDate);
      const today = new Date();
      const currentStay = Math.ceil((today - admittedDate) / (1000 * 60 * 60 * 24));
      
      csv += `${currentAdmissionNum} (Current),`;
      csv += `${escapeCSV(admittedDate.toLocaleDateString())},`;
      csv += `In Progress,`;
      csv += `${currentStay},`;
      csv += `N/A\n`;
    }

    // Send as downloadable file
    const sanitizedName = sanitizeFilename(patient.name, 'patient');
    const filename = `${sanitizedName}_admission_history_${Date.now()}.csv`;
    const encodedFilename = encodeURIComponent(filename);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`);
    res.send(csv);
  } catch (error) {
    console.error('Export admission history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting admission history',
      error: error.message
    });
  }
});

module.exports = router;
