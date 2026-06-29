import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const mmkv = createMMKV({ id: 'workout-tracker-storage' });

/** Adapts the synchronous MMKV instance to zustand's persist storage interface. */
export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  getItem: (name) => mmkv.getString(name) ?? null,
  removeItem: (name) => {
    mmkv.remove(name);
  },
};
