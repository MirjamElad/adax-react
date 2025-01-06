module.exports = {
  // Automatically discover tests in `__tests__` directory
  preset: 'ts-jest', // Use ts-jest to handle TypeScript
  testEnvironment: 'jsdom', // Needed for testing React components
  roots: ["<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: [
      "<rootDir>/test/__fixtures__",
      "<rootDir>/node_modules",
      "<rootDir>/dist",
  ],
  // Use TypeScript as the testing language
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // Transform JavaScript/ES modules using Babel
  }, 
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!adax-core)', // Ensure adax-core is transformed
  ],
  // Enable coverage reporting
  collectCoverage: true,
  moduleNameMapper: {
    //'/adax-core/': 'node_modules/adax-core/dist',
    "^adax-core(.*)$": "<rootDir>/node_modules/adax-core/dist$1"
  },
  moduleDirectories: ['node_modules', 'src'],
  // Set the coverage threshold to 80%
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50,
    },
  },
};