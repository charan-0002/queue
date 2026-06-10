const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { sendNotification } = require('../utils/twilio');

// POST /api/patients/checkin
router.post('/checkin', async (req, res) => {
  try {
    const { patient_name, patient_phone, hospitalId, department, symptom, notify_via, notificationThreshold } = req.body;
    
    // Fetch hospital to get average consultation time
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    // Calculate expected wait time & queue position for this department
    const patientsAhead = await Patient.countDocuments({ hospital: hospitalId, department, status: 'waiting' });
    
    // Fetch department-specific settings or fallback to global/default
    const deptSettings = hospital.departmentSettings?.get(department) || { 
      averageConsultationTime: hospital.averageConsultationTime || 15, 
      isAccepting: true 
    };

    if (!deptSettings.isAccepting) {
      return res.status(403).json({ error: 'This department is currently not accepting new patients.' });
    }

    const avgWait = deptSettings.averageConsultationTime;
    const expectedWaitTime = patientsAhead * avgWait;
    const targetTime = new Date(Date.now() + expectedWaitTime * 60000);
    
    // Generate simple token
    const tokenNumber = `${department.substring(0, 1).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPatient = new Patient({
      name: patient_name,
      phone: patient_phone,
      hospital: hospitalId,
      department,
      symptom,
      notify_via: notify_via || 'none',
      queuePosition: patientsAhead + 1,
      tokenNumber,
      expectedWaitTime,
      targetTime,
      notificationThreshold: notificationThreshold !== undefined ? Number(notificationThreshold) : 15
    });

    await newPatient.save();

    // Emit socket event to hospital room
    const io = req.app.get('io');
    io.to(hospitalId).emit('queue_update', { message: 'New patient added to queue' });

    // Send SMS / WhatsApp
    if (notify_via !== 'none') {
      await sendNotification(patient_phone, `Hello ${patient_name}, you're checked in! Token: ${tokenNumber}. Position: ${patientsAhead + 1}. Est. Wait: ${expectedWaitTime} mins.`, notify_via);
    }

    res.status(201).json({ ...newPatient.toObject(), token: tokenNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// GET /api/patients/:id/status
router.get('/:id/status', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('hospital');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    // Recalculate dynamic position
    const patientsAhead = await Patient.countDocuments({ 
      hospital: patient.hospital._id, 
      department: patient.department, 
      status: 'waiting',
      checkInTime: { $lt: patient.checkInTime }
    });

    const position = patientsAhead + 1;
    patient.queuePosition = position;
    
    const deptSettings = patient.hospital.departmentSettings?.get(patient.department);
    const avgWait = deptSettings?.averageConsultationTime || patient.hospital.averageConsultationTime || 15;
    patient.expectedWaitTime = patientsAhead * avgWait;

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/patients/:id/leave
router.delete('/:id/leave', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Emit socket event
    req.app.get('io').to(patient.hospital.toString()).emit('queue_update', { message: 'Patient left queue' });

    res.json({ message: 'Left queue successfully', patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/patients/:id (Hard Delete)
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    req.app.get('io').to(patient.hospital.toString()).emit('queue_update', { message: 'Patient deleted' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
