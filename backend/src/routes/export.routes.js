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

module.exports = router;
