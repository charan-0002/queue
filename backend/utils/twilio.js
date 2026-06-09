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
