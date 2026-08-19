import type { Booking } from '../stores/useBookingsStore';
import { tabForStatus } from './bookingFilters';

/**
 * The soonest still-upcoming booking (confirmed/reminded, scheduled at or after
 * `now`), or null when there is none. Used to surface a "next appointment" hint
 * on the home screen. `now` is injected so the selection stays pure/testable.
 */
export function nextUpcomingBooking(bookings: Booking[], now: number): Booking | null {
  return bookings
    .filter((b) => tabForStatus(b.status) === 'upcoming' && b.scheduledTimestamp >= now)
    .sort((a, b) => a.scheduledTimestamp - b.scheduledTimestamp)[0] ?? null;
}
