const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "TransportPro API",
    description: "Auto-generated Swagger documentation",
    version: "1.0.0",
  },
  host: "localhost:5000",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  components: {
    schemas: {
      // User, Trip, Truck schemas removed
    },
  },
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "JWT Authorization header. Example: 'Bearer {token}'",
    },
  },
  security: [{ bearerAuth: [] }],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON generated at", outputFile);
});
