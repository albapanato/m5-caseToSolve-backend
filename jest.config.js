/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    'index.js',
    'src/db/db.connect.js',
    'src/app.js',
    'src/config.js',
    '.model.js',
    '.router.js',
    'src/controllers/controller.js',
    'src/middleware/files.js',
  ],
};
