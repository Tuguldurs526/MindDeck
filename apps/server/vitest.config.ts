import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup-env.ts", "./test/setup.ts"],
    // SERIALIZE workers to avoid concurrent Mongo downloads on Windows
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true,
        maxThreads: 1,
      },
    },
    // In case a suite is heavy, give it air
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
