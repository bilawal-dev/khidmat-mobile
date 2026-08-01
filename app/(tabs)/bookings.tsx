import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { StatusBadge } from '@/components/StatusBadge';
import { useBookingsStore } from '@/lib/stores/useBookingsStore';
import { categoryEmoji, categoryServiceLabel } from '@/lib/categories';
import { colors } from '@/lib/theme/colors';
import { pluralize } from '@/lib/util/text';
import {
  BOOKING_TABS,
  countByTab,
  filterBookingsByTab,
  type BookingTab,
} from '@/lib/util/bookingFilters';

// Pull-to-refresh has no real backend to hit; spin briefly for feedback.
const REFRESH_SIMULATION_MS = 600;

export default function BookingsScreen() {
  const rawBookings = useBookingsStore((s) => s.bookings);
  const bookings = useMemo(
    () => [...rawBookings].sort((a, b) => b.createdAt - a.createdAt),
    [rawBookings],
  );
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');

  const counts = useMemo(() => countByTab(bookings), [bookings]);
  const visible = useMemo(
    () => filterBookingsByTab(bookings, activeTab),
    [bookings, activeTab],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), REFRESH_SIMULATION_MS);
  }, []);

  if (bookings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="border-b border-gray-50 px-5 pb-3 pt-4">
          <Text className="text-lg font-bold text-gray-900">Bookings</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl">📋</Text>
          <Text className="mt-4 text-lg font-semibold text-gray-700">
            No bookings yet
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            Start a conversation to book a service provider
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            className="mt-5 rounded-2xl bg-primary-50 px-6 py-2.5 active:bg-primary-100"
          >
            <Text className="text-sm font-semibold text-primary">
              Go to Chat
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="border-b border-gray-50 px-5 pb-3 pt-4">
        <Text className="text-lg font-bold text-gray-900">Bookings</Text>
        <Text className="text-xs text-gray-400">
          {bookings.length} {pluralize(bookings.length, 'booking')}
        </Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row border-b border-gray-50 px-4">
        {BOOKING_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`mr-5 border-b-2 pb-2.5 pt-1 ${
                isActive ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {tab.label} ({counts[tab.key]})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {visible.length === 0 && (
          <View className="items-center px-8 pt-16">
            <Text className="text-4xl">🗂️</Text>
            <Text className="mt-3 text-center text-sm text-gray-400">
              No {activeTab} bookings
            </Text>
          </View>
        )}
        {visible.map((booking) => (
          <Pressable
            key={booking.id}
            onPress={() => router.push(`/bookings/${booking.id}`)}
            className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
          >
            {/* Category emoji */}
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
              <Text className="text-xl">
                {categoryEmoji(booking.category)}
              </Text>
            </View>

            {/* Info */}
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-bold text-gray-900">
                {booking.providerName}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                {categoryServiceLabel(booking.category)} · {booking.sector}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                {booking.scheduledFor}
              </Text>
            </View>

            {/* Status badge */}
            <StatusBadge status={booking.status} />
          </Pressable>
        ))}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
