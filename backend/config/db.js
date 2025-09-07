const mongoose = require('mongoose');
require('dotenv').config();
const username= process.env.MONGODB_USERNAME;
const password= process.env.MONGODB_PASSWORD;
const dbLink= `mongodb+srv://${username}:${password}@cluster0.nqkgxey.mongodb.net/TransportProDB?retryWrites=true&w=majority&appName=Cluster0
`


const connectDB = async () => {
  try {
    await mongoose.connect(dbLink);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
