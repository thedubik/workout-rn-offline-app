import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemePreference, WeightUnit } from '../types/settings';
import { mmkvStorage } from './storage';

export interface SettingsStore {
  unit: WeightUnit;
  restTimerDefault: number;
  theme: ThemePreference;
  setUnit: (unit: WeightUnit) => void;
  setRestTimerDefault: (seconds: number) => void;
  setTheme: (theme: ThemePreference) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      unit: 'kg',
      restTimerDefault: 90,
      theme: 'system',
      setUnit: (unit) => set({ unit }),
      setRestTimerDefault: (restTimerDefault) => set({ restTimerDefault }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
