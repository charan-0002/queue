const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;

// Setup Twilio (Mocked if missing credentials)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid'
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendNotification = async (to, message) => {
  if (!twilioClient) {
    console.log(`[Mock Webhook SMS/WhatsApp] To: ${to} | Message: ${message}`);
    return;
  }
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
  } catch (error) {
    console.error('Twilio Error:', error);
  }
};

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
