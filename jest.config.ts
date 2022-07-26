module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [`/node_modules/(?!(sip\.js))`],
};