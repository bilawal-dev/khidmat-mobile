import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BookingStatus } from '@/lib/stores/useBookingsStore';
import { colors } from '@/lib/theme/colors';

const TIMELINE_STEPS: {
  key: BookingStatus;
  label: string;
  icon: 'checkmark-circle' | 'alarm' | 'checkmark-done-circle';
}[] = [
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'reminded', label: 'Reminder scheduled', icon: 'alarm' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle' },
];

/** Index of the active step, or -1 for a cancelled booking. */
function getStepIndex(status: BookingStatus): number {
  if (status === 'cancelled') return -1;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

/** Vertical confirmed → reminded → completed progress, or a cancelled banner. */
export function StatusTimeline({ status }: { status: BookingStatus }) {
  const currentStep = getStepIndex(status);

  return (
    <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
      <Text className="mb-4 text-sm font-bold text-gray-900">
        Status Timeline
      </Text>
      {TIMELINE_STEPS.map((step, idx) => {
        const isActive = idx <= currentStep && status !== 'cancelled';
        const isCurrent = idx === currentStep && status !== 'cancelled';
        return (
          <View key={step.key} className="flex-row">
            {/* Line + Circle */}
            <View className="items-center" style={{ width: 32 }}>
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  isActive ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <Ionicons
                  name={step.icon}
                  size={16}
                  color={isActive ? colors.white : colors.gray400}
                />
              </View>
              {idx < TIMELINE_STEPS.length - 1 && (
                <View
                  className={`h-8 w-0.5 ${
                    isActive ? 'bg-primary-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </View>
            {/* Label */}
            <View className="ml-3 justify-center pb-5">
              <Text
                className={`text-sm ${
                  isCurrent
                    ? 'font-bold text-primary'
                    : isActive
                      ? 'font-medium text-gray-700'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </Text>
            </View>
          </View>
        );
      })}

      {status === 'cancelled' && (
        <View className="mt-2 flex-row items-center rounded-xl bg-red-50 px-3 py-2">
          <Ionicons name="close-circle" size={16} color={colors.red600} />
          <Text className="ml-2 text-sm font-medium text-red-600">
            This booking was cancelled
          </Text>
        </View>
      )}
    </View>
  );
}
