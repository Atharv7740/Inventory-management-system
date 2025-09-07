const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { createAdminIfNotExists, createSampleStaff } = require('./config/initAdmin');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Swagger Docs
let swaggerDocument = null;
try {
  swaggerDocument = JSON.parse(fs.readFileSync('./swagger-output.json'));
} catch (err) {
  console.warn('⚠️ Swagger doc not found. Run `node swagger-autogen.js` to generate it.');
}
if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📚 Swagger UI available at /api-docs');
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/trucks', require('./routes/truckRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TransportPro Authentication Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to TransportPro Authentication System',
    endpoints: {
      doc: '/api-doc',
      auth: '/api/auth',
      users: '/api/users',
      dashboard: '/api/dashboard',
      trips: '/api/trips',
      trucks: '/api/trucks',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Initialize admin user and start server
const startServer = async () => {
  try {
    await createAdminIfNotExists();
    await createSampleStaff();

    app.listen(PORT, () => {
      console.log('\n TransportPro Authentication Server Started!');
      console.log(` Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log('\n✨ Ready to serve requests!\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
