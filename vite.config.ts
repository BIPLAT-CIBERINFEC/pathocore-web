import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          motion: ["framer-motion"],
          react: ["react", "react-dom"],
          router: ["react-router", "react-router-dom"],
          ui: [
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "class-variance-authority",
            "clsx",
            "lucide-react",
            "tailwind-merge",
          ],
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (pathToRewrite) => pathToRewrite.replace(/^\/api/, ""),
      },
    },
  },
});
