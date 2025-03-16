module.exports = {
  // testEnvironment: "jsdom", // Simulate a browser environment
  testEnvironment: "jest-environment-jsdom", // Simulate a browser environment
  setupFilesAfterEnv: ["./src/App.test.js"], // Setup after environment
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
