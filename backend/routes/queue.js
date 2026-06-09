const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');

// GET /api/queue/:token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const entry = await Patient.findOne({ tokenNumber: token }).populate('hospital');
    if (!entry) return res.status(404).json({ error: 'Token not found' });

    // Track position for THAT department specifically!
    const currentQueue = await Patient.find({ 
      hospital: entry.hospital._id, 
      department: entry.department, 
      status: 'waiting',
      checkInTime: { $lte: entry.checkInTime }
    }).sort('checkInTime');

    // Currently serving in THAT department
    const serving = await Patient.findOne({
      hospital: entry.hospital._id,
      department: entry.department,
      status: { $in: ['in-consultation', 'in_progress', 'called'] }
    });

    const position = currentQueue.findIndex(p => p._id.toString() === entry._id.toString()) + 1;
    
    const deptSettings = entry.hospital.departmentSettings?.get(entry.department) || { averageConsultationTime: entry.hospital.averageConsultationTime || 15 };
    const avgWait = deptSettings.averageConsultationTime;
    const eta = position * avgWait;

    res.json({
      entry: {
        id: entry._id,
        token: entry.tokenNumber,
        department: entry.department,
        status: entry.status,
        notify_via: entry.notify_via || 'none',
        patient_phone: entry.phone,
        patient_name: entry.name,
        symptom: entry.symptom,
        created_at: entry.checkInTime,
        targetTime: entry.targetTime,
        notificationThreshold: entry.notificationThreshold
      },
      hospital: {
        id: entry.hospital._id,
        name: entry.hospital.name,
        address: entry.hospital.address
      },
      position: position,
      eta_minutes: eta,
      current_token: serving ? serving.tokenNumber : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
