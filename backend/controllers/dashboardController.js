const Trip = require('../models/Trip');
const Truck = require('../models/Truck');
const User = require('../models/User');

// Get dashboard overview data
const getDashboardOverview = async (req, res) => {
  try {
    // Get all trips and trucks
    const trips = await Trip.find();
    const trucks = await Truck.find();

    // Calculate total transport profit
    const totalTripProfit = trips.reduce((sum, trip) => {
      return sum + (trip.netProfit || 0);
    }, 0);

    // Calculate monthly profit (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyTrips = trips.filter(trip => 
      new Date(trip.tripDate) >= currentMonth
    );
    
    const monthlyProfit = monthlyTrips.reduce((sum, trip) => {
      return sum + (trip.netProfit || 0);
    }, 0);

    // Calculate profit trend (compare with previous month)
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const previousMonthTrips = trips.filter(trip => {
      const tripDate = new Date(trip.tripDate);
      return tripDate >= previousMonth && tripDate < currentMonth;
    });
    
    const previousMonthProfit = previousMonthTrips.reduce((sum, trip) => {
      return sum + (trip.netProfit || 0);
    }, 0);

    const profitTrend = previousMonthProfit > 0 
      ? ((monthlyProfit - previousMonthProfit) / previousMonthProfit * 100).toFixed(1)
      : 0;

    // Trip statistics
    const activeTrips = trips.filter(t => ['pending', 'in-transit'].includes(t.status)).length;
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;

    // Truck statistics
    const totalTrucks = trucks.length;
    const soldTrucks = trucks.filter(t => t.status === 'sold');
    const trucksSoldThisMonth = soldTrucks.filter(t => {
      const saleDate = new Date(t.sale?.date);
      return saleDate >= currentMonth;
    });

    // Calculate total resale profit
    const totalResaleProfit = soldTrucks.reduce((sum, truck) => {
      return sum + (truck.resaleProfit || 0);
    }, 0);

    // Pending NOCs (trucks without NOC document)
    const pendingNOCs = trucks.filter(t => !t.documents?.NOC).length;

    res.json({
      success: true,
      data: {
        // Transportation metrics
        activeTrips,
        totalTrips,
        totalTransportProfit: totalTripProfit,
        monthlyProfit,
        profitTrend: parseFloat(profitTrend),
        
        // Fleet metrics
        trucksInFleet: totalTrucks,
        trucksSoldThisMonth: trucksSoldThisMonth.length,
        pendingNOCs,
        totalResaleProfit,
        
        // Additional metrics for frontend
        completedTrips,
        availableTrucks: trucks.filter(t => t.status === 'available').length,
        inTransitTrucks: trucks.filter(t => t.status === 'in-transit').length
      }
    });
  } catch (err) {
    console.error('Dashboard overview error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching dashboard data.' 
    });
  }
};

// Get recent trips
const getRecentTrips = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentTrips = await Trip.find()
      .sort({ tripDate: -1 })
      .limit(parseInt(limit))
      .select('tripId source destination vehicleId status tripDate netProfit');

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

// Get fleet status
const getFleetStatus = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const fleetStatus = await Truck.find()
      .sort({ lastTripDate: -1 })
      .limit(parseInt(limit))
      .select('registrationNumber model status lastTripDate');

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

// Get all trips with pagination
const getAllTrips = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      vehicleId = '' 
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;

    const skip = (page - 1) * limit;

    const trips = await Trip.find(filter)
      .sort({ tripDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments(filter);

    res.json({
      success: true,
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Get all trips error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching trips.' 
    });
  }
};

// Get all trucks with pagination
const getAllTrucks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      model = '' 
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (model) filter.model = { $regex: model, $options: 'i' };

    const skip = (page - 1) * limit;

    const trucks = await Truck.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Truck.countDocuments(filter);

    res.json({
      success: true,
      trucks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrucks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Get all trucks error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching trucks.' 
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
      expenses,
      customerPayment
    } = req.body;

    if (!source || !destination || !goods || !vehicleId || !customerPayment) {
      return res.status(400).json({ 
        error: 'Source, destination, goods, vehicle ID, and customer payment are required.' 
      });
    }

    const trip = new Trip({
      source,
      destination,
      goods,
      vehicleId,
      expenses: expenses || {},
      customerPayment
    ,
      createdBy: req.user?._id
    });

    await trip.save();

    // Update truck's last trip date
    await Truck.findOneAndUpdate(
      { registrationNumber: vehicleId },
      { lastTripDate: trip.tripDate }
    );

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

// Create new truck
const createTruck = async (req, res) => {
  try {
    const {
      registrationNumber,
      model,
      seller,
      purchaseDate,
      purchasePrice,
      purchasePayments,
      documents,
      expenses,
      sale
    } = req.body;

    if (!registrationNumber || !model || !purchaseDate || !purchasePrice) {
      return res.status(400).json({ 
        error: 'Registration number, model, purchase date, and purchase price are required.' 
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
      seller: seller || {},
      purchaseDate,
      purchasePrice,
      purchasePayments: purchasePayments || [],
      documents: documents || {},
      expenses: expenses || {},
      sale: sale || {},
      createdBy: req.user?._id
    });

    // Calculate resale profit if sale data is provided
    if (truck.sale?.price) {
      truck.calculateResaleProfit();
    }

    await truck.save();

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

module.exports = {
  getDashboardOverview,
  getRecentTrips,
  getFleetStatus,
  getAllTrips,
  getAllTrucks,
  createTrip,
  createTruck
};
