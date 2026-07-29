import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme/colors';

type ChatHeaderProps = {
  showNewChat: boolean;
  onNewChat: () => void;
};

/** Chat screen title bar with an optional "new chat" action. */
export function ChatHeader({ showNewChat, onNewChat }: ChatHeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-50 px-5 pb-3 pt-2">
      <View>
        <Text className="text-lg font-bold text-gray-900">Khidmat</Text>
        <Text className="text-xs text-gray-400">Your AI service assistant</Text>
      </View>
      {showNewChat && (
        <Pressable
          onPress={onNewChat}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
        >
          <Ionicons name="create-outline" size={18} color={colors.gray500} />
        </Pressable>
      )}
    </View>
  );
}
