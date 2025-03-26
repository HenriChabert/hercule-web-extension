import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import manifest from "./public/manifest.json";
import { crx } from "@crxjs/vite-plugin";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
