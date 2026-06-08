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
    // Track position and calculate ETA based on individual times
    const allAhead = await Patient.find({ 
      hospital: entry.hospital._id, 
      department: entry.department, 
      status: { $in: ['in-consultation', 'waiting'] },
      checkInTime: { $lte: entry.checkInTime }
    }).sort('checkInTime');

    let eta = 0;
    let position = 0;

    for (const p of allAhead) {
      if (p._id.toString() === entry._id.toString()) {
        position++;
        break; // Reached the current patient
      }

      if (p.status === 'in-consultation') {
        const elapsedMinutes = p.consultationStartTime ? Math.floor((new Date() - p.consultationStartTime) / 60000) : 0;
        const remaining = Math.max(0, (p.estimatedConsultationTime || 15) - elapsedMinutes);
        eta += remaining;
      } else if (p.status === 'waiting') {
        position++;
        eta += (p.estimatedConsultationTime || 15);
      }
    }
    
    eta = Math.round(eta);

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
        created_at: entry.checkInTime
      },
      hospital: {
        id: entry.hospital._id,
        name: entry.hospital.name,
        address: entry.hospital.address
      },
      position: position,
      eta_minutes: eta,
      current_token: allAhead.find(p => p.status === 'in-consultation')?.tokenNumber || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
