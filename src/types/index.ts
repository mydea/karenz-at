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
  /** Gross monthly salary in EUR */
  monthlySalary: number;
  /** YYYY-MM-DD, only relevant if < 6 months ago */
  workStartDate?: string;
  /** Required for einkommensabhängig (182 days continuous employment) */
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
  };
  incomeBased: {
    dailyRate: number;
    totalAmount: number;
    durationDays: number;
    eligible: boolean;
  };
  recommendation: AllowanceType | 'either';
  reasonKey: string;
}
