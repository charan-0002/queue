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
