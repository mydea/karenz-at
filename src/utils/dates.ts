/**
 * Date utility functions following RULES.md:
 * - Storage: YYYY-MM-DD strings (never Date objects or timestamps)
 * - Display: German format DD.MM.YYYY
 * - Parsing: Always explicit, never new Date(string) with ambiguous formats
 */

/**
 * Validate a date string is in YYYY-MM-DD format and is a valid date.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year!, month! - 1, day);

  return (
    date.getFullYear() === year && date.getMonth() === month! - 1 && date.getDate() === day
  );
}

/**
 * Format a YYYY-MM-DD string to German display format DD.MM.YYYY
 */
export function formatDateGerman(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return '';
  }

  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

/**
 * Parse a German format date DD.MM.YYYY to YYYY-MM-DD
 */
export function parseDateGerman(dateStr: string): string | null {
  const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const paddedDay = day!.padStart(2, '0');
  const paddedMonth = month!.padStart(2, '0');

  // Validate the date
  const result = `${year}-${paddedMonth}-${paddedDay}`;
  const parsed = parseDate(result);
  if (!parsed) {
    return null;
  }

  return result;
}

/**
 * Parse a YYYY-MM-DD string to Date object.
 * Returns null if invalid.
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year!, month! - 1, day);

  // Verify the date is valid
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month! - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function getTodayString(): string {
  return toDateString(new Date());
}

/**
 * Add days to a date string.
 */
export function addDays(dateStr: string, days: number): string | null {
  const date = parseDate(dateStr);
  if (!date) {
    return null;
  }

  date.setDate(date.getDate() + days);
  return toDateString(date);
}

/**
 * Add weeks to a date string.
 */
export function addWeeks(dateStr: string, weeks: number): string | null {
  return addDays(dateStr, weeks * 7);
}

/**
 * Subtract days from a date string.
 */
export function subtractDays(dateStr: string, days: number): string | null {
  return addDays(dateStr, -days);
}

/**
 * Subtract weeks from a date string.
 */
export function subtractWeeks(dateStr: string, weeks: number): string | null {
  return addDays(dateStr, -weeks * 7);
}

/**
 * Calculate difference in days between two date strings.
 */
export function daysBetween(startDateStr: string, endDateStr: string): number | null {
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);

  if (!startDate || !endDate) {
    return null;
  }

  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the past.
 */
export function isInPast(dateStr: string): boolean {
  const date = parseDate(dateStr);
  if (!date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date < today;
}

/**
 * Check if a date is in the future.
 */
export function isInFuture(dateStr: string): boolean {
  const date = parseDate(dateStr);
  if (!date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date > today;
}

/**
 * Format a date string for relative display (e.g., "in 3 Wochen", "vor 2 Tagen").
 */
export function formatRelative(dateStr: string): string {
  const days = daysBetween(getTodayString(), dateStr);

  if (days === null) {
    return '';
  }

  if (days === 0) {
    return 'heute';
  }

  if (days === 1) {
    return 'morgen';
  }

  if (days === -1) {
    return 'gestern';
  }

  const absDays = Math.abs(days);

  if (absDays < 7) {
    return days > 0 ? `in ${absDays} Tagen` : `vor ${absDays} Tagen`;
  }

  const weeks = Math.floor(absDays / 7);
  if (absDays < 30) {
    return days > 0
      ? `in ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`
      : `vor ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`;
  }

  const months = Math.floor(absDays / 30);
  return days > 0
    ? `in ${months} ${months === 1 ? 'Monat' : 'Monaten'}`
    : `vor ${months} ${months === 1 ? 'Monat' : 'Monaten'}`;
}
