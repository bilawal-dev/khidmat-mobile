import type { Booking } from '../stores/useBookingsStore';
import { categoryRoleLabel } from '../categories';

/**
 * Build a natural-language chat prompt that re-requests the service from a past
 * booking, so "Book again" can drop the user back into the agent flow with the
 * request already typed (they still pick a new time).
 */
export function buildRebookPrompt(booking: Booking): string {
  const role = categoryRoleLabel(booking.category);
  return `Book ${indefiniteArticle(role)} ${role} in ${booking.sector}`;
}

/** "a"/"an" for a following word, good enough for our service role labels. */
function indefiniteArticle(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}
