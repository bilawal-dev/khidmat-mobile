import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useSettingsStore,
  REMINDER_LEAD_OPTIONS,
  type ReminderLeadHours,
} from '@/lib/stores/useSettingsStore';
import { useBookingsStore } from '@/lib/stores/useBookingsStore';
import { Button } from '@/components/Button';
import { SECTORS as SECTOR_OPTIONS, DEFAULT_SECTOR } from '@/lib/mock/providers';
import { colors } from '@/lib/theme/colors';
import { computeBookingSummary } from '@/lib/util/bookingSummary';

// Delay the blur handler so a dropdown option's onPress can fire first.
const DROPDOWN_BLUR_DELAY_MS = 200;

/** Human label for a reminder lead time (e.g. 1 → "1 hour", 24 → "1 day"). */
function reminderLeadLabel(hours: number): string {
  if (hours >= 24) {
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export default function SettingsScreen() {
  const defaultLocation = useSettingsStore((s) => s.defaultLocation);
  const setDefaultLocation = useSettingsStore((s) => s.setDefaultLocation);
  const reminderLeadHours = useSettingsStore((s) => s.reminderLeadHours);
  const setReminderLeadHours = useSettingsStore((s) => s.setReminderLeadHours);
  const bookings = useBookingsStore((s) => s.bookings);
  const clearBookings = useBookingsStore((s) => s.clear);

  const summary = useMemo(() => computeBookingSummary(bookings), [bookings]);

  const [locationInput, setLocationInput] = useState(defaultLocation);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSectors = useMemo(() => {
    if (!locationInput) return SECTOR_OPTIONS;
    return SECTOR_OPTIONS.filter((s) =>
      s.toLowerCase().includes(locationInput.toLowerCase()),
    );
  }, [locationInput]);

  const handleLocationChange = (text: string) => {
    setLocationInput(text);
    setShowDropdown(true);
    // Save deferred — only commit valid sectors on blur or select
  };

  const handleSectorSelect = (sector: string) => {
    setLocationInput(sector);
    setDefaultLocation(sector);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      const trimmed = locationInput.trim();
      const matched = SECTOR_OPTIONS.find(
        (s) => s.toLowerCase() === trimmed.toLowerCase(),
      );
      if (matched) {
        setDefaultLocation(matched);
        setLocationInput(matched);
      } else {
        // Invalid entry — revert to the last saved value
        setLocationInput(defaultLocation);
      }
    }, DROPDOWN_BLUR_DELAY_MS);
  };

  const handleClearBookings = () => {
    Alert.alert(
      'Clear All Bookings',
      'This will permanently delete all your bookings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearBookings(),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="border-b border-gray-50 px-5 pb-3 pt-4">
        <Text className="text-lg font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Default Location */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-gray-900">
            Your default location
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900"
            value={locationInput}
            onChangeText={handleLocationChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={handleBlur}
            placeholder={`e.g. ${DEFAULT_SECTOR}`}
            placeholderTextColor={colors.gray400}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {/* Dropdown */}
          {showDropdown && filteredSectors.length > 0 && (
            <View className="mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              {filteredSectors.map((sector) => (
                <Pressable
                  key={sector}
                  onPress={() => handleSectorSelect(sector)}
                  className="border-b border-gray-50 px-4 py-3 active:bg-gray-50"
                >
                  <Text
                    className={`text-sm ${
                      sector === locationInput
                        ? 'font-bold text-primary'
                        : 'text-gray-700'
                    }`}
                  >
                    {sector}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text className="mt-2 text-xs text-gray-400">
            Used when you don&apos;t specify a location in your request.
          </Text>
        </View>

        {/* Section: Reminder lead time */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-gray-900">
            Remind me before an appointment
          </Text>
          <View className="flex-row gap-2">
            {REMINDER_LEAD_OPTIONS.map((hours) => {
              const isActive = hours === reminderLeadHours;
              return (
                <Pressable
                  key={hours}
                  onPress={() => setReminderLeadHours(hours as ReminderLeadHours)}
                  className={`flex-1 items-center rounded-xl border py-2.5 ${
                    isActive
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? 'text-primary' : 'text-gray-600'
                    }`}
                  >
                    {reminderLeadLabel(hours)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-2 text-xs text-gray-400">
            How far ahead of a booking you&apos;ll get a reminder.
          </Text>
        </View>

        {/* Section: Your activity */}
        {summary.total > 0 && (
          <View className="mb-6">
            <Text className="mb-2 text-sm font-bold text-gray-900">
              Your activity
            </Text>
            <View className="flex-row gap-2">
              {[
                { label: 'Total', value: summary.total },
                { label: 'Upcoming', value: summary.upcoming },
                { label: 'Completed', value: summary.completed },
                { label: 'Cancelled', value: summary.cancelled },
              ].map((stat) => (
                <View
                  key={stat.label}
                  className="flex-1 items-center rounded-2xl border border-gray-100 bg-gray-50 py-3"
                >
                  <Text className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-gray-500">
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section 2: About */}
        <View className="mb-6 rounded-2xl bg-primary-50 p-4">
          <Text className="mb-2 text-sm font-bold text-gray-900">
            About Khidmat
          </Text>
          <Text className="text-[13px] leading-5 text-gray-600">
            Khidmat is an AI-powered service orchestrator. Tell me what you need
            in natural language — I&apos;ll find the right provider, book the
            slot, and follow up.
          </Text>
        </View>

        {/* Section 3: Clear bookings */}
        <View className="mb-8">
          <Button variant="destructive" onPress={handleClearBookings}>
            Clear all bookings
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
