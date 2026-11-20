import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the build works from any sub-path or file:// host
  base: "./",
  build: {
    // Keep syntax compatible with older Android WebViews
    target: "es2017",
  },
});
