import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src"],
      exclude: ["src/env.d.ts"],
      reporter: ["lcov", "text"],
      thresholds: { 100: true },
    },
  },
});
