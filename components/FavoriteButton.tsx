import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavoritesStore } from '@/lib/stores/useFavoritesStore';
import { colors } from '@/lib/theme/colors';

type FavoriteButtonProps = {
  providerId: string;
  size?: number;
};

/**
 * Heart toggle for a provider, backed by the favorites store. Reusable across
 * the recommendation card and booking detail so the toggle behaviour lives in
 * one place.
 */
export function FavoriteButton({ providerId, size = 20 }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((s) => s.providerIds.includes(providerId));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <Pressable
      onPress={() => toggle(providerId)}
      hitSlop={8}
      className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-50"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? colors.red600 : colors.gray400}
      />
    </Pressable>
  );
}
