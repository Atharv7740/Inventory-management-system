const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  diesel: { type: Number, default: 0 },
  driver: { type: Number, default: 0 },
  tolls: { type: Number, default: 0 },
  tyre: { type: Number, default: 0 },
  misc: { type: Number, default: 0 },
}, { _id: false });

const tripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return 'TRP' + String(Date.now()).slice(-6);
    }
  },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  goods: { type: String, required: true },
  vehicleId: { type: String, required: true },
  distance: { type: Number, default: 0 }, // Distance in km
  startDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  expenses: { type: expenseSchema, required: true },
  customerPayment: { type: Number, required: true },
  netProfit: { type: Number },
  status: {
    type: String,
    enum: ['completed', 'in-transit', 'pending', 'cancelled'],
    default: 'pending'
  },
  tripDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Method to calculate netProfit
tripSchema.methods.calculateNetProfit = function () {
  const totalExpenses = Object.values(this.expenses || {}).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  this.netProfit = (this.customerPayment || 0) - totalExpenses;
};

// Always calculate netProfit before validate & save
tripSchema.pre(['validate', 'save'], function (next) {
  this.calculateNetProfit();
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
