const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const twilio = require('twilio');
const authMiddleware = require('../middleware/auth');

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid'
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendNotification = async (to, message, notifyVia = 'sms') => {
  if (!twilioClient) {
    console.log(`[Mock Queue ${notifyVia.toUpperCase()}] To: ${to} | Message: ${message}`);
    return;
  }
  try {
    const isWhatsApp = notifyVia === 'whatsapp';
    const fromNumber = isWhatsApp 
      ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`
      : process.env.TWILIO_PHONE_NUMBER;
      
    const toNumber = isWhatsApp
      ? `whatsapp:${to}`
      : to;

    await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });
    console.log(`[Twilio ${notifyVia.toUpperCase()}] Sent successfully to ${to}`);
  } catch (error) {
    console.error('Twilio Error:', error);
  }
};

const getCongestion = (waitCount, capacity) => {
  const pct = Math.min((waitCount / (capacity || 50)) * 100, 100);
  if (pct > 75) return 'high';
  if (pct > 40) return 'medium';
  return 'low';
};

const processQueueNotifications = async (hospitalId, department) => {
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) return;

  const allPatients = await Patient.find({ 
    hospital: hospitalId, 
    department, 
    status: { $in: ['in-consultation', 'waiting'] } 
  }).sort('checkInTime');

  let runningWaitTime = 0;
  let waitingPosition = 1;

  for (let i = 0; i < allPatients.length; i++) {
    const p = allPatients[i];
    
    if (p.status === 'in-consultation') {
      const elapsedMinutes = p.consultationStartTime ? Math.floor((new Date() - p.consultationStartTime) / 60000) : 0;
      const remaining = Math.max(0, (p.estimatedConsultationTime || 15) - elapsedMinutes);
      runningWaitTime += remaining;
    } else if (p.status === 'waiting') {
      const expectedWaitTime = Math.round(runningWaitTime);
      const newPosition = waitingPosition++;
      
      // Update running wait time for the next person
      runningWaitTime += (p.estimatedConsultationTime || 15);

      // Always update their database expected time
      p.expectedWaitTime = expectedWaitTime;
      p.queuePosition = newPosition;

      // Check custom threshold
      const threshold = p.notifyThresholdMinutes || 15;
      if (expectedWaitTime <= threshold && !p.hasNotifiedThreshold && p.notify_via !== 'none') {
        await sendNotification(p.phone, `Hello ${p.name}, your estimated wait time is now approximately ${expectedWaitTime} minutes. Please start heading to ${hospital.name} (${department}).`, p.notify_via);
        p.hasNotifiedThreshold = true;
      }
      
      // Check NEXT in line
      if (newPosition === 1 && expectedWaitTime > threshold && !p.notifiedNext && p.notify_via !== 'none') {
        await sendNotification(p.phone, `Hello ${p.name}, you are NEXT in line at ${hospital.name} (${department}). Please proceed to the waiting area outside the doctor's cabin.`, p.notify_via);
        p.notifiedNext = true;
      }

      await p.save();
    }
  }
};

// PUT /api/hospitals/advance (Protected)
router.put('/advance', authMiddleware, async (req, res) => {
  try {
    const { patientId, newStatus } = req.body;
    
    const VALID_STATUSES = ['in-consultation', 'completed'];
    if (!patientId || !VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid patientId or newStatus' });
    }
    
    let updateFields = { status: newStatus };
    if (newStatus === 'in-consultation') {
      updateFields.consultationStartTime = new Date();
    } else if (newStatus === 'completed') {
      updateFields.consultationEndTime = new Date();
    }
    
    const patient = await Patient.findByIdAndUpdate(patientId, updateFields, { new: true });
    
    if (patient) {
      const hospitalId = patient.hospital;
      
      // If completed, update moving average
      if (newStatus === 'completed' && patient.consultationStartTime) {
        // Fix: use the exact Date object we just set instead of the DB return which could drift
        const durationMinutes = (updateFields.consultationEndTime - patient.consultationStartTime) / 1000 / 60;
        const hospital = await Hospital.findById(hospitalId);
        
        const oldAvg = hospital.averageConsultationTime || 15;
        const newAvg = Math.round((oldAvg * 0.7) + (durationMinutes * 0.3));
        
        hospital.averageConsultationTime = Math.max(5, Math.min(45, newAvg));
        await hospital.save();
      }
      
      if (newStatus === 'in-consultation' && patient.notify_via !== 'none') {
        const hospital = await Hospital.findById(hospitalId);
        await sendNotification(
          patient.phone, 
          `Hello ${patient.name}, your time has arrived for the treatment at ${hospital.name} (${patient.department}). Please proceed to the doctor's cabin.`, 
          patient.notify_via
        );
      }

      req.app.get('io').to(hospitalId.toString()).emit('queue_update', { message: 'Queue advanced' });

      // Recalculate everything and send automated notifications
      await processQueueNotifications(hospitalId, patient.department);
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Initial Hospital (Utility route for testing)
router.post('/setup', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }
  try {
    const newHospital = new Hospital(req.body);
    await newHospital.save();
    res.status(201).json(newHospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    
    const hospitalsWithStats = await Promise.all(hospitals.map(async (h) => {
      const queue = await Patient.find({ hospital: h._id, status: 'waiting' }).sort('checkInTime');
      const waitCount = queue.length;
      const congestionStr = getCongestion(waitCount, h.capacity);

      const hObj = h.toObject();
      return {
        ...hObj,
        id: hObj._id,
        lat: hObj.coordinates?.lat || 0,
        lng: hObj.coordinates?.lng || 0,
        stats: {
          waiting: waitCount,
          avg_wait_minutes: h.averageConsultationTime || 15,
          congestion: congestionStr,
          current_token: queue.length > 0 ? queue[0].token : null
        }
      };
    }));

    res.json(hospitalsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/hospitals/:id
router.get('/:id', async (req, res) => {
  try {
    const h = await Hospital.findById(req.params.id);
    if (!h) return res.status(404).json({ error: 'Hospital not found' });
    
    const queue = await Patient.find({ hospital: h._id, status: 'waiting' }).sort('checkInTime');
    const waitCount = queue.length;
    const congestionStr = getCongestion(waitCount, h.capacity);

    const hObj = h.toObject();
    res.json({
      ...hObj,
      id: hObj._id,
      lat: hObj.coordinates?.lat || 0,
      lng: hObj.coordinates?.lng || 0,
      stats: {
        waiting: waitCount,
        avg_wait_minutes: h.averageConsultationTime || 15,
        congestion: congestionStr,
        current_token: queue.length > 0 ? queue[0].token : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/hospitals/:id/queue
router.get('/:id/queue', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const queue = await Patient.find({ 
      hospital: req.params.id, 
      status: { $in: ['waiting', 'in-consultation'] } 
    }).sort('checkInTime');
    const recent_done = await Patient.find({ hospital: req.params.id, status: 'completed' })
      .sort('-consultationEndTime')
      .limit(10);
      
    // Count only waiting patients for congestion
    const waitingQueue = queue.filter(q => q.status === 'waiting');
    const congestionStr = getCongestion(waitingQueue.length, hospital.capacity);

    const stats = {
      waiting: waitingQueue.length,
      avg_wait_minutes: hospital.averageConsultationTime || 15,
      congestion: congestionStr,
      current_token: waitingQueue.length > 0 ? waitingQueue[0].tokenNumber : null
    };

    res.json({
      hospital,
      queue,
      recent_done,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/hospitals/:id/settings
router.put('/:id/settings', authMiddleware, async (req, res) => {
  try {
    const { department, averageConsultationTime, isAccepting } = req.body;
    const h = await Hospital.findById(req.params.id);
    if (!h) return res.status(404).json({ error: 'Hospital not found' });
    
    if (department) {
      if (!h.departmentSettings) {
        h.departmentSettings = new Map();
      }
      const current = h.departmentSettings.get(department) || { 
        averageConsultationTime: h.averageConsultationTime || 15, 
        isAccepting: true 
      };
      
      if (averageConsultationTime !== undefined) current.averageConsultationTime = Math.max(1, parseInt(averageConsultationTime));
      if (isAccepting !== undefined) current.isAccepting = isAccepting;
      
      h.departmentSettings.set(department, current);
    } else {
      if (averageConsultationTime !== undefined) {
        h.averageConsultationTime = Math.max(1, parseInt(averageConsultationTime));
      }
    }
    
    await h.save();

    // Re-evaluate notifications for the queue if the time changed
    if (averageConsultationTime !== undefined && department) {
      await processQueueNotifications(h._id, department);
    }
    
    req.app.get('io').to(req.params.id).emit('queue_update', { message: 'Settings updated' });

    res.json({ message: 'Settings updated', hospital: h });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
