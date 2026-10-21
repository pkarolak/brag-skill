import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { bragLock } from "./vite-plugin-lock";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), bragLock()],
  server: { host: "127.0.0.1" },
});
