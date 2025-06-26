// Import express to create the router
const express = require('express');
const router = express.Router();

// Import the authentication controller
const authController = require('../controllers/authController');

// Route for user signup (register)
router.post('/signup', authController.signup);

// Route for user signin (login)
router.post('/signin', authController.signin);

// Route for email verification
router.get('/verify/:token', authController.verify);

// Route for forgot password (send reset link)
router.post('/forgot', authController.forgotPassword);

// Route for resetting password
router.post('/reset/:token', authController.resetPassword);

// Export the router
module.exports = router; 