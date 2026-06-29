module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: [
    require.resolve('@react-native/jest-preset/jest/setup.js'),
    './jest/setup.js',
  ],
  moduleNameMapper: {
    '^@nozbe/watermelondb/adapters/sqlite$': '<rootDir>/jest/mocks/sqliteAdapter.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-.*|@react-native-.*|@gorhom/.*|@shopify/.*|@nozbe/.*|victory-native|d3-.*|internmap|delaunator|robust-predicates)/)',
  ],
};
