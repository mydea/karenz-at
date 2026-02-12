/**
 * Configuration constants for childcare allowance calculations.
 * All amounts in EUR, durations in days.
 */

// === Flat-Rate Childcare Allowance (Pauschales KBG / Konto) ===

export const FLAT_RATE_CONFIG = {
  // Duration range
  /** ~12 months */
  minDaysSingleParent: 365,
  /** ~28 months */
  maxDaysSingleParent: 851,
  /** ~15 months */
  minDaysBothParents: 456,
  /** ~35 months */
  maxDaysBothParents: 1063,

  // Daily rates (inversely proportional to duration)
  /** EUR at longest duration */
  dailyRateMin: 17.65,
  /** EUR at shortest duration */
  dailyRateMax: 41.14,

  // Parent split rules
  /** 20% reserved for 2nd parent */
  secondParentMinPercent: 20,
  /** Minimum days in shortest variant */
  secondParentMinDays: 91,

  // Block rules
  /** Max switches between parents */
  maxSwitches: 2,
  /** Results in max 3 blocks */
  maxBlocks: 3,
  /** Each block minimum 61 days */
  minBlockDays: 61,
  /** Simultaneous receipt at first switch */
  overlapDaysAllowed: 31,

  // Additional income limit (Zuverdienst)
  /** EUR/year or 60% of previous income */
  additionalIncomeLimit: 18000,

  // Modification rules
  /** Can change duration once per child */
  canChangeVariantOnce: true,
  /** Must request 91 days before end */
  changeDeadlineDays: 91,
} as const;

// === Income-Based Childcare Allowance (Einkommensabhängiges KBG) ===

export const INCOME_BASED_CONFIG = {
  // Duration (fixed, not flexible like flat-rate)
  /** ~12 months */
  maxDaysSingleParent: 365,
  /** ~14 months (12+2) */
  maxDaysBothParents: 426,

  // Rate calculation
  /** 80% of net income */
  incomeReplacementPercent: 80,
  /** EUR (~2,400/month cap) */
  dailyRateMax: 80.12,
  /** EUR (fallback minimum) */
  dailyRateMin: 41.14,

  // Parent split rules
  /** Each parent has 61 days reserved */
  reservedDaysPerParent: 61,

  // Block rules
  /** Each block minimum 61 days */
  minBlockDays: 61,
  /** Simultaneous receipt at first switch */
  overlapDaysAllowed: 31,

  // Eligibility requirement
  /** Must work 182 days before birth */
  requiredWorkDaysBeforeBirth: 182,

  // Additional income limit (Zuverdienst)
  /** EUR/year (stricter than flat-rate) */
  additionalIncomeLimit: 8600,

  // Modification rules
  /** Cannot change once selected */
  canChangeVariant: false,
  /** Both must use same model */
  bothParentsBoundToModel: true,
} as const;

// === Mutterschutz (Maternity Protection) ===

export const MUTTERSCHUTZ_CONFIG = {
  /** Standard weeks before due date */
  weeksBeforeBirth: 8,
  /** Standard weeks after birth */
  weeksAfterBirth: 8,
  /** Extended weeks for cesarean, premature, complicated */
  extendedWeeksAfterBirth: 12,
} as const;

// === Partnership Bonus ===

export const PARTNERSHIP_BONUS_CONFIG = {
  /** Each parent receives this amount */
  bonusAmountPerParent: 500,
  /** Minimum days each parent must take to qualify */
  minDaysPerParent: 124,
} as const;

// === Familienbonus Plus ===

export const FAMILIENBONUS_CONFIG = {
  /** EUR per month per child 0-18 years */
  monthlyAmount: 166.68,
  /** EUR per year per child */
  yearlyAmount: 2000,
} as const;

// === Mehrlingszuschlag (Multiple birth supplement) ===

export const MULTIPLE_BIRTH_SUPPLEMENT = {
  /** Additional daily rate for twins */
  twinsDaily: 7.27,
  /** Additional daily rate for each child beyond twins */
  additionalChildDaily: 10.90,
} as const;
