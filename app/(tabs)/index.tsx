import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Platform, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ChatBubble } from '@/components/ChatBubble';
import { ExtractedFieldsRow } from '@/components/ExtractedFieldsRow';
import { ProviderCard } from '@/components/ProviderCard';
import { InputBar } from '@/components/InputBar';
import { ChatEmptyState } from '@/components/ChatEmptyState';
import { ChatHeader } from '@/components/ChatHeader';
import { FadeIn, TypingIndicator } from '@/components/ChatLoaders';
import { runAgent, confirmBooking, DEFAULT_REMINDER_LABEL } from '@/lib/agent/mockAgent';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { useBookingsStore } from '@/lib/stores/useBookingsStore';
import { categoryRoleLabel } from '@/lib/categories';
import { makeId } from '@/lib/util/id';
import { formatLocationLabel } from '@/lib/util/location';
import { formatSchedule } from '@/lib/util/schedule';
import { findEventOfType } from '@/lib/agent/findEvent';
import type { AgentEvent } from '@/lib/agent/types';

type RecommendationEvent = Extract<AgentEvent, { type: 'recommendation' }>;

// ── Types for chat messages ─────────────────────────────────────

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'agent'; event: AgentEvent };

// Let the new message/layout commit before scrolling to the end.
const SCROLL_TO_END_DELAY_MS = 100;

/** An agent bubble that shows the typing indicator beneath it while loading. */
function AgentStep({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <View>
      <ChatBubble side="agent">{children}</ChatBubble>
      {loading && <TypingIndicator />}
    </View>
  );
}

// ── Main Chat Screen ────────────────────────────────────────────

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  // Ref to always have the latest events (avoids stale closures)
  const agentEventsRef = useRef<AgentEvent[]>([]);

  const insets = useSafeAreaInsets();
  const defaultLocation = useSettingsStore((s) => s.defaultLocation);
  const addBooking = useBookingsStore((s) => s.addBooking);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, SCROLL_TO_END_DELAY_MS);
  }, []);

  const addAgentMessage = useCallback(
    (event: AgentEvent) => {
      const msg: ChatMessage = {
        id: makeId('agent'),
        role: 'agent',
        event,
      };
      setMessages((prev) => [...prev, msg]);
      setAgentEvents((prev) => {
        const next = [...prev, event];
        agentEventsRef.current = next;
        return next;
      });
      if (event.type === 'confirmed') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      scrollToBottom();
    },
    [scrollToBottom],
  );

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isProcessing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');
    setIsProcessing(true);

    // Add user message
    const userMsg: ChatMessage = {
      id: makeId('user'),
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

    // Run agent
    try {
      const gen = runAgent(text, {
        defaultLocation,
        conversationHistory: agentEventsRef.current,
      });

      for await (const event of gen) {
        addAgentMessage(event);
      }
    } catch (e) {
      console.error('Agent error:', e);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, isProcessing, defaultLocation, addAgentMessage, scrollToBottom]);

  const handleBook = useCallback(
    async (rec: RecommendationEvent) => {
      if (isProcessing) return;
      setIsProcessing(true);

      // Collect booking-flow events locally so we don't depend on stale state
      const bookingFlowEvents: AgentEvent[] = [];

      try {
        const gen = confirmBooking(rec.provider, rec.suggestedSlot, rec.dayLabel);

        for await (const event of gen) {
          addAgentMessage(event);
          bookingFlowEvents.push(event);
        }

        const confirmedEvent = findEventOfType(bookingFlowEvents, 'confirmed');
        const reminderEvent = findEventOfType(
          bookingFlowEvents,
          'reminder_scheduled',
        );

        if (confirmedEvent) {
          addBooking({
            id: confirmedEvent.bookingId,
            providerId: rec.provider.id,
            providerName: rec.provider.name,
            category: rec.provider.category,
            sector: rec.provider.sector,
            scheduledFor: formatSchedule(rec.dayLabel, rec.suggestedSlot),
            scheduledTimestamp: rec.scheduledTimestamp,
            status: 'confirmed',
            reminderAt: reminderEvent?.at ?? DEFAULT_REMINDER_LABEL,
            agentThread: [...agentEventsRef.current],
            createdAt: Date.now(),
          });
        }
      } catch (e) {
        console.error('Booking error:', e);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, addAgentMessage, addBooking],
  );

  const handleChipPress = useCallback(
    (text: string) => {
      setInputText(text);
    },
    [],
  );

  const handleNewChat = useCallback(() => {
    if (messages.length === 0 || isProcessing) return;
    Alert.alert(
      'Start a new chat?',
      'This clears the current conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Chat',
          onPress: () => {
            setMessages([]);
            setAgentEvents([]);
            agentEventsRef.current = [];
            setInputText('');
          },
        },
      ],
    );
  }, [messages.length, isProcessing]);

  // ── Render a single agent event as bubble content ──────────

  const renderAgentEvent = useCallback(
    (event: AgentEvent, isLast: boolean) => {
      const showLoading = isLast && isProcessing;
      switch (event.type) {
        case 'understanding': {
          const { extracted, usedDefaultLocation } = event;
          const locationLabel = formatLocationLabel(
            extracted.location,
            usedDefaultLocation,
          );
          return (
            <ChatBubble side="agent">
              <Text className="text-[15px] leading-5 text-gray-900">
                Got it, here&apos;s what I understood:
              </Text>
              <ExtractedFieldsRow
                service={
                  extracted.service
                    ? categoryRoleLabel(extracted.service)
                    : null
                }
                location={locationLabel}
                time={extracted.time}
              />
            </ChatBubble>
          );
        }

        case 'searching':
          return (
            <AgentStep loading={showLoading}>
              <Text className="text-[15px] text-gray-900">
                Looking for {categoryRoleLabel(event.category)} near{' '}
                {event.near}
              </Text>
            </AgentStep>
          );

        case 'ranking':
          return (
            <AgentStep loading={showLoading}>
              <Text className="text-[15px] text-gray-900">
                Found {event.candidateCount} nearby. Ranking by distance,
                rating, and availability
              </Text>
            </AgentStep>
          );

        case 'recommendation':
          return (
            <ChatBubble side="agent">
              <Text className="mb-1 text-[15px] text-gray-900">
                Here&apos;s who I&apos;d recommend:
              </Text>
              <ProviderCard
                provider={event.provider}
                distanceKm={event.distanceKm}
                reasoning={event.reasoning}
                suggestedSlot={event.suggestedSlot}
                dayLabel={event.dayLabel}
                onBook={() => handleBook(event)}
              />
            </ChatBubble>
          );

        case 'awaiting_user':
          return (
            <ChatBubble side="agent">
              <Text className="text-[15px] text-gray-900">
                {event.question}
              </Text>
            </ChatBubble>
          );

        case 'booking':
          return (
            <AgentStep loading={showLoading}>
              <Text className="text-[15px] text-gray-900">
                Booking the {event.slot} slot with {event.provider.name}
              </Text>
            </AgentStep>
          );

        case 'confirmed':
          return (
            <ChatBubble side="agent" tone="success">
              <Text className="text-[15px] font-semibold text-green-900">
                ✅ Confirmed! Your booking is set.
              </Text>
            </ChatBubble>
          );

        case 'reminder_scheduled':
          return (
            <ChatBubble side="agent">
              <Text className="text-[15px] text-gray-900">
                ⏰ I&apos;ll remind you at {event.at} — 1 hour before your
                appointment.
              </Text>
            </ChatBubble>
          );

        default:
          return null;
      }
    },
    [handleBook, isProcessing],
  );

  // ── Empty state ────────────────────────────────────────────

  const showEmptyState = messages.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60 + insets.bottom}
      >
        {/* Header */}
        <ChatHeader
          showNewChat={messages.length > 0 && !isProcessing}
          onNewChat={handleNewChat}
        />

        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            showEmptyState ? { flexGrow: 1 } : { paddingBottom: 16 }
          }
        >
          {showEmptyState ? (
            <ChatEmptyState onSelectPrompt={handleChipPress} />
          ) : (
            <>
              {messages.map((msg, i) => {
                const isLast = i === messages.length - 1;
                return (
                  <FadeIn key={msg.id}>
                    {msg.role === 'user' ? (
                      <ChatBubble side="user">{msg.text}</ChatBubble>
                    ) : (
                      renderAgentEvent(msg.event, isLast)
                    )}
                  </FadeIn>
                );
              })}

              {/* Footer link after booking confirmed */}
              {agentEvents.some((e) => e.type === 'confirmed') && (
                <FadeIn>
                  <Text
                    className="mt-2 text-center text-xs text-primary"
                    onPress={() => router.push('/(tabs)/bookings')}
                  >
                    View this booking in your Bookings tab →
                  </Text>
                </FadeIn>
              )}
            </>
          )}
        </ScrollView>

        {/* Input bar */}
        <InputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          placeholder="Type your request..."
          disabled={isProcessing}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
