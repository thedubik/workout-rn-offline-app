/* globals jest */

import 'react-native-gesture-handler/jestSetup';
import '@shopify/react-native-skia/jestSetup';

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-mmkv', () => {
  const createMockMMKV = () => {
    const store = new Map();
    return {
      set: (key, value) => store.set(key, value),
      getString: (key) => store.get(key),
      getNumber: (key) => store.get(key),
      getBoolean: (key) => store.get(key),
      contains: (key) => store.has(key),
      remove: (key) => store.delete(key),
      delete: (key) => store.delete(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
      addOnValueChangedListener: () => ({ remove: () => {} }),
      recrypt: () => {},
      trim: () => {},
    };
  };

  return {
    MMKV: jest.fn().mockImplementation(createMockMMKV),
    createMMKV: jest.fn().mockImplementation(createMockMMKV),
    useMMKV: () => createMockMMKV(),
    useMMKVString: () => [undefined, jest.fn()],
    useMMKVNumber: () => [undefined, jest.fn()],
    useMMKVBoolean: () => [undefined, jest.fn()],
  };
});

jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: { trigger: jest.fn() },
  trigger: jest.fn(),
  HapticFeedbackTypes: {},
}));

jest.mock('react-native-background-timer', () => ({
  __esModule: true,
  default: {
    setTimeout: (callback, timeout) => setTimeout(callback, timeout),
    clearTimeout: (id) => clearTimeout(id),
    setInterval: (callback, timeout) => setInterval(callback, timeout),
    clearInterval: (id) => clearInterval(id),
    start: jest.fn(),
    stop: jest.fn(),
  },
}));
