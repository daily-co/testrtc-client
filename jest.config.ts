module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|js|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [`/node_modules/(?!(sip\.js))`],
};