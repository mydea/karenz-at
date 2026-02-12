/**
 * Calculation utilities for parental leave dates and amounts.
 */

import {
  BirthCondition,
  type ParentData,
  type ChildcareAllowanceModel,
  type DistributionBlock,
  type ModelComparison,
  type MonthlyBreakdownItem,
  type CalculatorResults,
} from '@/types';
import {
  MUTTERSCHUTZ_CONFIG,
  FLAT_RATE_CONFIG,
  INCOME_BASED_CONFIG,
  PARTNERSHIP_BONUS_CONFIG,
  FAMILIENBONUS_CONFIG,
  MULTIPLE_BIRTH_SUPPLEMENT,
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

/**
 * Calculate total flat-rate amount.
 * The total is constant (~€15,016) regardless of duration chosen.
 */
export function calculateFlatRateTotal(): number {
  return FLAT_RATE_CONFIG.dailyRateMax * FLAT_RATE_CONFIG.minDaysSingleParent;
}

/**
 * Calculate income-based total for a given duration.
 */
export function calculateIncomeBasedTotal(
  annualGrossIncome: number,
  durationDays: number
): number {
  const dailyRate = calculateIncomeBasedDailyRate(annualGrossIncome);
  return dailyRate * durationDays;
}

/**
 * Check if a parent is eligible for income-based model.
 */
export function isEligibleForIncomeBased(parent: ParentData): boolean {
  return parent.hasWorked182Days;
}

/**
 * Calculate partnership bonus.
 * €500 per parent if both take at least 124 days.
 */
export function calculatePartnershipBonus(distributionPlan: DistributionBlock[]): number {
  const parent1Days = distributionPlan
    .filter((b) => b.parent === 'parent1')
    .reduce((sum, b) => sum + b.durationDays, 0);

  const parent2Days = distributionPlan
    .filter((b) => b.parent === 'parent2')
    .reduce((sum, b) => sum + b.durationDays, 0);

  if (
    parent1Days >= PARTNERSHIP_BONUS_CONFIG.minDaysPerParent &&
    parent2Days >= PARTNERSHIP_BONUS_CONFIG.minDaysPerParent
  ) {
    return PARTNERSHIP_BONUS_CONFIG.bonusAmountPerParent * 2;
  }

  return 0;
}

/**
 * Calculate multiple birth supplement.
 */
export function calculateMultipleBirthSupplement(
  birthConditions: BirthCondition[],
  durationDays: number
): number {
  if (birthConditions.includes(BirthCondition.TRIPLETS_OR_MORE)) {
    // Twins supplement + additional child supplement
    return (
      (MULTIPLE_BIRTH_SUPPLEMENT.twinsDaily + MULTIPLE_BIRTH_SUPPLEMENT.additionalChildDaily) *
      durationDays
    );
  }

  if (birthConditions.includes(BirthCondition.TWINS)) {
    return MULTIPLE_BIRTH_SUPPLEMENT.twinsDaily * durationDays;
  }

  return 0;
}

/**
 * Compare both models for a given parent's income.
 */
export function compareBothModels(
  parent1: ParentData,
  parent2: ParentData,
  chosenDurationDays: number,
  isBothParents: boolean
): ModelComparison {
  // Flat-rate calculations
  const flatRateDailyRate = calculateFlatRateDailyRate(chosenDurationDays, isBothParents);
  const flatRateTotal = flatRateDailyRate * chosenDurationDays;

  // Income-based calculations (use higher earning parent's income)
  const higherIncome = Math.max(
    parent1.monthlySalary * 12,
    parent2.monthlySalary * 12
  );
  const incomeBasedDailyRate = calculateIncomeBasedDailyRate(higherIncome);
  const incomeBasedMaxDays = isBothParents
    ? INCOME_BASED_CONFIG.maxDaysBothParents
    : INCOME_BASED_CONFIG.maxDaysSingleParent;
  const incomeBasedTotal = incomeBasedDailyRate * incomeBasedMaxDays;

  // Eligibility check
  const eligible = parent1.hasWorked182Days || parent2.hasWorked182Days;

  // Determine recommendation
  let recommendation: 'flatRate' | 'incomeBased' | 'either';
  let reasonKey: string;

  if (!eligible) {
    recommendation = 'flatRate';
    reasonKey = 'notEligibleForIncomeBased';
  } else if (incomeBasedTotal > flatRateTotal * 1.1) {
    recommendation = 'incomeBased';
    reasonKey = 'higherTotalIncomeBased';
  } else if (flatRateTotal > incomeBasedTotal * 1.1) {
    recommendation = 'flatRate';
    reasonKey = 'higherTotalFlatRate';
  } else if (chosenDurationDays > incomeBasedMaxDays) {
    recommendation = 'flatRate';
    reasonKey = 'longerDurationFlatRate';
  } else {
    recommendation = 'either';
    reasonKey = 'similarAmounts';
  }

  return {
    flatRate: {
      dailyRate: flatRateDailyRate,
      totalAmount: flatRateTotal,
      durationDays: chosenDurationDays,
      monthlyRate: flatRateDailyRate * 30,
    },
    incomeBased: {
      dailyRate: incomeBasedDailyRate,
      totalAmount: incomeBasedTotal,
      durationDays: incomeBasedMaxDays,
      monthlyRate: incomeBasedDailyRate * 30,
      eligible,
    },
    recommendation,
    reasonKey,
  };
}

/**
 * Get German month names.
 */
const GERMAN_MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

/**
 * Calculate monthly breakdown of KBG payments.
 */
export function calculateMonthlyBreakdown(
  distributionPlan: DistributionBlock[],
  dailyRate: number
): MonthlyBreakdownItem[] {
  if (distributionPlan.length === 0) {
    return [];
  }

  // Sort blocks by start date
  const sortedBlocks = [...distributionPlan].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  const breakdown: MonthlyBreakdownItem[] = [];

  // Get overall date range
  const startDate = new Date(sortedBlocks[0]!.startDate);
  const lastBlock = sortedBlocks[sortedBlocks.length - 1]!;
  const endDate = new Date(lastBlock.endDate);

  // Iterate month by month
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0); // Last day of month

    // Find which blocks overlap with this month
    let parent1Days = 0;
    let parent2Days = 0;

    for (const block of sortedBlocks) {
      const blockStart = new Date(block.startDate);
      const blockEnd = new Date(block.endDate);

      // Check if block overlaps with this month
      if (blockEnd >= monthStart && blockStart <= monthEnd) {
        const overlapStart = new Date(Math.max(blockStart.getTime(), monthStart.getTime()));
        const overlapEnd = new Date(Math.min(blockEnd.getTime(), monthEnd.getTime()));
        const overlapDays =
          Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (block.parent === 'parent1') {
          parent1Days += overlapDays;
        } else {
          parent2Days += overlapDays;
        }
      }
    }

    const totalDays = parent1Days + parent2Days;
    let parent: 'parent1' | 'parent2' | 'both' | 'none';

    if (parent1Days > 0 && parent2Days > 0) {
      parent = 'both';
    } else if (parent1Days > 0) {
      parent = 'parent1';
    } else if (parent2Days > 0) {
      parent = 'parent2';
    } else {
      parent = 'none';
    }

    if (totalDays > 0) {
      breakdown.push({
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
        monthLabel: `${GERMAN_MONTHS[month]} ${year}`,
        parent,
        kbgAmount: Math.round(totalDays * dailyRate * 100) / 100,
        daysWithKbg: totalDays,
      });
    }

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return breakdown;
}

/**
 * Calculate complete results for the calculator page.
 */
export function calculateFullResults(
  parent1: ParentData,
  parent2: ParentData,
  model: ChildcareAllowanceModel,
  distributionPlan: DistributionBlock[],
  birthConditions: BirthCondition[]
): CalculatorResults {
  const isBothParents = distributionPlan.some((b) => b.parent === 'parent2');
  const totalDays = distributionPlan.reduce((sum, b) => sum + b.durationDays, 0);

  // Calculate daily rate based on model
  let dailyRate: number;
  let durationDays: number;

  if (model.type === 'flatRate') {
    durationDays = model.chosenDurationDays || totalDays;
    dailyRate = calculateFlatRateDailyRate(durationDays, isBothParents);
  } else {
    // Income-based
    const higherIncome = Math.max(parent1.monthlySalary * 12, parent2.monthlySalary * 12);
    dailyRate = calculateIncomeBasedDailyRate(higherIncome);
    durationDays = isBothParents
      ? INCOME_BASED_CONFIG.maxDaysBothParents
      : INCOME_BASED_CONFIG.maxDaysSingleParent;
  }

  const monthlyRate = dailyRate * 30;
  const totalAmount = dailyRate * totalDays;

  // Partnership bonus
  const partnershipBonus = calculatePartnershipBonus(distributionPlan);

  // Multiple birth supplement
  const multipleBirthSupplement = calculateMultipleBirthSupplement(birthConditions, totalDays);

  // Familienbonus (yearly amount for display)
  const familienbonusYearly = FAMILIENBONUS_CONFIG.yearlyAmount;

  // Grand total (KBG only, Familienbonus is separate)
  const grandTotal = totalAmount + partnershipBonus + multipleBirthSupplement;

  // Monthly breakdown
  const monthlyBreakdown = calculateMonthlyBreakdown(distributionPlan, dailyRate);

  // Income comparison
  const regularMonthlyIncome = Math.max(parent1.monthlySalary, parent2.monthlySalary);
  const averageKbgMonthly = totalDays > 0 ? totalAmount / (totalDays / 30) : 0;
  const differencePercent =
    regularMonthlyIncome > 0
      ? Math.round(((averageKbgMonthly - regularMonthlyIncome) / regularMonthlyIncome) * 100)
      : 0;

  // Parent breakdown
  const parent1Days = distributionPlan
    .filter((b) => b.parent === 'parent1')
    .reduce((sum, b) => sum + b.durationDays, 0);
  const parent2Days = distributionPlan
    .filter((b) => b.parent === 'parent2')
    .reduce((sum, b) => sum + b.durationDays, 0);

  return {
    selectedModelResults: {
      dailyRate,
      monthlyRate,
      totalAmount,
      durationDays,
    },
    partnershipBonus,
    multipleBirthSupplement,
    familienbonusYearly,
    grandTotal,
    monthlyBreakdown,
    incomeComparison: {
      regularMonthlyIncome,
      averageKbgMonthly,
      differencePercent,
    },
    parentBreakdown: {
      parent1: {
        days: parent1Days,
        amount: parent1Days * dailyRate,
      },
      parent2: {
        days: parent2Days,
        amount: parent2Days * dailyRate,
      },
    },
  };
}
