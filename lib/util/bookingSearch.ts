import type { Booking } from '../stores/useBookingsStore';
import { categoryServiceLabel } from '../categories';

/**
 * Free-text search over a booking. Matches (case-insensitively) against the
 * provider name, sector, and both the raw category and its human label — so a
 * query like "ac", "plumb", or a provider's name all surface the right rows.
 */
export function matchesBookingQuery(booking: Booking, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    booking.providerName,
    booking.sector,
    booking.category,
    categoryServiceLabel(booking.category),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}

/** Keep only bookings that match the query (all bookings when the query is blank). */
export function filterBookingsByQuery(bookings: Booking[], query: string): Booking[] {
  if (!query.trim()) return bookings;
  return bookings.filter((b) => matchesBookingQuery(b, query));
}
