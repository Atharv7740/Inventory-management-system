const Trip = require('../models/Trip');
const Truck = require('../models/Truck');

// Get all trips with advanced filtering and pagination
const getAllTrips = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      vehicleId = '',
      search = '',
      startDate = '',
      endDate = '',
      sortBy = 'tripDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { tripId: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { goods: { $regex: search, $options: 'i' } },
        { vehicleId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filtering
    if (startDate || endDate) {
      filter.tripDate = {};
      if (startDate) filter.tripDate.$gte = new Date(startDate);
      if (endDate) filter.tripDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const trips = await Trip.find(filter)
      .populate('createdBy', 'fullName username')
      .populate('updatedBy', 'fullName username')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments(filter);

    // Get trip statistics
    const stats = await Trip.aggregate([
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          activeTrips: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'in-transit']] }, 1, 0] }
          },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalProfit: { $sum: '$netProfit' },
          averageProfit: { $avg: '$netProfit' }
        }
      }
    ]);

    res.json({
      success: true,
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalTrips: 0,
        activeTrips: 0,
        completedTrips: 0,
        totalProfit: 0,
        averageProfit: 0
      }
    });
  } catch (err) {
    console.error('Get all trips error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching trips.' 
    });
  }
};

// Get trip by ID
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id)
      .populate('createdBy', 'fullName username email')
      .populate('updatedBy', 'fullName username email');
    
    if (!trip) {
      return res.status(404).json({ 
        error: 'Trip not found.' 
      });
    }

    res.json({
      success: true,
      trip
    });
  } catch (err) {
    console.error('Get trip by ID error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching trip.' 
    });
  }
};

// Create new trip
const createTrip = async (req, res) => {
  try {
    const {
      source,
      destination,
      goods,
      vehicleId,
      distance,
      startDate,
      returnDate,
      expenses,
      customerPayment,
      status = 'pending'
    } = req.body;

    // Validate required fields
    if (!source || !destination || !goods || !vehicleId || !customerPayment) {
      return res.status(400).json({ 
        error: 'Source, destination, goods, vehicle ID, and customer payment are required.' 
      });
    }

    // Check if vehicle exists
    const truck = await Truck.findOne({ registrationNumber: vehicleId });
    if (!truck) {
      return res.status(400).json({ 
        error: 'Truck with this registration number not found.' 
      });
    }

    // Check if truck is available
    if (truck.status !== 'available') {
      return res.status(400).json({ 
        error: 'Truck is not available for trips.' 
      });
    }

    const trip = new Trip({
      source,
      destination,
      goods,
      vehicleId,
      distance: distance || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      returnDate: returnDate ? new Date(returnDate) : new Date(),
      expenses: expenses || {},
      customerPayment,
      status,
      createdBy: req.user._id
    });

    await trip.save();

    // Update truck status if trip is in-transit
    if (status === 'in-transit') {
      await Truck.findOneAndUpdate(
        { registrationNumber: vehicleId },
        { 
          status: 'in-transit',
          lastTripDate: trip.tripDate
        }
      );
    }

    // Populate the created trip
    await trip.populate('createdBy', 'fullName username');

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip
    });
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ 
      error: 'Server error while creating trip.' 
    });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ 
        error: 'Trip not found.' 
      });
    }

    // Store old status for truck status update
    const oldStatus = trip.status;

    // Update trip fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'netProfit') {
        trip[key] = updateData[key];
      }
    });

    trip.updatedBy = req.user._id;
    await trip.save();

    // Update truck status if trip status changed
    if (updateData.status && updateData.status !== oldStatus) {
      let truckStatus = 'available';
      if (updateData.status === 'in-transit') {
        truckStatus = 'in-transit';
      } else if (updateData.status === 'completed') {
        truckStatus = 'available';
      }

      await Truck.findOneAndUpdate(
        { registrationNumber: trip.vehicleId },
        { 
          status: truckStatus,
          lastTripDate: trip.tripDate
        }
      );
    }

    // Populate the updated trip
    await trip.populate('createdBy', 'fullName username');
    await trip.populate('updatedBy', 'fullName username');

    res.json({
      success: true,
      message: 'Trip updated successfully',
      trip
    });
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({ 
      error: 'Server error while updating trip.' 
    });
  }
};

// Delete trip
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ 
        error: 'Trip not found.' 
      });
    }

    // Update truck status back to available if it was in-transit
    if (trip.status === 'in-transit') {
      await Truck.findOneAndUpdate(
        { registrationNumber: trip.vehicleId },
        { status: 'available' }
      );
    }

    await Trip.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ 
      error: 'Server error while deleting trip.' 
    });
  }
};

// Get trip statistics
const getTripStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateFilter = {
          $gte: new Date(now.setDate(now.getDate() - 7))
        };
        break;
      case 'month':
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        };
        break;
      case 'year':
        dateFilter = {
          $gte: new Date(now.getFullYear(), 0, 1)
        };
        break;
    }

    const stats = await Trip.aggregate([
      { $match: { tripDate: dateFilter } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          activeTrips: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'in-transit']] }, 1, 0] }
          },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalProfit: { $sum: '$netProfit' },
          averageProfit: { $avg: '$netProfit' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalTrips: 0,
        activeTrips: 0,
        completedTrips: 0,
        totalProfit: 0,
        averageProfit: 0
      }
    });
  } catch (err) {
    console.error('Get trip stats error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching trip statistics.' 
    });
  }
};

// Get recent trips
const getRecentTrips = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentTrips = await Trip.find()
      .populate('createdBy', 'fullName username')
      .sort({ tripDate: -1 })
      .limit(parseInt(limit))
      .select('tripId source destination vehicleId status tripDate netProfit startDate returnDate');

    res.json({
      success: true,
      trips: recentTrips
    });
  } catch (err) {
    console.error('Recent trips error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching recent trips.' 
    });
  }
};

// Calculate trip profit
const calculateTripProfit = async (req, res) => {
  try {
    const { expenses, customerPayment } = req.body;

    if (!expenses || customerPayment === undefined) {
      return res.status(400).json({ 
        error: 'Expenses and customer payment are required.' 
      });
    }

    const totalExpenses = Object.values(expenses).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );
    
    const netProfit = (customerPayment || 0) - totalExpenses;
    const profitMargin = customerPayment > 0 ? (netProfit / customerPayment * 100) : 0;

    res.json({
      success: true,
      calculation: {
        totalExpenses,
        customerPayment,
        netProfit,
        profitMargin: parseFloat(profitMargin.toFixed(2))
      }
    });
  } catch (err) {
    console.error('Calculate trip profit error:', err);
    res.status(500).json({ 
      error: 'Server error while calculating trip profit.' 
    });
  }
};

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStats,
  getRecentTrips,
  calculateTripProfit
};
