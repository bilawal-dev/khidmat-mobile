import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatBubble } from './ChatBubble';
import { ExtractedFieldsRow } from './ExtractedFieldsRow';
import { categoryServiceLabel } from '@/lib/categories';
import { formatLocationLabel } from '@/lib/util/location';
import { colors } from '@/lib/theme/colors';
import type { AgentEvent } from '@/lib/agent/types';

/** One preserved agent event rendered as a compact chat bubble. */
function renderThreadEvent(event: AgentEvent, index: number) {
  switch (event.type) {
    case 'understanding':
      return (
        <ChatBubble key={index} side="agent">
          <Text className="text-sm text-gray-900">
            Got it, here&apos;s what I understood:
          </Text>
          <ExtractedFieldsRow
            service={
              event.extracted.service
                ? categoryServiceLabel(event.extracted.service)
                : null
            }
            location={formatLocationLabel(
              event.extracted.location,
              event.usedDefaultLocation,
            )}
            time={event.extracted.time}
          />
        </ChatBubble>
      );
    case 'searching':
      return (
        <ChatBubble key={index} side="agent">
          <Text className="text-sm text-gray-900">
            Looking for {categoryServiceLabel(event.category)} near {event.near}
            ...
          </Text>
        </ChatBubble>
      );
    case 'ranking':
      return (
        <ChatBubble key={index} side="agent">
          <Text className="text-sm text-gray-900">
            Found {event.candidateCount} nearby. Ranked by distance, rating, and
            availability.
          </Text>
        </ChatBubble>
      );
    case 'recommendation':
      return (
        <ChatBubble key={index} side="agent">
          <Text className="text-sm text-gray-900">
            Recommended {event.provider.name} — {event.reasoning}
          </Text>
        </ChatBubble>
      );
    case 'confirmed':
      return (
        <ChatBubble key={index} side="agent" tone="success">
          <Text className="text-sm font-semibold text-green-900">
            ✅ Booking confirmed
          </Text>
        </ChatBubble>
      );
    case 'reminder_scheduled':
      return (
        <ChatBubble key={index} side="agent">
          <Text className="text-sm text-gray-900">⏰ Reminder at {event.at}</Text>
        </ChatBubble>
      );
    default:
      return null;
  }
}

/** Collapsible "Why I picked this provider" section over the preserved thread. */
export function AgentThreadSection({ thread }: { thread: AgentEvent[] }) {
  const [showThread, setShowThread] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setShowThread((v) => !v)}
        className="mb-2 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3"
      >
        <Text className="text-sm font-bold text-gray-900">
          Why I picked this provider
        </Text>
        <Ionicons
          name={showThread ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.gray400}
        />
      </Pressable>

      {showThread && (
        <View className="mb-4 rounded-2xl bg-gray-50 p-3">
          {thread.map((event, i) => renderThreadEvent(event, i))}
        </View>
      )}
    </>
  );
}
