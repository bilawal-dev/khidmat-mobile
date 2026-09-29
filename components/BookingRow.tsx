import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

import { StatusBadge } from './StatusBadge';
import type { Booking } from '@/lib/stores/useBookingsStore';
import { categoryEmoji, categoryServiceLabel } from '@/lib/categories';
import { isUpcomingStatus } from '@/lib/util/bookingFilters';
import { formatTimeUntil } from '@/lib/util/relativeTime';

type BookingRowProps = {
  booking: Booking;
  /** Shared "now" so every row in a list counts down from the same instant. */
  now: number;
};

/**
 * One tappable booking in the Bookings list: provider, service/sector,
 * schedule with a countdown while it's upcoming, and its status badge.
 */
export function BookingRow({ booking, now }: BookingRowProps) {
  const countdown = isUpcomingStatus(booking.status)
    ? formatTimeUntil(booking.scheduledTimestamp, now)
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/bookings/${booking.id}`)}
      className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
    >
      {/* Category emoji */}
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
        <Text className="text-xl">{categoryEmoji(booking.category)}</Text>
      </View>

      {/* Info */}
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-bold text-gray-900">
          {booking.providerName}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500">
          {categoryServiceLabel(booking.category)} · {booking.sector}
        </Text>
        <View className="mt-0.5 flex-row items-center">
          <Text className="text-xs text-gray-400">{booking.scheduledFor}</Text>
          {countdown && (
            <Text className="ml-2 text-xs font-semibold text-primary">
              · {countdown}
            </Text>
          )}
        </View>
      </View>

      {/* Status badge */}
      <StatusBadge status={booking.status} />
    </Pressable>
  );
}
