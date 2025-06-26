// config/initAdmin.js

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// This function will check and create an admin if it doesn't exist
async function createAdminIfNotExists() {
  try {
    const adminEmail = 'admin@ims.com';
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 10);

      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isVerified: true, 
      });

      await admin.save();
      console.log('Admin user created: admin@ims.com / Admin@1234');
    } else {
      console.log('Admin already exists');
    }
  } catch (err) {
    console.error('Admin creation failed:', err.message);
  }
}

module.exports = createAdminIfNotExists;
