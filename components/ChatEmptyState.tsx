import React from 'react';
import { View, Text } from 'react-native';
import { ExamplePromptChip } from './ExamplePromptChip';
import { EXAMPLE_PROMPTS } from '@/lib/examplePrompts';

type ChatEmptyStateProps = {
  onSelectPrompt: (text: string) => void;
};

/** Greeting + tappable example prompts shown before the first message. */
export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <View className="flex-1 justify-center px-2 pb-8">
      {/* Greeting */}
      <Text className="text-3xl font-bold text-gray-900">
        Assalam-o-Alaikum 👋
      </Text>
      <Text className="mt-2 text-xl font-semibold text-gray-700">
        What service do you need?
      </Text>
      <Text className="mt-1 text-sm text-gray-400">
        Type in English, Urdu, or Roman Urdu
      </Text>

      {/* Example chips */}
      <View className="mt-6">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <ExamplePromptChip
            key={prompt}
            text={prompt}
            onPress={() => onSelectPrompt(prompt)}
          />
        ))}
      </View>
    </View>
  );
}
