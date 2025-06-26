const Trip = require('../models/Trip');
const Truck = require('../models/Truck');

exports.getOverview = async (req, res) => {
  try {
    const trips = await Trip.find();
    const trucks = await Truck.find();

    // ✅ Calculate total trip profit safely
    const totalTripProfit = trips.reduce((sum, trip) => {
      let netProfit;
      if (typeof trip.netProfit === 'number') {
        netProfit = trip.netProfit;
      } else {
        const totalExpenses = Object.values(trip.expenses || {}).reduce((a, b) => (a || 0) + (b || 0), 0);
        netProfit = (trip.customerPayment || 0) - totalExpenses;
      }
      return sum + (isNaN(netProfit) ? 0 : netProfit);
    }, 0);

    // ✅ Truck stats
    const soldTrucks = trucks.filter(t => t.sale && typeof t.sale.price === 'number');

    const totalResaleProfit = soldTrucks.reduce((sum, truck) => {
      return sum + (truck.resaleProfit || 0);
    }, 0);

    const averageResaleProfit = soldTrucks.length > 0
      ? totalResaleProfit / soldTrucks.length
      : 0;

    const totalPurchaseCost = trucks.reduce((sum, truck) => {
      const baseCost = typeof truck.purchasePrice === 'number' ? truck.purchasePrice : 0;
      const expenseCost = Object.values(truck.expenses || {}).reduce(
        (acc, val) => acc + (typeof val === 'number' ? val : 0),
        0
      );
      return sum + baseCost + expenseCost;
    }, 0);

    const totalSaleRevenue = soldTrucks.reduce((sum, truck) => {
      return sum + (truck.sale.price || 0);
    }, 0);

    // ✅ Send JSON response
    res.json({
      trips: {
        total: trips.length,
        totalProfit: totalTripProfit
      },
      trucks: {
        total: trucks.length,
        totalPurchased: trucks.length,
        totalSold: soldTrucks.length,
        totalResaleProfit,
        averageResaleProfit,
        totalPurchaseCost,
        totalSaleRevenue
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
