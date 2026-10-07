const { loadEnv } = require("@medusajs/utils");
loadEnv("test", process.cwd());

module.exports = {
  transform: {
    "^.+\\.[jt]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
        },
      },
    ],
  },
  /* @medusajs/core-flows calls require("uuid") without declaring uuid, so pnpm
     hands it the hoisted copy — which is Payload's uuid v13, ESM-only with no
     CommonJS build at all. Node 24 can require() an ESM graph and the server
     runs fine; jest's own CJS loader cannot, and every integration spec died
     at import with "Must use import to load ES Module".

     transformIgnorePatterns is the wrong lever: jest decides a file is ESM
     from its package's "type" before any transform runs. So this app declares
     its own dual-build uuid and points jest at its CommonJS entry. */
  moduleNameMapper: {
    "^uuid$": require.resolve("uuid"),
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/", "<rootDir>/.medusa/"],
  setupFiles: ["./integration-tests/setup.js"],
};

if (process.env.TEST_TYPE === "integration:http") {
  module.exports.testMatch = ["**/integration-tests/http/*.spec.[jt]s"];
} else if (process.env.TEST_TYPE === "integration:modules") {
  module.exports.testMatch = ["**/src/modules/*/__tests__/**/*.[jt]s"];
} else if (process.env.TEST_TYPE === "unit") {
  module.exports.testMatch = ["**/src/**/__tests__/**/*.unit.spec.[jt]s"];
}
