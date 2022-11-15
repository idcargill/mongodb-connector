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
  transform: {
    '\/src\/.+(js|ts|tsx)$': 'babel-jest',
    '/__tests__/MongoDbConnector.test.ts': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  testRegex: '(/src/__tests__/*|(\\.|/)(test|spec))\\.(js|jsx)$',
  moduleFileExtensions: ['js', 'ts'],

};