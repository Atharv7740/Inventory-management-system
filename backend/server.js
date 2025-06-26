const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

const createAdminIfNotExists = require('./config/initAdmin');
createAdminIfNotExists(); 

const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.use('/api/trips', require('./Routes/tripRoutes'));
app.use('/api/trucks', require('./Routes/truckRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
