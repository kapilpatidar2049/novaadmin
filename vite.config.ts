import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// Use "./" so built app works when opening index.html via file:// (double-click).
// For deploy on a subpath, set VITE_BASE_URL e.g. /2026/beautician/admin/
export default defineConfig({
  base: process.env.VITE_BASE_URL || "./",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
