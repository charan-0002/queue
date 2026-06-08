const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  name: { type: String, required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  department: { type: String, required: true },
  queuePosition: { type: Number, required: true },
  tokenNumber: { type: String, required: true },
  status: { type: String, enum: ['waiting', 'in-consultation', 'completed', 'cancelled', 'no-show'], default: 'waiting' },
  checkInTime: { type: Date, default: Date.now },
  consultationStartTime: { type: Date },
  consultationEndTime: { type: Date },
  symptom: { type: String },
  notify_via: { type: String, default: 'none' },
  expectedWaitTime: { type: Number, default: 0 }, // in minutes
  notified10Min: { type: Boolean, default: false }, // Legacy, keeping for backwards compatibility for existing patients
  notifiedNext: { type: Boolean, default: false },
  notifyThresholdMinutes: { type: Number, default: 15 },
  hasNotifiedThreshold: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
