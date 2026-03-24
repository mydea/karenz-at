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
  type EmploymentStatus,
} from '@/types';
import {
  MUTTERSCHUTZ_CONFIG,
  FLAT_RATE_CONFIG,
  INCOME_BASED_CONFIG,
  PARTNERSHIP_BONUS_CONFIG,
  FAMILIENBONUS_CONFIG,
  MULTIPLE_BIRTH_SUPPLEMENT,
  WOCHENGELD_CONFIG,
} from '@/data/constants';
import { addWeeks, subtractWeeks, addDays, parseDate } from './dates';
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  isBefore,
  isAfter,
  max as maxDate,
  min as minDate,
  differenceInDays,
  subDays,
} from 'date-fns';

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
 * Based on 80% of Wochengeld, which is based on net income.
 * 
 * The input is average monthly net income from the 3 months before Mutterschutz.
 * Wochengeld = average daily net income, KBG = 80% of Wochengeld.
 * 
 * Source: https://www.bundeskanzleramt.gv.at/agenda/familie/kinderbetreuungsgeld
 */
export function calculateIncomeBasedDailyRate(monthlyNetIncome: number): number {
  if (monthlyNetIncome <= 0) {
    return INCOME_BASED_CONFIG.dailyRateMin;
  }

  // Wochengeld is roughly the daily net income (monthly / 30)
  // Income-based KBG is 80% of Wochengeld
  const dailyNetIncome = monthlyNetIncome / 30;
  const estimatedDailyRate = dailyNetIncome * 0.8;

  // Apply min/max bounds (min €41.14, max €80.12 per day)
  return Math.min(
    Math.max(estimatedDailyRate, INCOME_BASED_CONFIG.dailyRateMin),
    INCOME_BASED_CONFIG.dailyRateMax
  );
}

/**
 * Calculate daily Wochengeld (maternity allowance) based on employment status.
 * 
 * - employed: Average daily net income (monthlyNetIncome / 30)
 * - unemployed: 180% of daily unemployment benefit
 * - marginallyEmployed: Fixed minimum rate (€12.19/day in 2026)
 * - notEmployed: No Wochengeld entitlement (€0)
 * 
 * @param parent Parent data including employment status and income
 */
export function calculateDailyWochengeld(parent: ParentData): number {
  const employmentStatus: EmploymentStatus = parent.employmentStatus || 'employed';

  switch (employmentStatus) {
    case 'employed':
      if (parent.monthlyNetIncome <= 0) {
        return 0;
      }
      return parent.monthlyNetIncome / 30;

    case 'unemployed':
      if (!parent.dailyUnemploymentBenefit || parent.dailyUnemploymentBenefit <= 0) {
        return 0;
      }
      return parent.dailyUnemploymentBenefit * WOCHENGELD_CONFIG.unemployedMultiplier;

    case 'marginallyEmployed':
      return WOCHENGELD_CONFIG.minimumDailyRate;

    case 'notEmployed':
      return 0;

    default:
      return 0;
  }
}

/**
 * Check if the mother has Wochengeld entitlement based on employment status.
 */
export function hasWochengeldEntitlement(parent: ParentData): boolean {
  const employmentStatus: EmploymentStatus = parent.employmentStatus || 'employed';
  return employmentStatus !== 'notEmployed';
}

/**
 * Calculate total Wochengeld for the Mutterschutz period.
 * 
 * Important: During post-birth Mutterschutz, if Wochengeld is lower than KBG,
 * a difference payment (Differenzzahlung) is made to top up to the KBG rate.
 * This is handled separately in calculateFullResults.
 */
export function calculateTotalWochengeld(
  parent: ParentData,
  dueDate: string,
  birthConditions: BirthCondition[]
): {
  dailyWochengeld: number;
  totalWochengeld: number;
  durationDays: number;
  preBirthDays: number;
  postBirthDays: number;
  hasEntitlement: boolean;
} {
  const hasEntitlement = hasWochengeldEntitlement(parent);
  const dailyWochengeld = calculateDailyWochengeld(parent);
  const mutterschutz = calculateMutterschutz(dueDate, birthConditions);
  
  if (!mutterschutz.startDate || !mutterschutz.endDate) {
    return { dailyWochengeld: 0, totalWochengeld: 0, durationDays: 0, preBirthDays: 0, postBirthDays: 0, hasEntitlement };
  }
  
  // Calculate pre-birth and post-birth days separately
  const preBirthDays = MUTTERSCHUTZ_CONFIG.weeksBeforeBirth * 7;
  const postBirthDays = mutterschutz.weeksAfterBirth * 7;
  const durationDays = preBirthDays + postBirthDays;
  
  return {
    dailyWochengeld,
    totalWochengeld: dailyWochengeld * durationDays,
    durationDays,
    preBirthDays,
    postBirthDays,
    hasEntitlement,
  };
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
 * Calculate multiple birth supplement for pauschales KBG (Konto).
 * 
 * The supplement is 50% of the daily KBG rate per additional child:
 * - Twins: 1.5x the daily rate (50% extra)
 * - Triplets: 2x the daily rate (100% extra)
 * 
 * Note: This only applies to pauschales KBG, NOT to income-based KBG.
 * Source: https://www.oesterreich.gv.at/themen/familie_und_partnerschaft/finanzielle-unterstuetzungen/3/2/Seite.080624
 * 
 * @param birthConditions Birth conditions (twins, triplets, etc.)
 * @param durationDays Number of days
 * @param dailyKbgRate The daily KBG rate (flat-rate)
 * @param isIncomeBased Whether income-based KBG is selected (no supplement for this model)
 */
export function calculateMultipleBirthSupplement(
  birthConditions: BirthCondition[],
  durationDays: number,
  dailyKbgRate: number,
  isIncomeBased: boolean = false
): number {
  // No multiple birth supplement for income-based KBG
  if (isIncomeBased) {
    return 0;
  }

  const percentPerChild = MULTIPLE_BIRTH_SUPPLEMENT.percentPerAdditionalChild / 100;

  if (birthConditions.includes(BirthCondition.TRIPLETS_OR_MORE)) {
    // 100% extra (50% for second child + 50% for third child)
    // For triplets, you get 2x the daily rate (the base + 100% supplement)
    return dailyKbgRate * percentPerChild * 2 * durationDays;
  }

  if (birthConditions.includes(BirthCondition.TWINS)) {
    // 50% extra for the second child
    return dailyKbgRate * percentPerChild * durationDays;
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
  const higherMonthlyNet = Math.max(
    parent1.monthlyNetIncome,
    parent2.monthlyNetIncome
  );
  const incomeBasedDailyRate = calculateIncomeBasedDailyRate(higherMonthlyNet);
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
 * Calculate monthly breakdown of benefits (Wochengeld + KBG).
 */
export function calculateMonthlyBreakdown(
  distributionPlan: DistributionBlock[],
  dailyKbgRate: number,
  mutterschutzStart: string | null,
  mutterschutzEnd: string | null,
  dailyWochengeld: number,
  birthDate?: string,
  effectivePostBirthDailyRate?: number
): MonthlyBreakdownItem[] {
  const breakdown: MonthlyBreakdownItem[] = [];

  // Determine overall date range (Mutterschutz start to KBG end)
  let overallStart: Date | null = null;
  let overallEnd: Date | null = null;

  if (mutterschutzStart) {
    overallStart = parseDate(mutterschutzStart);
  }

  if (distributionPlan.length > 0) {
    const sortedBlocks = [...distributionPlan].sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );
    const lastBlock = sortedBlocks[sortedBlocks.length - 1]!;
    overallEnd = parseDate(lastBlock.endDate);

    if (!overallStart) {
      overallStart = parseDate(sortedBlocks[0]!.startDate);
    }
  }

  if (!overallStart || !overallEnd) {
    return [];
  }

  const mutterschutzStartDate = mutterschutzStart ? parseDate(mutterschutzStart) : null;
  const mutterschutzEndDate = mutterschutzEnd ? parseDate(mutterschutzEnd) : null;
  const birthDateObj = birthDate ? parseDate(birthDate) : null;

  // Sort KBG blocks by start date
  const sortedBlocks = [...distributionPlan].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  // Iterate month by month
  let currentDate = startOfMonth(overallStart);

  while (!isAfter(currentDate, overallEnd)) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Calculate Wochengeld days in this month (split into pre-birth and post-birth)
    let preBirthWochengeldDays = 0;
    let postBirthWochengeldDays = 0;
    if (mutterschutzStartDate && mutterschutzEndDate) {
      if (!isAfter(mutterschutzStartDate, monthEnd) && !isBefore(mutterschutzEndDate, monthStart)) {
        const overlapStart = maxDate([mutterschutzStartDate, monthStart]);
        const overlapEnd = minDate([mutterschutzEndDate, monthEnd]);
        
        // Split into pre-birth and post-birth days
        if (birthDateObj) {
          // Pre-birth days (before birth date)
          if (isBefore(overlapStart, birthDateObj)) {
            const preBirthEnd = minDate([overlapEnd, subDays(birthDateObj, 1)]);
            if (!isBefore(preBirthEnd, overlapStart)) {
              preBirthWochengeldDays = differenceInDays(preBirthEnd, overlapStart) + 1;
            }
          }
          // Post-birth days (birth date and after)
          if (!isBefore(overlapEnd, birthDateObj)) {
            const postBirthStart = maxDate([overlapStart, birthDateObj]);
            postBirthWochengeldDays = differenceInDays(overlapEnd, postBirthStart) + 1;
          }
        } else {
          // No birth date provided, treat all as pre-birth
          preBirthWochengeldDays = differenceInDays(overlapEnd, overlapStart) + 1;
        }
      }
    }
    const wochengeldDays = preBirthWochengeldDays + postBirthWochengeldDays;

    // Calculate KBG days in this month
    let parent1Days = 0;
    let parent2Days = 0;

    for (const block of sortedBlocks) {
      const blockStart = parseDate(block.startDate);
      const blockEnd = parseDate(block.endDate);

      if (blockStart && blockEnd && !isAfter(blockStart, monthEnd) && !isBefore(blockEnd, monthStart)) {
        const overlapStart = maxDate([blockStart, monthStart]);
        const overlapEnd = minDate([blockEnd, monthEnd]);
        const overlapDays = differenceInDays(overlapEnd, overlapStart) + 1;

        if (block.parent === 'parent1') {
          parent1Days += overlapDays;
        } else {
          parent2Days += overlapDays;
        }
      }
    }

    const totalKbgDays = parent1Days + parent2Days;
    let parent: 'parent1' | 'parent2' | 'both' | 'none';

    if (parent1Days > 0 && parent2Days > 0) {
      parent = 'both';
    } else if (parent1Days > 0) {
      parent = 'parent1';
    } else if (parent2Days > 0) {
      parent = 'parent2';
    } else if (wochengeldDays > 0) {
      parent = 'parent1'; // Wochengeld is for the mother
    } else {
      parent = 'none';
    }

    const kbgAmount = Math.round(totalKbgDays * dailyKbgRate * 100) / 100;
    // Pre-birth Wochengeld uses the base rate, post-birth uses the effective rate (max of Wochengeld and KBG)
    const preBirthAmount = Math.round(preBirthWochengeldDays * dailyWochengeld * 100) / 100;
    const postBirthRate = effectivePostBirthDailyRate ?? dailyWochengeld;
    const postBirthAmount = Math.round(postBirthWochengeldDays * postBirthRate * 100) / 100;
    const wochengeldAmount = preBirthAmount + postBirthAmount;
    const totalAmount = kbgAmount + wochengeldAmount;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (totalKbgDays > 0 || wochengeldDays > 0) {
      breakdown.push({
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
        monthLabel: `${GERMAN_MONTHS[month]} ${year}`,
        parent,
        kbgAmount,
        wochengeldAmount,
        totalAmount,
        daysWithKbg: totalKbgDays,
        daysWithWochengeld: wochengeldDays,
      });
    }

    // Move to next month
    currentDate = addMonths(currentDate, 1);
  }

  return breakdown;
}

/**
 * Calculate complete results for the calculator page.
 */
export function calculateFullResults(
  dueDate: string,
  parent1: ParentData,
  parent2: ParentData,
  model: ChildcareAllowanceModel,
  distributionPlan: DistributionBlock[],
  birthConditions: BirthCondition[]
): CalculatorResults {
  const isBothParents = distributionPlan.some((b) => b.parent === 'parent2');
  const totalKbgDays = distributionPlan.reduce((sum, b) => sum + b.durationDays, 0);

  // Calculate Mutterschutz and Wochengeld (for parent1/mother)
  const mutterschutz = calculateMutterschutz(dueDate, birthConditions);
  const wochengeldResult = calculateTotalWochengeld(parent1, dueDate, birthConditions);
  const dailyWochengeld = wochengeldResult.dailyWochengeld;
  const mutterschutzDurationDays = wochengeldResult.durationDays;
  const postBirthMutterschutzDays = wochengeldResult.postBirthDays;
  const hasWochengeld = wochengeldResult.hasEntitlement;

  // Calculate daily KBG rate based on model
  let dailyKbgRate: number;
  let kbgDurationDays: number;

  if (model.type === 'flatRate') {
    kbgDurationDays = model.chosenDurationDays || totalKbgDays;
    dailyKbgRate = calculateFlatRateDailyRate(kbgDurationDays, isBothParents);
  } else {
    // Income-based
    const higherMonthlyNet = Math.max(parent1.monthlyNetIncome, parent2.monthlyNetIncome);
    dailyKbgRate = calculateIncomeBasedDailyRate(higherMonthlyNet);
    kbgDurationDays = isBothParents
      ? INCOME_BASED_CONFIG.maxDaysBothParents
      : INCOME_BASED_CONFIG.maxDaysSingleParent;
  }

  // Calculate KBG difference payment (Differenzzahlung) for post-birth Mutterschutz
  // If Wochengeld < KBG rate, the mother receives the difference as a top-up
  // Source: https://www.oesterreich.gv.at/themen/familie_und_partnerschaft/finanzielle-unterstuetzungen/3/2/Seite.080621.html
  let kbgDifferencePayment = 0;
  if (hasWochengeld && dailyWochengeld < dailyKbgRate && postBirthMutterschutzDays > 0) {
    const dailyDifference = dailyKbgRate - dailyWochengeld;
    kbgDifferencePayment = dailyDifference * postBirthMutterschutzDays;
  }

  // Total Wochengeld includes the base Wochengeld plus any KBG difference payment
  const totalWochengeld = wochengeldResult.totalWochengeld + kbgDifferencePayment;

  // Effective daily rate during post-birth Mutterschutz (for display)
  const effectivePostBirthDailyRate = hasWochengeld
    ? Math.max(dailyWochengeld, dailyKbgRate)
    : 0;

  const monthlyKbgRate = dailyKbgRate * 30;
  const totalKbgAmount = dailyKbgRate * totalKbgDays;

  // Partnership bonus
  const partnershipBonus = calculatePartnershipBonus(distributionPlan);

  // Multiple birth supplement (only for flat-rate KBG, not income-based)
  const isIncomeBased = model.type === 'incomeBased';
  const multipleBirthSupplement = calculateMultipleBirthSupplement(
    birthConditions,
    totalKbgDays,
    dailyKbgRate,
    isIncomeBased
  );

  // Familienbonus (yearly amount for display)
  const familienbonusYearly = FAMILIENBONUS_CONFIG.yearlyAmount;

  // Grand total (Wochengeld + KBG + bonuses, Familienbonus is separate)
  const grandTotal = totalWochengeld + totalKbgAmount + partnershipBonus + multipleBirthSupplement;

  // Monthly breakdown (includes both Wochengeld and KBG, with effective rate for post-birth)
  const monthlyBreakdown = calculateMonthlyBreakdown(
    distributionPlan,
    dailyKbgRate,
    mutterschutz.startDate,
    mutterschutz.endDate,
    dailyWochengeld,
    dueDate, // Pass birth date to distinguish pre/post-birth Mutterschutz
    effectivePostBirthDailyRate
  );

  // Income comparison (using net income for comparison)
  const regularMonthlyIncome = Math.max(parent1.monthlyNetIncome, parent2.monthlyNetIncome);
  const totalBenefitMonths = monthlyBreakdown.length || 1;
  const averageMonthlyBenefit = grandTotal / totalBenefitMonths;
  const differencePercent =
    regularMonthlyIncome > 0
      ? Math.round(((averageMonthlyBenefit - regularMonthlyIncome) / regularMonthlyIncome) * 100)
      : 0;

  // Parent breakdown (KBG only, Wochengeld is always for parent1)
  const parent1KbgDays = distributionPlan
    .filter((b) => b.parent === 'parent1')
    .reduce((sum, b) => sum + b.durationDays, 0);
  const parent2KbgDays = distributionPlan
    .filter((b) => b.parent === 'parent2')
    .reduce((sum, b) => sum + b.durationDays, 0);

  return {
    mutterschutz: {
      startDate: mutterschutz.startDate || '',
      endDate: mutterschutz.endDate || '',
      durationDays: mutterschutzDurationDays,
      dailyWochengeld,
      totalWochengeld,
      hasWochengeldEntitlement: hasWochengeld,
      kbgDifferencePayment,
      effectivePostBirthDailyRate,
    },
    selectedModelResults: {
      dailyRate: dailyKbgRate,
      monthlyRate: monthlyKbgRate,
      totalAmount: totalKbgAmount,
      durationDays: kbgDurationDays,
    },
    partnershipBonus,
    multipleBirthSupplement,
    familienbonusYearly,
    grandTotal,
    monthlyBreakdown,
    incomeComparison: {
      regularMonthlyIncome,
      averageMonthlyBenefit,
      differencePercent,
    },
    parentBreakdown: {
      parent1: {
        days: parent1KbgDays + mutterschutzDurationDays, // Include Mutterschutz
        amount: (parent1KbgDays * dailyKbgRate) + totalWochengeld,
      },
      parent2: {
        days: parent2KbgDays,
        amount: parent2KbgDays * dailyKbgRate,
      },
    },
  };
}
