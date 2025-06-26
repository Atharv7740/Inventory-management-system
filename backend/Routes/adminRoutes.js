// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {authMiddleware,adminOnly} = require('../middleware/auth'); 

router.get('/dashboard/overview',authMiddleware,adminOnly,adminController.getOverview);

module.exports = router;
