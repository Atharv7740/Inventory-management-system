const mongoose = require('mongoose');
require('dotenv').config(); 

const username = encodeURIComponent(process.env.DB_USERNAME);
const password = encodeURIComponent(process.env.DB_PASSWORD);


const dbLink = `mongodb+srv://${username}:${password}@cluster0.nqkgxey.mongodb.net/inventoryDB?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
  try {
    await mongoose.connect(dbLink, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
