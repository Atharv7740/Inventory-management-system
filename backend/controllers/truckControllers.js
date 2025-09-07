const Truck = require('../models/Truck');
const Trip = require('../models/Trip');

// Get all trucks with advanced filtering and pagination
const getAllTrucks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      model = '',
      search = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (model) filter.model = { $regex: model, $options: 'i' };
    
    // Search functionality
    if (search) {
      filter.$or = [
        { truckId: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { 'seller.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filtering
    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) filter.purchaseDate.$gte = new Date(startDate);
      if (endDate) filter.purchaseDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const trucks = await Truck.find(filter)
      .populate('createdBy', 'fullName username')
      .populate('updatedBy', 'fullName username')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Truck.countDocuments(filter);

    // Get truck statistics
    const stats = await Truck.aggregate([
      {
        $group: {
          _id: null,
          totalTrucks: { $sum: 1 },
          availableTrucks: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          inTransitTrucks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-transit'] }, 1, 0] }
          },
          soldTrucks: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          maintenanceTrucks: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
          },
          totalInvestment: { $sum: '$purchasePrice' },
          totalResaleProfit: { $sum: '$resaleProfit' },
          pendingNOCs: {
            $sum: { $cond: [{ $eq: ['$documents.NOC', false] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      trucks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrucks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalTrucks: 0,
        availableTrucks: 0,
        inTransitTrucks: 0,
        soldTrucks: 0,
        maintenanceTrucks: 0,
        totalInvestment: 0,
        totalResaleProfit: 0,
        pendingNOCs: 0
      }
    });
  } catch (err) {
    console.error('Get all trucks error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching trucks.' 
    });
  }
};

// Get truck by ID
const getTruckById = async (req, res) => {
  try {
    const { id } = req.params;
    const truck = await Truck.findById(id)
      .populate('createdBy', 'fullName username email')
      .populate('updatedBy', 'fullName username email');
    
    if (!truck) {
      return res.status(404).json({ 
        error: 'Truck not found.' 
      });
    }

    res.json({
      success: true,
      truck
    });
  } catch (err) {
    console.error('Get truck by ID error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching truck.' 
    });
  }
};

// Create new truck
const createTruck = async (req, res) => {
  try {
    const {
      registrationNumber,
      model,
      modelYear,
      seller,
      purchaseDate,
      purchasePrice,
      purchasePayments,
      documents,
      expenses,
      sale
    } = req.body;

    // Validate required fields
    if (!registrationNumber || !model || !modelYear || !purchaseDate || !purchasePrice) {
      return res.status(400).json({ 
        error: 'Registration number, model, model year, purchase date, and purchase price are required.' 
      });
    }

    // Check if truck already exists
    const existingTruck = await Truck.findOne({ registrationNumber });
    if (existingTruck) {
      return res.status(400).json({ 
        error: 'Truck with this registration number already exists.' 
      });
    }

    const truck = new Truck({
      registrationNumber: registrationNumber.toUpperCase(),
      model,
      modelYear,
      seller: seller || {},
      purchaseDate: new Date(purchaseDate),
      purchasePrice,
      purchasePayments: purchasePayments || [],
      documents: documents || {},
      expenses: expenses || {},
      sale: sale || {},
      createdBy: req.user._id
    });

    // Calculate resale profit if sale data is provided
    if (truck.sale?.price) {
      truck.calculateResaleProfit();
    }

    await truck.save();

    // Populate the created truck
    await truck.populate('createdBy', 'fullName username');

    res.status(201).json({
      success: true,
      message: 'Truck added successfully',
      truck
    });
  } catch (err) {
    console.error('Create truck error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Truck with this registration number already exists.' 
      });
    }
    res.status(500).json({ 
      error: 'Server error while creating truck.' 
    });
  }
};

// Update truck
const updateTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ 
        error: 'Truck not found.' 
      });
    }

    // Update truck fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'resaleProfit') {
        truck[key] = updateData[key];
      }
    });

    truck.updatedBy = req.user._id;

    // Recalculate resale profit if sale data is updated
    if (updateData.sale || updateData.purchasePrice || updateData.expenses) {
      truck.calculateResaleProfit();
    }

    await truck.save();

    // Populate the updated truck
    await truck.populate('createdBy', 'fullName username');
    await truck.populate('updatedBy', 'fullName username');

    res.json({
      success: true,
      message: 'Truck updated successfully',
      truck
    });
  } catch (err) {
    console.error('Update truck error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Truck with this registration number already exists.' 
      });
    }
    res.status(500).json({ 
      error: 'Server error while updating truck.' 
    });
  }
};

// Delete truck
const deleteTruck = async (req, res) => {
  try {
    const { id } = req.params;

    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ 
        error: 'Truck not found.' 
      });
    }

    // Check if truck has any active trips
    const activeTrips = await Trip.find({
      vehicleId: truck.registrationNumber,
      status: { $in: ['pending', 'in-transit'] }
    });

    if (activeTrips.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete truck with active trips.' 
      });
    }

    await Truck.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Truck deleted successfully'
    });
  } catch (err) {
    console.error('Delete truck error:', err);
    res.status(500).json({ 
      error: 'Server error while deleting truck.' 
    });
  }
};

// Get truck statistics
const getTruckStats = async (req, res) => {
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

    const stats = await Truck.aggregate([
      { $match: { purchaseDate: dateFilter } },
      {
        $group: {
          _id: null,
          totalTrucks: { $sum: 1 },
          availableTrucks: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          soldTrucks: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          totalInvestment: { $sum: '$purchasePrice' },
          totalResaleProfit: { $sum: '$resaleProfit' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalTrucks: 0,
        availableTrucks: 0,
        soldTrucks: 0,
        totalInvestment: 0,
        totalResaleProfit: 0
      }
    });
  } catch (err) {
    console.error('Get truck stats error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching truck statistics.' 
    });
  }
};

// Get fleet status
const getFleetStatus = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const fleetStatus = await Truck.find()
      .populate('createdBy', 'fullName username')
      .sort({ lastTripDate: -1 })
      .limit(parseInt(limit))
      .select('truckId registrationNumber model status lastTripDate purchaseDate');

    res.json({
      success: true,
      trucks: fleetStatus
    });
  } catch (err) {
    console.error('Fleet status error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching fleet status.' 
    });
  }
};

// Calculate truck profit
const calculateTruckProfit = async (req, res) => {
  try {
    const { purchasePrice, expenses, salePrice, commission } = req.body;

    if (purchasePrice === undefined || salePrice === undefined) {
      return res.status(400).json({ 
        error: 'Purchase price and sale price are required.' 
      });
    }

    const totalExpenses = Object.values(expenses || {}).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );
    
    const totalCommission = Number(commission) || 0;
    const netProfit = salePrice - (purchasePrice + totalExpenses + totalCommission);
    const profitMargin = purchasePrice > 0 ? (netProfit / purchasePrice * 100) : 0;

    res.json({
      success: true,
      calculation: {
        purchasePrice,
        totalExpenses,
        salePrice,
        commission: totalCommission,
        netProfit,
        profitMargin: parseFloat(profitMargin.toFixed(2))
      }
    });
  } catch (err) {
    console.error('Calculate truck profit error:', err);
    res.status(500).json({ 
      error: 'Server error while calculating truck profit.' 
    });
  }
};

// Update truck status
const updateTruckStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['available', 'in-transit', 'maintenance', 'sold'].includes(status)) {
      return res.status(400).json({ 
        error: 'Valid status is required (available, in-transit, maintenance, sold).' 
      });
    }

    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ 
        error: 'Truck not found.' 
      });
    }

    // Check if truck has active trips when changing to maintenance
    if (status === 'maintenance') {
      const activeTrips = await Trip.find({
        vehicleId: truck.registrationNumber,
        status: { $in: ['pending', 'in-transit'] }
      });

      if (activeTrips.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot set truck to maintenance with active trips.' 
        });
      }
    }

    truck.status = status;
    truck.updatedBy = req.user._id;
    await truck.save();

    res.json({
      success: true,
      message: 'Truck status updated successfully',
      truck
    });
  } catch (err) {
    console.error('Update truck status error:', err);
    res.status(500).json({ 
      error: 'Server error while updating truck status.' 
    });
  }
};

// Get available trucks for trip assignment
const getAvailableTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find({ status: 'available' })
      .select('truckId registrationNumber model modelYear lastTripDate')
      .sort({ lastTripDate: 1 }); // Sort by oldest last trip date first

    res.json({
      success: true,
      trucks
    });
  } catch (err) {
    console.error('Get available trucks error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching available trucks.' 
    });
  }
};

module.exports = {
  getAllTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
  getTruckStats,
  getFleetStatus,
  calculateTruckProfit,
  updateTruckStatus,
  getAvailableTrucks
};
