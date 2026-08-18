/**
 * Compact "time until" formatting for upcoming bookings, e.g. "in 3 days",
 * "tomorrow", "in 5 hours". Pure: `now` is passed in (no hidden clock) so the
 * result is deterministic and easy to reason about at call sites.
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Human "time until `targetMs`" relative to `nowMs`. Returns null for times in
 * the past (or effectively now) so callers can simply omit the countdown then.
 */
export function formatTimeUntil(targetMs: number, nowMs: number): string | null {
  const diff = targetMs - nowMs;
  if (diff < MINUTE) return null; // past, or so close a countdown adds nothing

  if (diff < HOUR) {
    const mins = Math.round(diff / MINUTE);
    return `in ${mins} min`;
  }
  if (diff < DAY) {
    const hours = Math.round(diff / HOUR);
    return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  const days = Math.round(diff / DAY);
  if (days === 1) return 'tomorrow';
  if (days < 7) return `in ${days} days`;

  const weeks = Math.round(days / 7);
  return `in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
}
