import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [
    react(),
    Unocss({
      /* options */
    }),
  ],
  server: {
    host: "0.0.0.0",
  },
});
