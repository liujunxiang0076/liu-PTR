// Mock expo modules for Jest
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  __ExpoImportMetaRegistry: {
    url: 'http://localhost:8081',
  },
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  ...jest.requireActual('expo-constants'),
  default: {
    ...jest.requireActual('expo-constants').default,
    executionEnvironment: 'standalone',
  },
}));
