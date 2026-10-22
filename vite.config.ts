/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// served from GitHub Pages at /hey/
export default defineConfig({
  base: "/hey/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "hey you",
        short_name: "hey you",
        description: "a relationship-with-yourself app",
        start_url: "/hey/",
        scope: "/hey/",
        display: "standalone",
        background_color: "#fbf1ea",
        theme_color: "#fbf1ea",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,woff2}"] }
    })
  ],
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node"
  }
});
