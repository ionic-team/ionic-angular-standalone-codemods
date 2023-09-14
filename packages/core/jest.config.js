module.exports = {
  verbose: true,
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
};
