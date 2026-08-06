import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { DEFAULT_SECTOR } from '../mock/providers';

/** How far ahead of an appointment the reminder should fire, in hours. */
export const REMINDER_LEAD_OPTIONS = [1, 2, 24] as const;
export type ReminderLeadHours = (typeof REMINDER_LEAD_OPTIONS)[number];

export const DEFAULT_REMINDER_LEAD_HOURS: ReminderLeadHours = 1;

type SettingsState = {
  defaultLocation: string;
  setDefaultLocation: (location: string) => void;
  reminderLeadHours: ReminderLeadHours;
  setReminderLeadHours: (hours: ReminderLeadHours) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultLocation: DEFAULT_SECTOR,
      setDefaultLocation: (location: string) =>
        set({ defaultLocation: location }),
      reminderLeadHours: DEFAULT_REMINDER_LEAD_HOURS,
      setReminderLeadHours: (hours: ReminderLeadHours) =>
        set({ reminderLeadHours: hours }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
