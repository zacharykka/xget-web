import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    port: 4173
  },
  test: {
    environment: "jsdom",
    watch: false,
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    server: {
      host: "127.0.0.1",
      port: 0
    }
  }
});
