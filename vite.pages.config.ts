import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/axion-sizer/",
  plugins: [tailwindcss(), viteReact()],
  resolve: { tsconfigPaths: true },
  define: {
    __AXION_SHA__: JSON.stringify(process.env.GITHUB_SHA ?? process.env.VITE_GIT_SHA ?? ""),
  },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL("./index.pages.html", import.meta.url)),
    },
  },
});
