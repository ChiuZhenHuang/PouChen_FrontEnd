import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vuetify from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    tailwindcss(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "寶成前端",
        short_name: "寶成前端",
        description: "寶成前端",
        theme_color: "#ffffff",
        start_url: "/",
        display: "standalone",
        icons: [
          {
            src: "chiikawa.jpg",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "chiikawa.jpg",
            sizes: "512x512",
            type: "image/png",
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
});
