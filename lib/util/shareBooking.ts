import type { Booking } from '../stores/useBookingsStore';
import { categoryServiceLabel } from '../categories';

/**
 * Plain-text summary of a booking for the OS share sheet, so the user can send
 * the appointment to someone at home (who'll let the provider in). The note is
 * deliberately left out — it often holds gate codes the user didn't mean to
 * forward. The phone line is omitted when the provider has none.
 */
export function buildShareMessage(booking: Booking, phone?: string): string {
  const lines = [
    `${booking.providerName} — ${categoryServiceLabel(booking.category)}`,
    `📅 ${booking.scheduledFor}`,
    `📍 ${booking.sector}`,
  ];
  if (phone) lines.push(`📞 ${phone}`);
  lines.push('Booked with Khidmat');
  return lines.join('\n');
}
