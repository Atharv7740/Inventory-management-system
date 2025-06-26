const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  method: { type: String, enum: ['cash', 'GPay', 'RTGS', 'cheque', 'other'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
}, { _id: false });

const truckExpenseSchema = new mongoose.Schema({
  diesel: { type: Number, default: 0 },
  bodyWork: { type: Number, default: 0 },
  tyres: { type: Number, default: 0 },
  painting: { type: Number, default: 0 },
  misc: { type: Number, default: 0 },
}, { _id: false });

const truckSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/  // e.g., MH12AB1234
  },
  model: { type: String, required: true },
  seller: {
    name: String,
    contact: String,
    address: String,
  },
  purchaseDate: { type: Date, required: true },
  purchasePrice: { type: Number, required: true },
  purchasePayments: [paymentSchema], // stored, not used in profit
  documents: {
    NOC: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    fitness: { type: Boolean, default: false },
    tax: { type: Boolean, default: false },
  },
  expenses: truckExpenseSchema,
  sale: {
    buyer: {
      name: String,
      contact: String,
      address: String,
    },
    date: Date,
    price: Number,
    commission: Number, // stored only
    payments: [paymentSchema],
  },
  resaleProfit: { type: Number },
}, { timestamps: true });

truckSchema.methods.calculateResaleProfit = function () {
  // Make sure all required data exists and is numeric
  if (
    this.sale?.price != null &&
    typeof this.purchasePrice === 'number'
  ) {
    const purchasePrice = this.purchasePrice;

    const totalExpenses = Object.values(this.expenses || {}).reduce(
      (sum, val) => sum + (typeof val === 'number' ? val : 0),
      0
    );

    const commission = typeof this.sale.commission === 'number' ? this.sale.commission : 0;

    // Final resale profit formula
    const profit = this.sale.price - (purchasePrice + totalExpenses + commission);

    this.resaleProfit = isNaN(profit) ? 0 : profit;
  } else {
    // Don’t calculate if data is incomplete
    this.resaleProfit = undefined;
  }
};


module.exports = mongoose.model('Truck', truckSchema);
