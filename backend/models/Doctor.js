const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  averageConsultationTime: { type: Number, default: 15 }, // in minutes
  status: { type: String, enum: ['available', 'on-break', 'off-duty'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
