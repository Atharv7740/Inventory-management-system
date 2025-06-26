const Truck = require('../models/Truck');


exports.createTruck = async (req, res) => {
  try {
    // Convert RN to uppercase
    req.body.registrationNumber = req.body.registrationNumber?.toUpperCase();

    if (!req.body.registrationNumber) {
      return res.status(400).json({ error: "Registration number is required." });
    }

    const existingTruck = await Truck.findOne({ registrationNumber: req.body.registrationNumber });
    if (existingTruck) {
      return res.status(400).json({ error: 'Truck with this registration number already exists.' });
    }

    const truck = new Truck(req.body);

    // Only calculate if fields are present
    if (truck.sale?.price && truck.purchasePrice) {
      truck.calculateResaleProfit();
    }

    await truck.save();
    res.status(201).json(truck);
  } catch (err) {
    console.error("Truck creation failed:", err);
    res.status(400).json({ error: err.message });
  }
};


// Get all trucks
exports.getTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get truck by ID
exports.getTruckById = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);
    if (!truck) return res.status(404).json({ error: 'Truck not found' });
    res.json(truck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update truck
exports.updateTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);
    if (!truck) return res.status(404).json({ error: 'Truck not found' });

    Object.assign(truck, req.body);
    truck.calculateResaleProfit(); // update profit if sale info updated
    await truck.save();

    res.json({ message: 'Truck updated successfully', truck });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete truck
exports.deleteTruck = async (req, res) => {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);
    if (!truck) return res.status(404).json({ error: 'Truck not found' });
    res.json({ message: 'Truck deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
