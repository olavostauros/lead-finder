import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  test: {
    include: ["app/**/*.test.ts"],
  },
});
