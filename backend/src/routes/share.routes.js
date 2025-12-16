const express = require('express');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const SharedLink = require('../models/SharedLink');
const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/share/create/:patientId
// @desc    Create share link for patient
// @access  Private
router.post('/create/:patientId', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { patientId: patient._id, type: 'share' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create shared link record
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const sharedLink = await SharedLink.create({
      patient: patient._id,
      token,
      expiresAt,
      createdBy: req.user._id
    });

    // Generate share URL
    const shareUrl = `${process.env.FRONTEND_URL}/share/${token}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(shareUrl);

    res.json({
      success: true,
      data: {
        shareUrl,
        qrCode,
        expiresAt,
        linkId: sharedLink._id
      }
    });
  } catch (error) {
    console.error('Create share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating share link',
      error: error.message
    });
  }
});

// @route   GET /api/v1/share/:token
// @desc    Get patient data via share link (PUBLIC)
// @access  Public
router.get('/:token', async (req, res) => {
  try {
    // Verify token
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    
    // Find shared link
    const sharedLink = await SharedLink.findOne({ 
      token: req.params.token,
      revoked: false
    });

    if (!sharedLink) {
      return res.status(404).json({
        success: false,
        message: 'Share link not found or has been revoked'
      });
    }

    // Check expiration
    if (new Date() > sharedLink.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'Share link has expired'
      });
    }

    // Update access stats
    sharedLink.accessCount += 1;
    sharedLink.lastAccessedAt = new Date();
    await sharedLink.save();

    // Get patient data
    const patient = await Patient.findById(decoded.patientId)
      .select('-__v')
      .populate('primaryNurse', 'name');

    // Get latest vitals
    const latestVitals = await Vitals.findOne({ patient: decoded.patientId })
      .sort({ recordedAt: -1 })
      .limit(1);

    // Get vitals history (last 10)
    const vitalsHistory = await Vitals.find({ patient: decoded.patientId })
      .sort({ recordedAt: -1 })
      .limit(10)
      .select('vitals recordedAt flagged');

    res.json({
      success: true,
      data: {
        patient,
        latestVitals,
        vitalsHistory,
        expiresAt: sharedLink.expiresAt
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid share link'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(410).json({
        success: false,
        message: 'Share link has expired'
      });
    }

    console.error('Access share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing shared data',
      error: error.message
    });
  }
});

// @route   DELETE /api/v1/share/:linkId
// @desc    Revoke share link
// @access  Private
router.delete('/:linkId', protect, async (req, res) => {
  try {
    const sharedLink = await SharedLink.findById(req.params.linkId);

    if (!sharedLink) {
      return res.status(404).json({
        success: false,
        message: 'Share link not found'
      });
    }

    sharedLink.revoked = true;
    await sharedLink.save();

    res.json({
      success: true,
      message: 'Share link revoked successfully'
    });
  } catch (error) {
    console.error('Revoke share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking share link',
      error: error.message
    });
  }
});

module.exports = router;
