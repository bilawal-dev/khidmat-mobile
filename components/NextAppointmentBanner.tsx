import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useBookingsStore } from '@/lib/stores/useBookingsStore';
import { colors } from '@/lib/theme/colors';
import { categoryEmoji } from '@/lib/categories';
import { nextUpcomingBooking } from '@/lib/util/nextAppointment';
import { formatTimeUntil } from '@/lib/util/relativeTime';

/**
 * A tappable card surfacing the user's soonest upcoming booking. Renders
 * nothing when there is none, so callers can drop it in unconditionally.
 */
export function NextAppointmentBanner() {
  const bookings = useBookingsStore((s) => s.bookings);
  const next = nextUpcomingBooking(bookings, Date.now());
  if (!next) return null;

  const countdown = formatTimeUntil(next.scheduledTimestamp, Date.now());

  return (
    <Pressable
      onPress={() => router.push(`/bookings/${next.id}`)}
      className="mb-6 flex-row items-center rounded-2xl border border-primary-100 bg-primary-50 p-3 active:opacity-80"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
        <Text className="text-lg">{categoryEmoji(next.category)}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
          Next appointment{countdown ? ` · ${countdown}` : ''}
        </Text>
        <Text className="mt-0.5 text-sm font-bold text-gray-900">
          {next.providerName}
        </Text>
        <Text className="text-xs text-gray-500">{next.scheduledFor}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.primary} />
    </Pressable>
  );
}
