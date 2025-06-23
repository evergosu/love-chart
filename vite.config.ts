import { defineConfig } from "vite";

export default defineConfig({
  base: "/love-chart/",
  root: "./src",
  build: {
    outDir: "../dist",
  },
  server: {
    open: true,
  },
});
