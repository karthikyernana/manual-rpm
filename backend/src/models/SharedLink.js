const mongoose = require('mongoose');

const sharedLinkSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date
  },
  revoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for cleanup of expired links
sharedLinkSchema.index({ expiresAt: 1, revoked: 1 });

module.exports = mongoose.model('SharedLink', sharedLinkSchema);
