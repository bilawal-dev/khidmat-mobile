import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme/colors';

type InputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export function InputBar({
  value,
  onChangeText,
  onSend,
  placeholder = 'Type your request...',
  disabled = false,
}: InputBarProps) {
  const isEmpty = value.trim().length === 0;
  const sendDisabled = isEmpty || disabled;

  return (
    <View className="flex-row items-end border-t border-gray-100 bg-white px-3 pb-2 pt-2">
      <TextInput
        className="mr-2 max-h-24 min-h-[44px] flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-[15px] text-gray-900"
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        value={value}
        onChangeText={onChangeText}
        multiline
        editable={!disabled}
        textAlignVertical="top"
      />
      <Pressable
        onPress={onSend}
        disabled={sendDisabled}
        className={`h-11 w-11 items-center justify-center rounded-full ${
          sendDisabled ? 'bg-gray-200' : 'bg-primary active:bg-primary-600'
        }`}
      >
        <Ionicons
          name="send"
          size={18}
          color={sendDisabled ? colors.gray400 : colors.white}
        />
      </Pressable>
    </View>
  );
}
