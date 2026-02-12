/**
 * Calculation utilities for parental leave dates and amounts.
 */

import { BirthCondition } from '@/types';
import {
  MUTTERSCHUTZ_CONFIG,
  FLAT_RATE_CONFIG,
  INCOME_BASED_CONFIG,
} from '@/data/constants';
import { addWeeks, subtractWeeks, addDays } from './dates';

/**
 * Calculate Mutterschutz (maternity protection) dates.
 */
export function calculateMutterschutz(
  dueDate: string,
  birthConditions: BirthCondition[]
): {
  startDate: string | null;
  endDate: string | null;
  weeksAfterBirth: number;
} {
  // Check if extended Mutterschutz applies
  const hasExtendedMutterschutz =
    birthConditions.includes(BirthCondition.CESAREAN) ||
    birthConditions.includes(BirthCondition.PREMATURE) ||
    birthConditions.includes(BirthCondition.COMPLICATED_BIRTH);

  const weeksAfterBirth = hasExtendedMutterschutz
    ? MUTTERSCHUTZ_CONFIG.extendedWeeksAfterBirth
    : MUTTERSCHUTZ_CONFIG.weeksAfterBirth;

  const startDate = subtractWeeks(dueDate, MUTTERSCHUTZ_CONFIG.weeksBeforeBirth);
  const endDate = addWeeks(dueDate, weeksAfterBirth);

  return {
    startDate,
    endDate,
    weeksAfterBirth,
  };
}

/**
 * Calculate the earliest date when Kinderbetreuungsgeld (KBG) can start.
 * This is the day after Mutterschutz ends.
 */
export function calculateKbgStartDate(
  dueDate: string,
  birthConditions: BirthCondition[]
): string | null {
  const mutterschutz = calculateMutterschutz(dueDate, birthConditions);
  if (!mutterschutz.endDate) return null;

  // KBG starts the day after Mutterschutz ends
  return addDays(mutterschutz.endDate, 1);
}

/**
 * Calculate flat-rate daily rate based on duration.
 */
export function calculateFlatRateDailyRate(
  durationDays: number,
  isBothParents: boolean
): number {
  const minDays = isBothParents
    ? FLAT_RATE_CONFIG.minDaysBothParents
    : FLAT_RATE_CONFIG.minDaysSingleParent;
  const maxDays = isBothParents
    ? FLAT_RATE_CONFIG.maxDaysBothParents
    : FLAT_RATE_CONFIG.maxDaysSingleParent;

  // Linear interpolation between min and max rates
  const ratio = (durationDays - minDays) / (maxDays - minDays);
  return (
    FLAT_RATE_CONFIG.dailyRateMax -
    ratio * (FLAT_RATE_CONFIG.dailyRateMax - FLAT_RATE_CONFIG.dailyRateMin)
  );
}

/**
 * Calculate income-based daily rate.
 * Based on 80% of the reference income (Wochengeld).
 */
export function calculateIncomeBasedDailyRate(annualGrossIncome: number): number {
  if (annualGrossIncome <= 0) {
    return INCOME_BASED_CONFIG.dailyRateMin;
  }

  // Simplified formula: (annual income * 0.62 + 4000) / 365 * 0.8
  // This approximates the Wochengeld-based calculation
  const estimatedDailyRate = ((annualGrossIncome * 0.62 + 4000) / 365) * 0.8;

  // Apply min/max bounds
  return Math.min(
    Math.max(estimatedDailyRate, INCOME_BASED_CONFIG.dailyRateMin),
    INCOME_BASED_CONFIG.dailyRateMax
  );
}
