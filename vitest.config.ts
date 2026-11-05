import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src"],
      reporter: ["lcov", "text"],
      thresholds: { 100: true },
    },
  },
});
