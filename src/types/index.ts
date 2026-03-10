/**
 * Core data types for the Karenz.at application.
 * Following RULES.md: Internal code in English, user-facing text in German.
 */

// === Birth Conditions (affect Mutterschutz duration & benefits) ===

export enum BirthCondition {
  /** Kaiserschnitt - extends Mutterschutz to 12 weeks */
  CESAREAN = 'CESAREAN',
  /** Frühgeburt - extends Mutterschutz to 12 weeks */
  PREMATURE = 'PREMATURE',
  /** Zwillinge - affects Mehrlingszuschlag */
  TWINS = 'TWINS',
  /** Drillinge+ - higher Mehrlingszuschlag */
  TRIPLETS_OR_MORE = 'TRIPLETS_OR_MORE',
  /** Komplikationen - may extend Mutterschutz */
  COMPLICATED_BIRTH = 'COMPLICATED_BIRTH',
}

// === Childcare Allowance (Kinderbetreuungsgeld) Models ===

/**
 * flatRate = Pauschales KBG (Konto)
 * incomeBased = Einkommensabhängiges KBG
 */
export type AllowanceType = 'flatRate' | 'incomeBased';

export interface ChildcareAllowanceModel {
  type: AllowanceType;
  /** For flatRate: chosen duration in days (365-851 single, 456-1063 both) */
  chosenDurationDays?: number;
}

// === Parent Data ===

export interface ParentData {
  name?: string;
  /** Average monthly net income in EUR (from 3 months before Mutterschutz) */
  monthlyNetIncome: number;
  /** Required for einkommensabhängig (182 days continuous employment before birth) */
  hasWorked182Days: boolean;
}

// === Distribution Plan (Bezugsplan) ===

export interface DistributionBlock {
  parent: 'parent1' | 'parent2';
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  durationDays: number;
}

// === Main User Data ===

export interface UserData {
  /** YYYY-MM-DD format */
  dueDate: string;
  parent1: ParentData;
  parent2: ParentData;
  selectedModel: ChildcareAllowanceModel;
  /** Planned distribution between parents */
  distributionPlan: DistributionBlock[];
  /** Multi-select, affects Mutterschutz & benefits */
  birthConditions: BirthCondition[];
}

// === Helper types for forms and validation ===

export interface ValidationError {
  field: string;
  message: string;
}

export interface ModelComparison {
  flatRate: {
    dailyRate: number;
    totalAmount: number;
    durationDays: number;
    monthlyRate: number;
  };
  incomeBased: {
    dailyRate: number;
    totalAmount: number;
    durationDays: number;
    monthlyRate: number;
    eligible: boolean;
  };
  recommendation: AllowanceType | 'either';
  reasonKey: string;
}

// === Calculator Types ===

export interface MonthlyBreakdownItem {
  /** Month in YYYY-MM format */
  month: string;
  /** Display label (e.g., "Januar 2026") */
  monthLabel: string;
  /** Which parent receives benefits this month */
  parent: 'parent1' | 'parent2' | 'both' | 'none';
  /** KBG amount for this month */
  kbgAmount: number;
  /** Wochengeld (maternity allowance) amount for this month */
  wochengeldAmount: number;
  /** Total benefit amount (KBG + Wochengeld) */
  totalAmount: number;
  /** Regular income for comparison (optional) */
  regularIncome?: number;
  /** Days in this month with KBG */
  daysWithKbg: number;
  /** Days in this month with Wochengeld */
  daysWithWochengeld: number;
}

export interface CalculatorResults {
  /** Mutterschutz (maternity protection) results */
  mutterschutz: {
    startDate: string;
    endDate: string;
    durationDays: number;
    dailyWochengeld: number;
    totalWochengeld: number;
  };
  /** Results for the selected KBG model */
  selectedModelResults: {
    dailyRate: number;
    monthlyRate: number;
    totalAmount: number;
    durationDays: number;
  };
  /** Partnership bonus amount (€500 each if both take ≥124 days) */
  partnershipBonus: number;
  /** Additional amount for twins/triplets */
  multipleBirthSupplement: number;
  /** Familienbonus Plus yearly amount */
  familienbonusYearly: number;
  /** Grand total of all benefits (Wochengeld + KBG + bonuses) */
  grandTotal: number;
  /** Monthly breakdown for chart */
  monthlyBreakdown: MonthlyBreakdownItem[];
  /** Income comparison */
  incomeComparison: {
    regularMonthlyIncome: number;
    averageMonthlyBenefit: number;
    differencePercent: number;
  };
  /** Per-parent breakdown */
  parentBreakdown: {
    parent1: {
      days: number;
      amount: number;
    };
    parent2: {
      days: number;
      amount: number;
    };
  };
}

// === Timeline Events ===

export type TimelineEventCategory =
  | 'mutterschutz'
  | 'karenz'
  | 'kbg'
  | 'employer'
  | 'deadline'
  | 'benefit';

export interface TimelineEvent {
  id: string;
  /** Display title in German */
  title: string;
  /** Detailed description */
  description: string;
  /** YYYY-MM-DD */
  date: string;
  /** Optional end date for periods */
  endDate?: string;
  /** Event category for filtering and styling */
  category: TimelineEventCategory;
  /** Which parent this applies to, if any */
  parent?: 'parent1' | 'parent2' | 'both';
  /** Whether this is a period (range) or single date */
  isPeriod: boolean;
  /** Optional link to FAQ section */
  faqLink?: string;
  /** Priority for sorting (lower = more important) */
  priority: number;
}
