const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const {
  createAdminIfNotExists,
  createSampleStaff,
} = require("./config/initAdmin");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple CORS for local development
app.use(cors({ origin: true, credentials: true }));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// Request logging middleware (simple)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for Render deployment
app.set("trust proxy", 1);





// Swagger Docs
let swaggerDocument = null;
try {
  if (fs.existsSync("./swagger-output.json")) {
    swaggerDocument = JSON.parse(fs.readFileSync("./swagger-output.json"));

    // Update swagger host for production
    if (
      process.env.NODE_ENV === "production" &&
      process.env.RENDER_EXTERNAL_URL
    ) {
      const renderUrl = new URL(process.env.RENDER_EXTERNAL_URL);
      swaggerDocument.host = renderUrl.host;
      swaggerDocument.schemes = ["https"];
    }
  }
} catch (err) {
  console.warn(
    "⚠️ Swagger doc not found or invalid. Run `node swagger-autogen.js` to generate it."
  );
}

if (swaggerDocument) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customSiteTitle: "TransportPro API Documentation",
    })
  );
  console.log("📚 Swagger UI available at /api-docs");
}

// Routes
app.use("/api/auth", require("./Routes/authRoutes"));
app.use("/api/users", require("./Routes/userRoutes"));
app.use("/api/dashboard", require("./Routes/dashboardRoutes"));
app.use("/api/trips", require("./Routes/tripRoutes"));
app.use("/api/trucks", require("./Routes/truckRoutes"));

// Root endpoint
app.get("/", (req, res) => {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.RENDER_EXTERNAL_URL || `https://your-app-name.onrender.com`
      : `http://localhost:${PORT}`;

  res.json({
    success: true,
    message: "Welcome to TransportPro Authentication System",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    baseUrl: baseUrl,
  
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error Details:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(err.status || 500).json({
    success: false,
    error: err.status === 404 ? "Not Found" : "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : err.status === 404
        ? "The requested resource was not found"
        : "Something went wrong on our end",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Initialize admin user and start server
const startServer = async () => {
  try {
    await createAdminIfNotExists();
    await createSampleStaff();

    app.listen(PORT  ,()=> {
      
      console.log(`Server running at http://localhost:${PORT}`);

    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
