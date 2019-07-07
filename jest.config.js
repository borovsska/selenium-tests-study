// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  setupFilesAfterEnv: [
      './jest.setup.js'
  ],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/test-cases/**/*.js"
  ]
};
