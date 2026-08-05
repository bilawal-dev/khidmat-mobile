import type { Booking } from '../stores/useBookingsStore';
import { tabForStatus } from './bookingFilters';

/** Headline counts for the Settings "your activity" overview. */
export type BookingSummary = {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
};

/**
 * Roll a booking list up into headline counts. Reuses the tab bucketing so the
 * Settings summary and the Bookings tabs can never drift apart on what counts
 * as "upcoming" vs "past".
 */
export function computeBookingSummary(bookings: Booking[]): BookingSummary {
  const summary: BookingSummary = { total: bookings.length, upcoming: 0, completed: 0, cancelled: 0 };

  for (const booking of bookings) {
    const tab = tabForStatus(booking.status);
    if (tab === 'upcoming') summary.upcoming++;
    else if (tab === 'past') summary.completed++;
    else summary.cancelled++;
  }

  return summary;
}
