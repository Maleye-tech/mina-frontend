import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["mina.svg"],
      manifest: {
        name: "Mina — Études & bien-être",
        short_name: "Mina",
        description: "Le compagnon d’études et de bien-être des étudiants en santé.",
        theme_color: "#0f766e",
        background_color: "#fafaf7",
        display: "standalone",
        start_url: "/",
        lang: "fr",
        icons: [
          { src: "/mina.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: { cacheName: "mina-pages", networkTimeoutSeconds: 3 },
          },
          {
            urlPattern: /\/cours\//,
            handler: "CacheFirst",
            options: {
              cacheName: "mina-courses",
              expiration: { maxEntries: 80, maxAgeSeconds: 2592000 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://mina-backend-j03f.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
