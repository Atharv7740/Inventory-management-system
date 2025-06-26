const express = require('express');
const router = express.Router();
const truckController = require('../controllers/truckControllers');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, truckController.createTruck);
router.get('/', authMiddleware, truckController.getTrucks);
router.get('/:id', authMiddleware, truckController.getTruckById);
router.put('/:id', authMiddleware, truckController.updateTruck);
router.delete('/:id', authMiddleware, truckController.deleteTruck);

module.exports = router;
