/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    '^.+\\.(ts|tsx)$': ["ts-jest",{}],
  },
  preset: 'ts-jest',
};