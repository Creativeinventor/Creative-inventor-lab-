/**
 * Date and timezone utilities for Creative Inventor Project Portal
 * All timestamps stored internally in UTC ISO string.
 * All user-facing dates rendered in Asia/Kolkata (IST).
 */

export const TIMEZONE = 'Asia/Kolkata';

export function formatToKolkata(
  dateInput: string | number | Date | null | undefined,
  includeTime = true
): string {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';

    const options: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(includeTime
        ? {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }
        : {}),
    };

    const formatted = new Intl.DateTimeFormat('en-IN', options).format(date);
    return includeTime ? `${formatted} IST` : formatted;
  } catch {
    return String(dateInput);
  }
}

export function calculateExpiry(
  startDate: Date = new Date(),
  durationDays: number
): { startIso: string; expiryIso: string } {
  const start = new Date(startDate);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + durationDays);
  // Set expiry to end of day UTC
  expiry.setUTCHours(23, 59, 59, 999);

  return {
    startIso: start.toISOString(),
    expiryIso: expiry.toISOString(),
  };
}

export function getRemainingDays(expiryIso: string): number {
  if (!expiryIso) return 0;
  const expiry = new Date(expiryIso).getTime();
  const now = Date.now();
  const diffMs = expiry - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isExpired(expiryIso: string): boolean {
  if (!expiryIso) return true;
  return new Date(expiryIso).getTime() < Date.now();
}

export function isExpiringSoon(expiryIso: string, thresholdDays = 7): boolean {
  const remaining = getRemainingDays(expiryIso);
  return remaining > 0 && remaining <= thresholdDays;
}
