import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme/colors';

type BookingInfoCardProps = {
  scheduledFor: string;
  sector: string;
  phone?: string;
};

/** Schedule, sector, and a tap-to-call phone row for a booking. */
export function BookingInfoCard({
  scheduledFor,
  sector,
  phone,
}: BookingInfoCardProps) {
  const call = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <View className="mb-3 flex-row items-center">
        <Ionicons name="time-outline" size={18} color={colors.gray500} />
        <Text className="ml-2 text-sm text-gray-700">{scheduledFor}</Text>
      </View>
      <View className="mb-3 flex-row items-center">
        <Ionicons name="location-outline" size={18} color={colors.gray500} />
        <Text className="ml-2 text-sm text-gray-700">{sector}</Text>
      </View>
      {phone && (
        <Pressable
          onPress={call}
          className="flex-row items-center active:opacity-60"
        >
          <Ionicons name="call-outline" size={18} color={colors.primary} />
          <Text className="ml-2 text-sm font-medium text-primary">{phone}</Text>
        </Pressable>
      )}
    </View>
  );
}
