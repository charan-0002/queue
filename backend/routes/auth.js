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
