import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.ts"],
    reporters: "default",
    hookTimeout: 30000,
    testTimeout: 30000,
    threads: false, // <— keeps E2E stable with one DB instance
  },
});
