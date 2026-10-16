import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Dezelfde opzet als de klantsite-template en het portaal: node-omgeving, tests naast de bron.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
