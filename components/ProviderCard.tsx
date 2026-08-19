import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Provider } from '@/lib/mock/providers';
import { categoryEmoji, categoryServiceLabel } from '@/lib/categories';
import { colors } from '@/lib/theme/colors';
import { formatSchedule } from '@/lib/util/schedule';
import { FavoriteButton } from './FavoriteButton';

type ProviderCardProps = {
  provider: Provider;
  distanceKm: number;
  reasoning: string;
  suggestedSlot: string;
  dayLabel: string;
  onBook: () => void;
};

export function ProviderCard({
  provider,
  distanceKm,
  reasoning,
  suggestedSlot,
  dayLabel,
  onBook,
}: ProviderCardProps) {
  return (
    <View className="mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
          <Text className="text-lg">{categoryEmoji(provider.category)}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-gray-900">
            {provider.name}
          </Text>
          <Text className="text-xs text-gray-500">
            {categoryServiceLabel(provider.category)}
          </Text>
        </View>
        <FavoriteButton providerId={provider.id} />
      </View>

      {/* Stats row */}
      <View className="mt-3 flex-row items-center gap-3">
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={14} color={colors.gray500} />
          <Text className="ml-1 text-xs text-gray-600">
            {distanceKm} km away
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xs text-yellow-500">★</Text>
          <Text className="ml-0.5 text-xs font-semibold text-gray-700">
            {provider.rating}
          </Text>
          <Text className="ml-1 text-xs text-gray-400">
            · {provider.reviewCount} reviews
          </Text>
        </View>
      </View>

      {/* Price + slot */}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs font-medium text-gray-500">
          {provider.priceRange}
        </Text>
        <View className="flex-row items-center rounded-full bg-primary-50 px-2.5 py-1">
          <Ionicons name="time-outline" size={12} color={colors.primaryActive} />
          <Text className="ml-1 text-xs font-semibold text-primary-700">
            {formatSchedule(dayLabel, suggestedSlot)}
          </Text>
        </View>
      </View>

      {/* Reasoning */}
      <Text className="mt-2 text-xs italic text-gray-400">{reasoning}</Text>

      {/* Book button */}
      <Pressable
        onPress={onBook}
        className="mt-3 items-center rounded-xl bg-primary py-3 active:bg-primary-600"
      >
        <Text className="text-sm font-bold text-white">
          Book {dayLabel} at {suggestedSlot}
        </Text>
      </Pressable>
    </View>
  );
}
