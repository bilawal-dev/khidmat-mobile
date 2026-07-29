import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { AgentThreadSection } from '@/components/AgentThreadSection';
import { BookingInfoCard } from '@/components/BookingInfoCard';
import { Button } from '@/components/Button';
import { useBookingsStore } from '@/lib/stores/useBookingsStore';
import { providers } from '@/lib/mock/providers';
import { categoryEmoji, categoryServiceLabel } from '@/lib/categories';
import { colors } from '@/lib/theme/colors';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookings = useBookingsStore((s) => s.bookings);
  const booking = useMemo(
    () => bookings.find((b) => b.id === id),
    [bookings, id],
  );
  const cancel = useBookingsStore((s) => s.cancel);
  const updateStatus = useBookingsStore((s) => s.updateStatus);

  const provider = providers.find((p) => p.id === booking?.providerId);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            if (id) {
              cancel(id);
              router.back();
            }
          },
        },
      ],
    );
  }, [id, cancel]);

  const handleMarkCompleted = useCallback(() => {
    if (!id) return;
    Alert.alert('Mark as Completed', 'Service is done? This marks the booking complete.', [
      { text: 'Not yet', style: 'cancel' },
      {
        text: 'Mark Completed',
        onPress: () => updateStatus(id, 'completed'),
      },
    ]);
  }, [id, updateStatus]);

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={['top']}>
        <Text className="text-gray-400">Booking not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Custom header — avoids edge-to-edge overlap on Android */}
      <View className="flex-row items-center border-b border-gray-50 px-4 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">
          Booking Details
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-white px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
      {/* Provider Header */}
      <View className="items-center pb-4">
        <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-primary-100">
          <Text className="text-3xl">{categoryEmoji(booking.category)}</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">
          {booking.providerName}
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          {categoryServiceLabel(booking.category)}
        </Text>
        <View className="mt-2">
          <StatusBadge status={booking.status} />
        </View>
      </View>

      {/* Booking Info */}
      <BookingInfoCard
        scheduledFor={booking.scheduledFor}
        sector={booking.sector}
        phone={provider?.phone}
      />

      {/* Agent Thread (collapsible) */}
      <AgentThreadSection thread={booking.agentThread} />

      {/* Status Timeline */}
      <StatusTimeline status={booking.status} />

      {/* Actions */}
      {(booking.status === 'confirmed' || booking.status === 'reminded') && (
        <View className="mb-12 gap-3">
          <Button variant="primary" onPress={handleMarkCompleted}>
            Mark as completed
          </Button>
          <Button variant="destructive" onPress={handleCancel}>
            Cancel booking
          </Button>
        </View>
      )}

      <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
