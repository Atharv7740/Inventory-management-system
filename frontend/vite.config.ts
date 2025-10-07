// import { defineConfig, Plugin } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { createServer } from "./server";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   build: {
//     outDir: "/",
//   },
//   plugins: [react(), expressPlugin()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./client"),
//       "@shared": path.resolve(__dirname, "./shared"),
//     },
//   },
// }));

// function expressPlugin(): Plugin {
//   return {
//     name: "express-plugin",
//     apply: "serve", // Only apply during development (serve mode)
//     configureServer(server) {
//       const app = createServer();

//       // Add Express app as middleware to Vite dev server
//       server.middlewares.use(app);
//     },
//   };
// }
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

export default defineConfig({
  base: "/", // ✅ for Vercel use "/"
  build: {
    outDir: "dist/spa", // ✅ must be dist
    // Improve chunking for large vendor bundles
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('recharts') || id.includes('three') || id.includes('gsap')) return 'vendor-visuals';
            return 'vendor';
          }
        },
      },
    },
    // Raise the warning limit so moderate bundles don't spam logs (value in KB)
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
