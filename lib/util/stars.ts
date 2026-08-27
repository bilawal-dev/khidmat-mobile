/**
 * Turn a 0–5 rating into full/half/empty star counts for display. Rounds to the
 * nearest half star and clamps into range, so any numeric rating renders as a
 * valid 5-star row.
 */
export type StarCounts = { full: number; half: number; empty: number };

export function starCounts(rating: number): StarCounts {
  const clamped = Math.max(0, Math.min(5, rating));
  const halves = Math.round(clamped * 2); // nearest half-star, in half units
  const full = Math.floor(halves / 2);
  const half = halves % 2; // 0 or 1
  return { full, half, empty: 5 - full - half };
}
