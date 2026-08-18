import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/CaseReady/",
  build: {
    rollupOptions: {
      input: "index.source.html",
    },
  },
  plugins: [react()],
  server: {
    host: "0.0.0.0",
  },
});
