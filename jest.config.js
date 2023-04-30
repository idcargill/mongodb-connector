/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testEnvironmentOptions: {},
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/node_modules/',
  ],
  transform: {},
  transformIgnorePatterns: ['/node_modules/'],
  testRegex: '(/src/)?__tests__/.+[.]test[.](ts|tsx|js)$',
  moduleFileExtensions: ['js', 'ts', 'tsx'],
};
