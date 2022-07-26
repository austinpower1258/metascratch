import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [
    react(),
    Unocss({
      /* options */
    }),
  ]
})
// export default defineConfig(({ command, mode }) => {
//   const env = loadEnv(mode, process.cwd(), '')
//   return {
//     plugins: [
//       react(),
//       Unocss({
//         /* options */
//       }),
//     ],
//     define: {
//       __APP_ENV__: env.APP_ENV,
//       __LIVE_BLOCKS_PUBLIC_KEY__: env.LIVE_BLOCKS_PUBLIC_KEY
//     }
//   }
// })