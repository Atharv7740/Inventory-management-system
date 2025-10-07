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

// CORS Configuration for production deployment
// Allowlist includes:
// - FRONTEND_URL env var (if set on Render)
// - the Vercel frontend deployed URL
// - local dev origins for development
const productionOrigins = [];
if (process.env.FRONTEND_URL) {
  // normalize (remove trailing slash)
  productionOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}
// Add the Vercel frontend URL used in your project (TransportPro)
productionOrigins.push("https://transportpro.vercel.app");

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? productionOrigins
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
          "http://localhost:5000",
          "http://localhost:5173",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  optionsSuccessStatus: 200, // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for Render deployment
app.set("trust proxy", 1);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`${timestamp} - ${method} ${path} - IP: ${ip}`);
  next();
});

// Health check endpoint (should be before other routes for faster response)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TransportPro Authentication Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
  });
});

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
    endpoints: {
      documentation: `${baseUrl}/api-docs`,
      auth: `${baseUrl}/api/auth`,
      users: `${baseUrl}/api/users`,
      dashboard: `${baseUrl}/api/dashboard`,
      trips: `${baseUrl}/api/trips`,
      trucks: `${baseUrl}/api/trucks`,
      health: `${baseUrl}/api/health`,
    },
    availableRoutes: {
      "POST /api/auth/login": "User login",
      "POST /api/auth/register": "User registration",
      "GET /api/health": "Health check",
      "GET /api-docs": "API documentation",
    },
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
    availableEndpoints: [
      "/api/auth",
      "/api/users",
      "/api/dashboard",
      "/api/trips",
      "/api/trucks",
      "/api/health",
      "/api-docs",
    ],
  });
});

// Initialize admin user and start server
const startServer = async () => {
  try {
    await createAdminIfNotExists();
    await createSampleStaff();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n TransportPro Authentication Server Started!");
      console.log(` Server running on port ${PORT}`);
      console.log(`Base URL: http://localhost:${PORT}`);
      console.log("\nReady to serve requests!\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
