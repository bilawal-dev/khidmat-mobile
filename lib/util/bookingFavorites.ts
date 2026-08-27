import type { Booking } from '../stores/useBookingsStore';

/**
 * Keep only bookings whose provider is in the favorites set. Given an empty set
 * this returns nothing (there are no favorites to match), which is what the
 * "favorites only" toggle wants.
 */
export function filterBookingsByFavorites(
  bookings: Booking[],
  favoriteIds: string[],
): Booking[] {
  const favorites = new Set(favoriteIds);
  return bookings.filter((b) => favorites.has(b.providerId));
}
