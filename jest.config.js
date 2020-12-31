module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover", "text-summary"],
};
