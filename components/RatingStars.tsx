import React from 'react';
import { View, Text } from 'react-native';
import { starCounts } from '@/lib/util/stars';

type RatingStarsProps = {
  rating: number;
  /** Show the numeric rating (and optional review count) beside the stars. */
  showValue?: boolean;
  reviewCount?: number;
};

/** A 5-star row (full ★ / half ⯨ / empty ☆) for a 0–5 rating. */
export function RatingStars({ rating, showValue = true, reviewCount }: RatingStarsProps) {
  const { full, half, empty } = starCounts(rating);
  const stars = '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);

  return (
    <View className="flex-row items-center">
      <Text className="text-sm text-yellow-500">{stars}</Text>
      {showValue && (
        <Text className="ml-1.5 text-xs font-semibold text-gray-600">
          {rating.toFixed(1)}
          {typeof reviewCount === 'number' ? (
            <Text className="font-normal text-gray-400"> · {reviewCount} reviews</Text>
          ) : null}
        </Text>
      )}
    </View>
  );
}
