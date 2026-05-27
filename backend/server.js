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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
