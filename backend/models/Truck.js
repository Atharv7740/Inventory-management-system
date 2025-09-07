const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  method: { type: String, enum: ['cash', 'RTGS', 'cheque', 'UPI', 'other'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
}, { _id: false });

const truckExpenseSchema = new mongoose.Schema({
  // Transportation expenses
  transportation: { type: Number, default: 0 },
  tollCharges: { type: Number, default: 0 },
  tyreCharges: { type: Number, default: 0 },
  fattaExpenses: { type: Number, default: 0 },
  
  // Driver and maintenance
  driverCharges: { type: Number, default: 0 },
  bodyWork: { type: Number, default: 0 },
  paintExpenses: { type: Number, default: 0 },
  builtlyExpenses: { type: Number, default: 0 },
  
  // Fuel and other
  diesel: { type: Number, default: 0 },
  kamaniWork: { type: Number, default: 0 },
  floorExpenses: { type: Number, default: 0 },
  insuranceExpenses: { type: Number, default: 0 },
  
  // Legacy fields for backward compatibility
  tyres: { type: Number, default: 0 },
  painting: { type: Number, default: 0 },
  misc: { type: Number, default: 0 },
}, { _id: false });

const truckSchema = new mongoose.Schema({
  truckId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'TRK' + String(Date.now()).slice(-6);
    }
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  model: { type: String, required: true },
  modelYear: { type: Number, required: true },
  
  // Seller information
  seller: {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    aadhaarNumber: { type: String },
    email: { type: String }
  },
  
  // Purchase information
  purchaseDate: { type: Date, required: true },
  purchasePrice: { type: Number, required: true },
  purchasePayments: [paymentSchema],
  
  // Documents
  documents: {
    NOC: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    fitness: { type: Boolean, default: false },
    tax: { type: Boolean, default: false },
  },
  
  // Expenses
  expenses: truckExpenseSchema,
  
  // Sale information
  sale: {
    buyer: {
      name: String,
      contact: String,
      address: String,
      aadhaarNumber: String,
      email: String
    },
    date: Date,
    price: Number,
    commission: Number,
    commissionDealerName: String,
    payments: [paymentSchema],
  },
  
  resaleProfit: { type: Number },
  status: {
    type: String,
    enum: ['available', 'in-transit', 'maintenance', 'sold'],
    default: 'available'
  },
  lastTripDate: {
    type: Date,
    default: null
  },
  
  // Additional tracking fields
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

truckSchema.methods.calculateResaleProfit = function () {
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
    const profit = this.sale.price - (purchasePrice + totalExpenses + commission);
    this.resaleProfit = isNaN(profit) ? 0 : profit;
  } else {
    this.resaleProfit = undefined;
  }
};

module.exports = mongoose.model('Truck', truckSchema);
