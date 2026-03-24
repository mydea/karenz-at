/**
 * Date utility functions using date-fns.
 * Following RULES.md:
 * - Storage: YYYY-MM-DD strings (never Date objects or timestamps)
 * - Display: German format DD.MM.YYYY
 * - Parsing: Always explicit, never new Date(string) with ambiguous formats
 */

import {
  parse,
  format,
  isValid,
  addDays as dateFnsAddDays,
  addWeeks as dateFnsAddWeeks,
  differenceInDays,
  startOfDay,
  isBefore,
  isAfter,
} from 'date-fns';

const ISO_FORMAT = 'yyyy-MM-dd';
const GERMAN_FORMAT = 'dd.MM.yyyy';

/**
 * Parse a YYYY-MM-DD string to Date object.
 * Returns null if invalid.
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }

  const date = parse(dateStr, ISO_FORMAT, new Date());
  return isValid(date) ? date : null;
}

/**
 * Validate a date string is in YYYY-MM-DD format and is a valid date.
 */
export function isValidDateString(dateStr: string): boolean {
  return parseDate(dateStr) !== null;
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function toDateString(date: Date): string {
  return format(date, ISO_FORMAT);
}

/**
 * Format a YYYY-MM-DD string to German display format DD.MM.YYYY
 */
export function formatDateGerman(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) {
    return '';
  }
  return format(date, GERMAN_FORMAT);
}

/**
 * Parse a German format date DD.MM.YYYY to YYYY-MM-DD
 */
export function parseDateGerman(dateStr: string): string | null {
  if (!dateStr) {
    return null;
  }

  const date = parse(dateStr, GERMAN_FORMAT, new Date());
  if (!isValid(date)) {
    return null;
  }

  return toDateString(date);
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

  return toDateString(dateFnsAddDays(date, days));
}

/**
 * Add weeks to a date string.
 */
export function addWeeks(dateStr: string, weeks: number): string | null {
  const date = parseDate(dateStr);
  if (!date) {
    return null;
  }

  return toDateString(dateFnsAddWeeks(date, weeks));
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
  return addWeeks(dateStr, -weeks);
}

/**
 * Calculate difference in days between two date strings.
 * Returns positive if endDate is after startDate.
 */
export function daysBetween(startDateStr: string, endDateStr: string): number | null {
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);

  if (!startDate || !endDate) {
    return null;
  }

  return differenceInDays(endDate, startDate);
}

/**
 * Check if a date is in the past (before today).
 */
export function isInPast(dateStr: string): boolean {
  const date = parseDate(dateStr);
  if (!date) {
    return false;
  }

  return isBefore(date, startOfDay(new Date()));
}

/**
 * Check if a date is in the future (after today).
 */
export function isInFuture(dateStr: string): boolean {
  const date = parseDate(dateStr);
  if (!date) {
    return false;
  }

  return isAfter(date, startOfDay(new Date()));
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
