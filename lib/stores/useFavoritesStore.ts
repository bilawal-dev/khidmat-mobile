import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Favourited provider ids. Kept as a plain string array (not a Set) so it
 * serializes cleanly through AsyncStorage/JSON without a custom replacer.
 */
type FavoritesState = {
  providerIds: string[];
  isFavorite: (providerId: string) => boolean;
  toggle: (providerId: string) => void;
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      providerIds: [],
      isFavorite: (providerId) => get().providerIds.includes(providerId),
      toggle: (providerId) =>
        set((state) => ({
          providerIds: state.providerIds.includes(providerId)
            ? state.providerIds.filter((id) => id !== providerId)
            : [providerId, ...state.providerIds],
        })),
      clear: () => set({ providerIds: [] }),
    }),
    {
      name: STORAGE_KEYS.favorites,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
