const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: 'Bengaluru' },
  state: { type: String, default: 'Karnataka' },
  specialty: { type: String, default: 'General Medicine' },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  loginId: { type: String },
  passkey: { type: String },
  departments: [{ type: String }],
  departmentSettings: {
    type: Map,
    of: new mongoose.Schema({
      averageConsultationTime: { type: Number, default: 15 },
      isAccepting: { type: Boolean, default: true }
    }, { _id: false }),
    default: {}
  },
  contactInfo: { type: String },
  capacity: { type: Number, default: 50 },
  averageConsultationTime: { type: Number, default: 15 } // in minutes, updated via moving average
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
