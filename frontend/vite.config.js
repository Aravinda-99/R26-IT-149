import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
});
