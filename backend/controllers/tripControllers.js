const Trip = require('../models/Trip');

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    // Remove user-supplied netProfit if present
    const { netProfit, ...safeData } = req.body;

    const trip = new Trip(safeData);
    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get all trips
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Prevent netProfit override
    const { netProfit, ...safeData } = req.body;

    Object.assign(trip, safeData);
    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Delete a trip
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
