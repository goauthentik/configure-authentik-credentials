import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    include: ["**/*.test.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "json-summary", "lcov"],
      include: ["src/**"],
      exclude: ["**/dist/**", "**/node_modules/**"]
    }
  }
});
