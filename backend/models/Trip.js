const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  diesel: { type: Number, default: 0 },
  driver: { type: Number, default: 0 },
  tolls: { type: Number, default: 0 },
  tyre: { type: Number, default: 0 },
  misc: { type: Number, default: 0 },
}, { _id: false });

const tripSchema = new mongoose.Schema({
  source: { type: String, required: true },
  destination: { type: String, required: true },
  goods: { type: String, required: true },
  expenses: { type: expenseSchema, required: true },
  customerPayment: { type: Number, required: true },
  netProfit: { type: Number }, // auto-calculated
}, { timestamps: true });

// Method to calculate netProfit
tripSchema.methods.calculateNetProfit = function () {
  const totalExpenses = Object.values(this.expenses || {}).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  this.netProfit = (this.customerPayment || 0) - totalExpenses;
};

// Automatically calculate profit on save
tripSchema.pre('save', function (next) {
  this.calculateNetProfit();
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
