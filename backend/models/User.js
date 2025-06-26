// Import mongoose to define the schema
const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  // The user's name
  name: {
    type: String,
    required: true
  },
  // The user's email address (must be unique)
  email: {
    type: String,
    required: true,
    unique: true
  },
  // The user's hashed password
  password: {
    type: String,
    required: true
  },
  // Whether the user's email is verified
  isVerified: {
    type: Boolean,
    default: false
  },
  // Token for verifying email
  verificationToken: String,
  // Token for resetting password
  passwordResetToken: String,
  // Token expiry for password reset
  passwordResetExpires: Date
}, { timestamps: true });

// Export the User model
module.exports = mongoose.model('User', userSchema); 