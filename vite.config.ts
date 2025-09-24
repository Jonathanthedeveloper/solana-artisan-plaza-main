import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Polyfill Node's Buffer for browser builds when dependencies expect it
      buffer: "buffer",
    },
  },
  // Help dependencies that expect Node globals
  define: {
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    include: ["buffer"],
  },
}));
