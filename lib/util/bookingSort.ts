import type { Booking } from '../stores/useBookingsStore';

/**
 * Ways the Bookings list can be ordered. Kept as a small, closed set so the
 * screen renders a fixed control and never has to define the comparators
 * inline.
 */
export type BookingSort = 'newest' | 'soonest' | 'provider';

/** Sort keys in display order, with their labels. */
export const BOOKING_SORTS: { key: BookingSort; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'soonest', label: 'Soonest' },
  { key: 'provider', label: 'A–Z' },
];

const comparators: Record<BookingSort, (a: Booking, b: Booking) => number> = {
  // Most recently created first.
  newest: (a, b) => b.createdAt - a.createdAt,
  // Nearest scheduled appointment first.
  soonest: (a, b) => a.scheduledTimestamp - b.scheduledTimestamp,
  // Provider name, case-insensitive.
  provider: (a, b) =>
    a.providerName.localeCompare(b.providerName, undefined, { sensitivity: 'base' }),
};

/** Return a new array sorted by the chosen key (non-mutating). */
export function applyBookingSort(bookings: Booking[], sort: BookingSort): Booking[] {
  return [...bookings].sort(comparators[sort]);
}
