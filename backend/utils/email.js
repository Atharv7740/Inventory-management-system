// This file contains helper functions for sending emails using nodemailer
const nodemailer = require('nodemailer');

// Function to create a nodemailer transporter
function createTransporter() {
 
  return nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS  
    }
  });
}

// Function to send an email
async function sendEmail(to, subject, text) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
}

// Export the functions so other files can use them
module.exports = {
  sendEmail,
  createTransporter
}; 