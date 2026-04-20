import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      // This forces EVERY import of 'graphql' to use the exact same file
      graphql: path.resolve(__dirname, "./node_modules/graphql/index.js"),
    },
  },
});
