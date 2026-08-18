import type { Booking, BookingStatus } from '../stores/useBookingsStore';

/**
 * Grouping of bookings shown as tabs on the Bookings screen. Each tab maps a
 * set of raw statuses onto a single, user-facing bucket so the list can be
 * sliced without every screen re-deriving the status→bucket rules.
 */
export type BookingTab = 'upcoming' | 'past' | 'cancelled';

const TAB_STATUSES: Record<BookingTab, BookingStatus[]> = {
  upcoming: ['confirmed', 'reminded'],
  past: ['completed'],
  cancelled: ['cancelled'],
};

/** Tab keys in display order, with their labels. */
export const BOOKING_TABS: { key: BookingTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

/** Which tab a booking belongs to, derived from its status. */
export function tabForStatus(status: BookingStatus): BookingTab {
  return (Object.keys(TAB_STATUSES) as BookingTab[]).find((tab) =>
    TAB_STATUSES[tab].includes(status),
  ) ?? 'upcoming';
}

/** Keep only the bookings that belong to the given tab. */
export function filterBookingsByTab(bookings: Booking[], tab: BookingTab): Booking[] {
  return bookings.filter((b) => TAB_STATUSES[tab].includes(b.status));
}

/** Count of bookings in each tab, for badge/label display. */
export function countByTab(bookings: Booking[]): Record<BookingTab, number> {
  const counts: Record<BookingTab, number> = { upcoming: 0, past: 0, cancelled: 0 };
  for (const b of bookings) counts[tabForStatus(b.status)]++;
  return counts;
}

/** Number of upcoming (confirmed/reminded) bookings — for the tab badge. */
export function countUpcoming(bookings: Booking[]): number {
  return bookings.filter((b) => tabForStatus(b.status) === 'upcoming').length;
}
