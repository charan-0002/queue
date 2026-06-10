# DocQueue Backend Source Code

This file contains a complete dump of the Node.js backend codebase.

## clear_patients.js

`javascript
const mongoose = require('mongoose');
const Patient = require('./models/Patient');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/docqueue', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to DB');
  await Patient.deleteMany({});
  console.log('All patient queues have been cleared.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

`

## middleware\auth.js

`javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;

`

## models\Admin.js

`javascript
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  hospitalAssignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);

`

## models\Doctor.js

`javascript
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  averageConsultationTime: { type: Number, default: 15 }, // in minutes
  status: { type: String, enum: ['available', 'on-break', 'off-duty'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);

`

## models\Hospital.js

`javascript
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

`

## models\Patient.js

`javascript
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
  targetTime: { type: Date }, // Exact timestamp when their timer hits 0
  notificationThreshold: { type: Number, default: 15 }, // Notify X minutes before targetTime
  timerNotified: { type: Boolean, default: false },
  notified10Min: { type: Boolean, default: false },
  notifiedNext: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);

`

## package.json

`json
{
  "name": "docqueue-backend",
  "version": "1.0.0",
  "description": "Backend for DocQueue",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "socket.io": "^4.7.2",
    "twilio": "^4.16.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

`

## routes\auth.js

`javascript
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET not set');
  process.exit(1);
}
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if admin exists
    const admin = await Admin.findOne({ username }).populate('hospitalAssignment');
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!admin.hospitalAssignment) {
      return res.status(400).json({ message: 'No hospital assigned to this admin' });
    }

    // Create JWT
    const payload = {
      adminId: admin._id,
      hospitalId: admin.hospitalAssignment._id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token, 
      username: admin.username,
      role: 'staff',
      hospital_id: admin.hospitalAssignment._id,
      hospital_name: admin.hospitalAssignment.name
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup Initial Admin (Utility route for testing)
router.post('/setup', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Setup endpoint disabled in production' });
  }
  try {
    const { username, password, hospitalId } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newAdmin = new Admin({ username, passwordHash, hospitalAssignment: hospitalId });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

`

## routes\hospitals.js

`javascript
const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const { sendNotification } = require('../utils/twilio');
const authMiddleware = require('../middleware/auth');

const getCongestion = (waitCount, capacity) => {
  const pct = Math.min((waitCount / (capacity || 50)) * 100, 100);
  if (pct > 75) return 'high';
  if (pct > 40) return 'medium';
  return 'low';
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

      // Notify the next 10 patients in line
      const nextPatients = await Patient.find({ hospital: hospitalId, status: 'waiting' }).sort('checkInTime').limit(10).populate('hospital');
      
      for (let i = 0; i < nextPatients.length; i++) {
        const nextP = nextPatients[i];
        const newPosition = i + 1;
        const expectedWaitTime = newPosition * (nextP.hospital.averageConsultationTime || 15);
        
        if (expectedWaitTime <= 10 && !nextP.notified10Min) {
          if (nextP.notify_via !== 'none') {
            await sendNotification(nextP.phone, `Hello ${nextP.name}, your appointment at ${nextP.hospital.name} is expected in approximately ${expectedWaitTime} minutes. Please head to the waiting area.`, nextP.notify_via);
          }
          nextP.notified10Min = true;
          await nextP.save();
        }
        
        if (newPosition === 1 && expectedWaitTime > 10) {
          if (!nextP.notifiedNext) {
            if (nextP.notify_via !== 'none') {
              await sendNotification(nextP.phone, `Hello ${nextP.name}, you are NEXT in line at ${nextP.hospital.name}. Please proceed to the doctor's cabin.`, nextP.notify_via);
            }
            nextP.notifiedNext = true;
            await nextP.save();
          }
        }
      }
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
    
    req.app.get('io').to(h._id.toString()).emit('queue_update', { message: 'Settings updated' });

    res.json({ message: 'Settings updated', hospital: h });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

`

## routes\patients.js

`javascript
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
    const currentQueue = await Patient.find({ 
      hospital: patient.hospital._id, 
      department: patient.department, 
      status: 'waiting',
      checkInTime: { $lte: patient.checkInTime }
    }).sort('checkInTime');

    const position = currentQueue.findIndex(p => p._id.toString() === patient._id.toString()) + 1;
    patient.queuePosition = position;
    
    const avgWait = patient.hospital.averageConsultationTime || 15;
    patient.expectedWaitTime = position * avgWait;

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

`

## routes\queue.js

`javascript
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

`

## routes\webhook.js

`javascript
const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;

const { sendNotification } = require('../utils/twilio');

// POST /api/webhook/twilio
// Endpoint configured in Twilio to receive inbound messages
router.post('/twilio', async (req, res) => {
  const twiml = new MessagingResponse();
  const incomingPhone = req.body.From; // e.g., '+1234567890' or 'whatsapp:+1234567890'
  const messageBody = req.body.Body ? req.body.Body.trim() : '';

  try {
    // Basic NLP: Assume message format "Checkin [Hospital Name]"
    // e.g., "Checkin AIIMS"
    const words = messageBody.split(' ');
    
    if (words.length >= 2 && words[0].toLowerCase() === 'checkin') {
      const hospitalNameKeyword = words.slice(1).join(' ');
      
      // Find hospital by partial name match
      const hospital = await Hospital.findOne({ name: { $regex: hospitalNameKeyword, $options: 'i' } });
      
      if (!hospital) {
        twiml.message(`Sorry, we couldn't find a hospital matching "${hospitalNameKeyword}". Please check the name and try again.`);
        res.type('text/xml').send(twiml.toString());
        return;
      }

      const department = 'General OPD'; // Default department for SMS
      
      // Check if patient is already waiting at this hospital
      const existing = await Patient.findOne({ phone: incomingPhone, hospital: hospital._id, status: 'waiting' });
      if (existing) {
        twiml.message(`You are already checked in at ${hospital.name}. Your Token is ${existing.tokenNumber}. Position: ${existing.queuePosition}. Est. Wait: ${existing.expectedWaitTime} mins.`);
        res.type('text/xml').send(twiml.toString());
        return;
      }

      // Calculate queue position and wait time
      const patientsAhead = await Patient.countDocuments({ hospital: hospital._id, department, status: 'waiting' });
      const avgWait = hospital.averageConsultationTime || 15;
      const expectedWaitTime = (patientsAhead + 1) * avgWait;
      
      const tokenNumber = `SMS-${Math.floor(100 + Math.random() * 900)}`;

      const newPatient = new Patient({
        name: 'SMS Patient', // Since we don't have their name, we use a placeholder
        phone: incomingPhone,
        hospital: hospital._id,
        department,
        queuePosition: patientsAhead + 1,
        tokenNumber,
        expectedWaitTime
      });

      await newPatient.save();

      // Emit socket event to hospital room to update dashboard live
      const io = req.app.get('io');
      if (io) {
        io.to(hospital._id.toString()).emit('queue_update', { message: 'New patient added to queue via SMS/WhatsApp' });
      }

      twiml.message(`Successfully checked in to ${hospital.name} (${department}). Token: ${tokenNumber}. Position: ${patientsAhead + 1}. Est. Wait: ${expectedWaitTime} mins. We will notify you when your turn is approaching.`);
    } else {
      twiml.message('Welcome to DocQueue! To check in, reply with: "Checkin [Hospital Name]". For example: "Checkin AIIMS"');
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    twiml.message('An error occurred while processing your request. Please try again later.');
  }

  res.type('text/xml').send(twiml.toString());
});

module.exports = router;

`

## seed.js

`javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hospital = require('./models/Hospital');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI;

const privateDepts = [
  "Cardiology", "Cardiac Surgery", "Neurology", "Neurosurgery",
  "Orthopaedics & Joint Replacement", "Oncology", "Gastroenterology",
  "Nephrology", "Urology", "Pulmonology", "Endocrinology & Diabetology",
  "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "General Surgery",
  "General Medicine", "Emergency & Trauma", "Dermatology", "Ophthalmology",
  "ENT", "Psychiatry", "Radiology & Imaging", "Pathology & Laboratory",
  "Anaesthesiology", "Physiotherapy & Rehabilitation", "Dental & Maxillofacial",
  "Plastic & Cosmetic Surgery", "Vascular Surgery", "Rheumatology",
  "Haematology", "Transplant Surgery", "ICU / Critical Care", "Pharmacy"
];

const hospitals = [
  { name: "Fortis Hospital (Bannerghatta)", city: "Bengaluru", username: "fortis", password: "fortis2026", departments: privateDepts },
  { name: "Apollo Hospital (Seshadripuram)", city: "Bengaluru", username: "apollo", password: "apollo2026", departments: privateDepts },
  { name: "Apollo Hospital (Bannerghatta)", city: "Bengaluru", username: "apollo_bannerghatta", password: "apollo_bannerghatta2026", departments: privateDepts },
  { name: "Apollo Speciality (Jayanagar)", city: "Bengaluru", username: "apollo_jayanagar", password: "apollo_jayanagar2026", departments: privateDepts },
  { name: "Manipal Hospital (HAL)", city: "Bengaluru", username: "manipal_hal", password: "manipal_hal2026", departments: privateDepts },
  { name: "Manipal Hospital (Yeshwanthpur)", city: "Bengaluru", username: "manipal_yeshwanthpur", password: "manipal_yeshwanthpur2026", departments: privateDepts },
  { name: "Manipal Hospital (Whitefield)", city: "Bengaluru", username: "manipal_whitefield", password: "manipal_whitefield2026", departments: privateDepts },
  { name: "Manipal Hospital (Hebbal)", city: "Bengaluru", username: "manipal_hebbal", password: "manipal_hebbal2026", departments: privateDepts },
  { name: "Manipal Hospital (Varthur)", city: "Bengaluru", username: "manipal_varthur", password: "manipal_varthur2026", departments: privateDepts },
  { name: "Aster CMI Hospital", city: "Bengaluru", username: "aster_cmi", password: "aster_cmi2026", departments: privateDepts },
  { name: "Bangalore Baptist Hospital", city: "Bengaluru", username: "baptist", password: "baptist2026", departments: privateDepts },
  { name: "HCG Cancer Hospital", city: "Bengaluru", username: "hcg", password: "hcg2026", departments: ["Oncology", "Radiation Oncology", "Surgical Oncology", "Medical Oncology", "Haematology", "Bone Marrow Transplant", "Palliative Care", "Radiology & Imaging", "Pathology & Laboratory", "Pharmacy"] },
  { name: "Fortis Hospital (Nagarbhavi)", city: "Bengaluru", username: "fortis_nagarbhavi", password: "fortis_nagarbhavi2026", departments: privateDepts },
  { name: "United Hospital", city: "Bengaluru", username: "united", password: "united2026", departments: privateDepts },
  { name: "Trustwell Hospital", city: "Bengaluru", username: "trustwell", password: "trustwell2026", departments: privateDepts },
  { name: "Suguna Hospital", city: "Bengaluru", username: "suguna", password: "suguna2026", departments: privateDepts },
  { name: "Marvel Multispeciality Hospital", city: "Bengaluru", username: "marvel", password: "marvel2026", departments: privateDepts },
  { name: "AMC Multispeciality Hospital", city: "Bengaluru", username: "amc", password: "amc2026", departments: privateDepts },
  { name: "Sankalpa Multispeciality Hospital", city: "Bengaluru", username: "sankalpa", password: "sankalpa2026", departments: privateDepts },
  { name: "Springleaf Hospital", city: "Bengaluru", username: "springleaf", password: "springleaf2026", departments: privateDepts },
  { name: "Victoria Hospital", city: "Bengaluru", username: "victoria", password: "victoria2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "ENT", "Ophthalmology", "Gynaecology & Obstetrics", "Emergency & Trauma", "Dermatology", "Dental", "Radiology & Imaging", "Pathology & Laboratory"] },
  { name: "Jayadeva Hospital", city: "Bengaluru", username: "jayadeva", password: "jayadeva2026", departments: ["Cardiology", "Cardiac Surgery", "Interventional Cardiology", "CT Surgery", "Cardiac Rehabilitation", "ECG & Echo Lab", "Cath Lab", "ICU / Critical Care"] },
  { name: "NIMHANS", city: "Bengaluru", username: "nimhans", password: "nimhans2026", departments: ["Psychiatry", "Neurology", "Neurosurgery", "Clinical Psychology", "Neuroimaging", "De-addiction", "Child Psychiatry", "Geriatric Psychiatry", "Neurochemistry"] },
  { name: "BMCRI", city: "Bengaluru", username: "bmcri", password: "bmcri2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "Paediatrics & Neonatology", "Gynaecology & Obstetrics", "ENT", "Ophthalmology", "Dermatology", "Psychiatry", "TB & Chest", "Forensic Medicine"] },
  { name: "BMCRI Super Speciality / PMSSY", city: "Bengaluru", username: "pmssy", password: "pmssy2026", departments: ["Neurosurgery", "Cardiology", "Nephrology", "Urology", "Plastic & Cosmetic Surgery", "Gastroenterology", "Endocrinology & Diabetology", "Oncology"] },
  { name: "K.C. General Hospital", city: "Bengaluru", username: "kc_general", password: "kc_general2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "ENT", "Dental", "Dermatology", "Ophthalmology", "Gynaecology & Obstetrics", "Emergency & Trauma"] },
  { name: "Bowring & Lady Curzon Hospital", city: "Bengaluru", username: "bowring", password: "bowring2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "ENT", "Ophthalmology", "Dermatology", "Emergency & Trauma"] },
  { name: "Jayanagar General Hospital", city: "Bengaluru", username: "jayanagar_general", password: "jayanagar_general2026", departments: ["General Medicine", "General Surgery", "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "ENT", "Dental", "Pharmacy", "Emergency & Trauma"] },
  { name: "BBMP Multi-Speciality Hospital", city: "Bengaluru", username: "bbmp", password: "bbmp2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "Ophthalmology", "Dental"] },
  { name: "Vanivilas Hospital", city: "Bengaluru", username: "vanivilas", password: "vanivilas2026", departments: ["Gynaecology & Obstetrics", "Paediatrics & Neonatology", "NICU", "PICU", "Fetal Medicine"] },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');
  await Hospital.deleteMany({});
  await Admin.deleteMany({});
  console.log('Cleared old hospitals and admins');
  for (const h of hospitals) {
    const deptSettings = {};
    h.departments.forEach(name => {
      deptSettings[name] = { averageConsultationTime: 15, isAccepting: true };
    });
    
    const hospitalDoc = await Hospital.create({ 
      name: h.name, 
      city: h.city, 
      departments: h.departments, 
      departmentSettings: deptSettings,
      address: h.city, 
      phone: '', 
      congestionLevel: 'low',
      coordinates: { lat: 12.9716, lng: 77.5946 } // dummy coords for Bangalore
    });
    const hashed = await bcrypt.hash(h.password, 10);
    await Admin.create({ username: h.username, passwordHash: hashed, hospitalAssignment: hospitalDoc._id });
    console.log('Added: ' + h.name);
  }
  console.log('All 30 hospitals seeded!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

`

## seed_30.js

`javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hospital = require('./models/Hospital');
const Admin = require('./models/Admin');
const Patient = require('./models/Patient');
require('dotenv').config();

const hospitals = [
  { name: "Fortis Hospital", area: "Bannerghatta Rd", lat: 12.8948, lng: 77.5986, loginId: "fortis", passkey: "fortis2026" },
  { name: "Apollo Hospital", area: "Seshadripuram", lat: 12.9882, lng: 77.5724, loginId: "apollo", passkey: "apollo2026" },
  { name: "Apollo Hospital", area: "Bannerghatta Rd", lat: 12.8961, lng: 77.5985, loginId: "apollo_bannerghatta", passkey: "apollo_bannerghatta2026" },
  { name: "Apollo Speciality", area: "Jayanagar", lat: 12.9365, lng: 77.5843, loginId: "apollo_jayanagar", passkey: "apollo_jayanagar2026" },
  { name: "Manipal Hospital", area: "HAL Airport Rd", lat: 12.9584, lng: 77.6490, loginId: "manipal_hal", passkey: "manipal_hal2026" },
  { name: "Manipal Hospital", area: "Yeshwanthpur", lat: 13.0141, lng: 77.5560, loginId: "manipal_yeshwanthpur", passkey: "manipal_yeshwanthpur2026" },
  { name: "Manipal Hospital", area: "Whitefield", lat: 12.9880, lng: 77.7287, loginId: "manipal_whitefield", passkey: "manipal_whitefield2026" },
  { name: "Manipal Hospital", area: "Hebbal", lat: 13.0509, lng: 77.5939, loginId: "manipal_hebbal", passkey: "manipal_hebbal2026" },
  { name: "Manipal Hospital", area: "Varthur Rd", lat: 12.9581, lng: 77.7455, loginId: "manipal_varthur", passkey: "manipal_varthur2026" },
  { name: "Aster CMI Hospital", area: "Hebbal", lat: 13.0544, lng: 77.5915, loginId: "aster_cmi", passkey: "aster_cmi2026" },
  { name: "Bangalore Baptist Hospital", area: "Hebbal", lat: 13.0356, lng: 77.5896, loginId: "baptist", passkey: "baptist2026" },
  { name: "HCG Cancer Hospital", area: "K.R. Road", lat: 12.9637, lng: 77.5896, loginId: "hcg", passkey: "hcg2026" },
  { name: "Fortis Hospital", area: "Nagarbhavi", lat: 12.9597, lng: 77.5113, loginId: "fortis_nagarbhavi", passkey: "fortis_nagarbhavi2026" },
  { name: "United Hospital", area: "Jayanagar", lat: 12.9364, lng: 77.5848, loginId: "united", passkey: "united2026" },
  { name: "Trustwell Hospitals", area: "J.C. Road", lat: 12.9606, lng: 77.5840, loginId: "trustwell", passkey: "trustwell2026" },
  { name: "Suguna Hospital", area: "Rajajinagar", lat: 12.9881, lng: 77.5600, loginId: "suguna", passkey: "suguna2026" },
  { name: "Marvel Multispeciality", area: "Koramangala", lat: 12.9254, lng: 77.6359, loginId: "marvel", passkey: "marvel2026" },
  { name: "AMC Multispeciality", area: "Jayanagar", lat: 12.9297, lng: 77.5763, loginId: "amc", passkey: "amc2026" },
  { name: "Sankalpa Hospital", area: "Kothnur", lat: 12.8725, lng: 77.5837, loginId: "sankalpa", passkey: "sankalpa2026" },
  { name: "Springleaf Hospital", area: "Electronic City", lat: 12.8525, lng: 77.6675, loginId: "springleaf", passkey: "springleaf2026" },
  { name: "Victoria Hospital", area: "City Market", lat: 12.9643, lng: 77.5754, loginId: "victoria", passkey: "victoria2026" },
  { name: "Jayadeva Hospital", area: "BTM Layout", lat: 12.9178, lng: 77.5992, loginId: "jayadeva", passkey: "jayadeva2026" },
  { name: "NIMHANS", area: "Hosur Rd", lat: 12.9387, lng: 77.5941, loginId: "nimhans", passkey: "nimhans2026" },
  { name: "BMCRI", area: "K.R. Road", lat: 12.9594, lng: 77.5747, loginId: "bmcri", passkey: "bmcri2026" },
  { name: "PMSSY Hospital", area: "New Tharagupet", lat: 12.9622, lng: 77.5731, loginId: "pmssy", passkey: "pmssy2026" },
  { name: "K.C. General Hospital", area: "Malleshwaram", lat: 12.9961, lng: 77.5693, loginId: "kc_general", passkey: "kc_general2026" },
  { name: "Bowring Hospital", area: "Shivaji Nagar", lat: 12.9821, lng: 77.6042, loginId: "bowring", passkey: "bowring2026" },
  { name: "Jayanagar General Hospital", area: "Jayanagar", lat: 12.9266, lng: 77.5930, loginId: "jayanagar_general", passkey: "jayanagar_general2026" },
  { name: "BBMP Multi-Speciality", area: "Vijayanagar", lat: 12.9773, lng: 77.5427, loginId: "bbmp", passkey: "bbmp2026" },
  { name: "Vanivilas Hospital", area: "K.R. Road", lat: 12.9630, lng: 77.5740, loginId: "vanivilas", passkey: "vanivilas2026" },
];

const privateDepts = [
  "Cardiology", "Cardiac Surgery", "Neurology", "Neurosurgery",
  "Orthopaedics", "Oncology", "Gastroenterology", "Nephrology",
  "Urology", "Pulmonology", "Endocrinology", "Gynaecology",
  "Obstetrics", "Paediatrics", "Neonatology", "General Surgery",
  "General Medicine", "Emergency & Trauma", "Dermatology",
  "Ophthalmology", "ENT", "Psychiatry", "Radiology",
  "Pathology", "Anaesthesiology", "Physiotherapy",
  "Dental", "Plastic Surgery", "Vascular Surgery",
  "Rheumatology", "Haematology", "Transplant", "ICU", "Pharmacy"
];

const govtDepts = {
  "Victoria Hospital": ["General Medicine", "Surgery", "Orthopaedics", "ENT", "Ophthalmology", "Gynaecology", "Casualty/Emergency", "Dermatology", "Dentistry", "Radiology", "Pathology"],
  "Jayadeva Hospital": ["Cardiology", "Cardiac Surgery", "Interventional Cardiology", "CT Surgery", "Cardiac Rehabilitation", "ECG/Echo Lab", "Cath Lab", "ICU"],
  "NIMHANS": ["Psychiatry", "Neurology", "Neurosurgery", "Clinical Psychology", "Neuroimaging", "De-addiction", "Child Psychiatry", "Geriatric Psychiatry", "Neurochemistry"],
  "BMCRI": ["General Medicine", "Surgery", "Orthopaedics", "Paediatrics", "Gynaecology", "ENT", "Ophthalmology", "Dermatology", "Psychiatry", "TB & Chest", "Forensic Medicine"],
  "PMSSY Hospital": ["Neurosurgery", "Cardiology", "Nephrology", "Urology", "Plastic Surgery", "Gastroenterology", "Endocrinology", "Oncology"],
  "K.C. General Hospital": ["General Medicine", "Surgery", "Orthopaedics", "ENT", "Dentistry", "Dermatology", "Ophthalmology", "Gynaecology", "Casualty"],
  "Bowring Hospital": ["General Medicine", "Surgery", "Orthopaedics", "Gynaecology", "Paediatrics", "ENT", "Ophthalmology", "Dermatology", "Casualty"],
  "Jayanagar General Hospital": ["General Medicine", "Surgery", "Gynaecology", "Paediatrics", "ENT", "Dentistry", "Pharmacy", "Casualty"],
  "BBMP Multi-Speciality": ["General Medicine", "Surgery", "Orthopaedics", "Gynaecology", "Paediatrics", "Ophthalmology", "Dentistry"],
  "Vanivilas Hospital": ["Gynaecology", "Obstetrics", "Neonatology", "Paediatrics", "NICU", "PICU", "Fetal Medicine"]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docqueue');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await Admin.deleteMany({});
    await Patient.deleteMany({});
    console.log('🗑️  Cleared existing data');

    for (let i = 0; i < hospitals.length; i++) {
      const h = hospitals[i];

      let depts = privateDepts;
      if (i >= 20) {
        depts = govtDepts[h.name] || privateDepts;
      }

      const newHospital = await Hospital.create({
        name: h.name,
        address: h.area + ", Bangalore",
        city: "Bengaluru",
        state: "Karnataka",
        specialty: "General Medicine",
        coordinates: { lat: h.lat, lng: h.lng },
        loginId: h.loginId,
        passkey: h.passkey,
        departments: depts,
        contactInfo: "080-12345678",
        averageConsultationTime: Math.floor(Math.random() * 5) + 8
      });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(h.passkey, salt);

      await Admin.create({
        username: h.loginId,
        passwordHash: hash,
        hospitalAssignment: newHospital._id
      });
      
      console.log("✅ Seeded " + h.name + " | User: " + h.loginId);
    }

    console.log('\\n✅ Seed of 30 precise hospitals completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();

`

## server.js

`javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const hospitalRoutes = require('./routes/hospitals');
const webhookRoutes = require('./routes/webhook');
const queueRoutes = require('./routes/queue');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/queue', queueRoutes);

const Hospital = require('./models/Hospital');

// Utility routes for filtering
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await Hospital.distinct('city');
    res.json(cities.filter(c => c)); // Filter out nulls
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/specialties', async (req, res) => {
  try {
    const specialties = await Hospital.distinct('departments');
    res.json(specialties.filter(s => s).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Connection
console.log('DEBUG MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 40) + '...' : 'undefined');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docqueue')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Socket.io for Real-Time Updates
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_hospital_room', (hospitalId) => {
    socket.join(hospitalId);
    console.log(`User joined hospital room: ${hospitalId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Background Timer Loop for Notifications
const Patient = require('./models/Patient');
const { sendNotification } = require('./utils/twilio');

setInterval(async () => {
  try {
    const now = Date.now();
    // Find patients who are waiting and have not been notified for their timer threshold
    const patients = await Patient.find({ status: 'waiting', timerNotified: false }).populate('hospital');
    
    for (const patient of patients) {
      if (!patient.targetTime || patient.notificationThreshold == null) continue;
      
      const thresholdMs = patient.notificationThreshold * 60000;
      const targetTimeMs = new Date(patient.targetTime).getTime();
      
      // If the current time is at or past the threshold (e.g. 15 mins before targetTime)
      if (now >= (targetTimeMs - thresholdMs)) {
        if (patient.notify_via !== 'none') {
          const timeText = patient.notificationThreshold === 0 
            ? "is happening right now" 
            : `is in approximately ${patient.notificationThreshold} minutes`;
          
          const hospitalName = patient.hospital ? patient.hospital.name : "the hospital";
            
          await sendNotification(
            patient.phone, 
            `Hello ${patient.name}, your doctor's appointment at ${hospitalName} ${timeText}. Please be ready.`, 
            patient.notify_via
          );
        }
        patient.timerNotified = true;
        await patient.save();
      }
    }
  } catch (err) {
    console.error('Timer Loop Error:', err);
  }
}, 60000); // Run every 60 seconds

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

`

## utils\twilio.js

`javascript
const twilio = require('twilio');

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

module.exports = { sendNotification };

`

