const Trip = require('../models/Trip');
const Truck = require('../models/Truck');

function buildDateFilter(from, to, field = 'createdAt') {
  const filter = {};
  if (from || to) {
    filter[field] = {};
    if (from) filter[field].$gte = new Date(from);
    if (to) filter[field].$lte = new Date(to);
  }
  return filter;
}

// GET /api/reports/overview?from=&to=
const getOverview = async (req, res) => {
  try {
    const { from = '', to = '' } = req.query;

    const tripDateFilter = buildDateFilter(from, to, 'tripDate');
    const truckDateFilter = buildDateFilter(from, to, 'purchaseDate');

    const trips = await Trip.find(tripDateFilter);
    const trucks = await Truck.find(truckDateFilter);

    // Revenue & Profit
    const totalTripRevenue = trips.reduce((s, t) => s + (t.customerPayment || 0), 0);
    const totalTripProfit = trips.reduce((s, t) => s + (t.netProfit || 0), 0);
    const totalSaleRevenue = trucks.reduce((s, tr) => s + (tr.sale?.price || 0), 0);
    const totalResaleProfit = trucks.reduce((s, tr) => s + (tr.resaleProfit || 0), 0);

    // Investment (purchase + truck expenses)
    const totalInvestment = trucks.reduce((sum, tr) => {
      const exp = Object.values(tr.expenses || {}).reduce((a, v) => a + (Number(v) || 0), 0);
      return sum + (tr.purchasePrice || 0) + exp;
    }, 0);

    const activeTrips = trips.filter(t => ['pending', 'in-transit'].includes(t.status)).length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const avgProfitPerTrip = trips.length ? totalTripProfit / trips.length : 0;

    const pendingNOCs = trucks.filter(t => !t.documents?.NOC).length;
    const soldTrucks = trucks.filter(t => t.status === 'sold').length;

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: totalTripRevenue + totalSaleRevenue,
          totalProfit: totalTripProfit + totalResaleProfit,
          totalInvestment,
          activeTrips
        },
        transportPerformance: {
          totalTrips: trips.length,
          completed: completedTrips,
          avgProfitPerTrip,
          totalTransportProfit: totalTripProfit
        },
        inventoryPerformance: {
          totalTrucks: trucks.length,
          sold: soldTrucks,
          pendingNOCs,
          totalInventoryProfit: totalResaleProfit
        }
      }
    });
  } catch (err) {
    console.error('Reports overview error:', err);
    res.status(500).json({ error: 'Server error while generating overview report.' });
  }
};

// GET /api/reports/transport?from=&to=&status=
const getTransportReport = async (req, res) => {
  try {
    const { from = '', to = '', status = '' } = req.query;
    const match = buildDateFilter(from, to, 'tripDate');
    if (status) match.status = status;

    const trips = await Trip.find(match);

    // Top performing trucks by trip profit
    const regToAgg = new Map();
    for (const t of trips) {
      const key = t.vehicleId;
      if (!regToAgg.has(key)) regToAgg.set(key, { vehicleId: key, trips: 0, totalProfit: 0 });
      const agg = regToAgg.get(key);
      agg.trips += 1;
      agg.totalProfit += (t.netProfit || 0);
    }
    const topTrucks = Array.from(regToAgg.values())
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 20);

    // Expense breakdown
    const expenseTotals = { diesel: 0, tolls: 0, driver: 0, other: 0 };
    for (const t of trips) {
      const e = t.expenses || {};
      expenseTotals.diesel += Number(e.diesel || 0);
      expenseTotals.tolls += Number(e.tolls || 0);
      expenseTotals.driver += Number(e.driver || 0);
      expenseTotals.other += Number(e.tyre || 0) + Number(e.misc || 0);
    }

    // Monthly performance (month, trips, revenue, profit)
    const monthlyMap = new Map();
    for (const t of trips) {
      const d = new Date(t.tripDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, { month: key, trips: 0, revenue: 0, profit: 0 });
      const row = monthlyMap.get(key);
      row.trips += 1;
      row.revenue += (t.customerPayment || 0);
      row.profit += (t.netProfit || 0);
    }
    const monthlyPerformance = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    res.json({ success: true, data: { topTrucks, expenseTotals, monthlyPerformance } });
  } catch (err) {
    console.error('Transport report error:', err);
    res.status(500).json({ error: 'Server error while generating transport report.' });
  }
};

// GET /api/reports/inventory?from=&to=&status=
const getInventoryReport = async (req, res) => {
  try {
    const { from = '', to = '', status = '' } = req.query;
    const match = buildDateFilter(from, to, 'purchaseDate');
    if (status) match.status = status;

    const trucks = await Truck.find(match);

    // Top selling models by resale profit (sold only)
    const modelAgg = new Map();
    for (const tr of trucks.filter(t => t.status === 'sold')) {
      const key = tr.model;
      if (!modelAgg.has(key)) modelAgg.set(key, { model: key, sold: 0, profit: 0 });
      const agg = modelAgg.get(key);
      agg.sold += 1;
      agg.profit += (tr.resaleProfit || 0);
    }
    const topSellingModels = Array.from(modelAgg.values()).sort((a, b) => b.profit - a.profit).slice(0, 20);

    // Expense breakdown from truck expenses
    const expenseKeys = [
      'transportation','bodyWork','kamaniWork','tyreCharges','paintExpenses','insuranceExpenses','other','driverCharges','tollCharges','diesel','builtlyExpenses','floorExpenses','fattaExpenses'
    ];
    const expenseTotals = Object.fromEntries(expenseKeys.map(k => [k, 0]));
    for (const tr of trucks) {
      const e = tr.expenses || {};
      for (const k of expenseKeys) expenseTotals[k] += Number(e[k] || 0);
    }

    // Monthly sales performance (sold only)
    const monthMap = new Map();
    for (const tr of trucks.filter(t => t.sale?.date)) {
      const d = new Date(tr.sale.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(key)) monthMap.set(key, { month: key, sales: 0, revenue: 0, profit: 0 });
      const row = monthMap.get(key);
      row.sales += 1;
      row.revenue += (tr.sale.price || 0);
      row.profit += (tr.resaleProfit || 0);
    }
    const monthlySales = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    res.json({ success: true, data: { topSellingModels, expenseTotals, monthlySales } });
  } catch (err) {
    console.error('Inventory report error:', err);
    res.status(500).json({ error: 'Server error while generating inventory report.' });
  }
};

module.exports = {
  getOverview,
  getTransportReport,
  getInventoryReport
};



