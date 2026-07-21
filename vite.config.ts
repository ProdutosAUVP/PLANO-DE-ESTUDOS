import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// Base path for GitHub Pages project site: https://<user>.github.io/<repo>/
// GitHub Pages paths are case-sensitive, so this MUST match the repo name
// exactly. The CI workflow passes BASE_PATH derived from the repo name;
// override with BASE_PATH=/ for a custom domain or user site.
const base = process.env.BASE_PATH ?? "/PLANO-DE-ESTUDOS/";

export default defineConfig({
  base,
  plugins: [
    // Router plugin must run before the React plugin.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
