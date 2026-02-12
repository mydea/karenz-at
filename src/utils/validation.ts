import type { UserData, DistributionBlock, ParentData, ValidationError } from '@/types';
import { FLAT_RATE_CONFIG, INCOME_BASED_CONFIG } from '@/data/constants';
import { isValidDateString } from './dates';

/**
 * Validate parent data.
 */
export function validateParentData(parent: ParentData, label: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (parent.monthlySalary < 0) {
    errors.push({
      field: `${label}.monthlySalary`,
      message: `${label}: Gehalt kann nicht negativ sein`,
    });
  }

  return errors;
}

/**
 * Validate a single distribution block.
 */
export function validateDistributionBlock(
  block: DistributionBlock,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isValidDateString(block.startDate)) {
    errors.push({
      field: `distributionPlan[${index}].startDate`,
      message: `Block ${index + 1}: Ungültiges Startdatum`,
    });
  }

  if (!isValidDateString(block.endDate)) {
    errors.push({
      field: `distributionPlan[${index}].endDate`,
      message: `Block ${index + 1}: Ungültiges Enddatum`,
    });
  }

  if (block.startDate >= block.endDate) {
    errors.push({
      field: `distributionPlan[${index}]`,
      message: `Block ${index + 1}: Startdatum muss vor Enddatum liegen`,
    });
  }

  if (block.durationDays < FLAT_RATE_CONFIG.minBlockDays) {
    errors.push({
      field: `distributionPlan[${index}].durationDays`,
      message: `Block ${index + 1}: Mindestdauer ist ${FLAT_RATE_CONFIG.minBlockDays} Tage`,
    });
  }

  return errors;
}

/**
 * Validate the entire distribution plan.
 */
export function validateDistributionPlan(
  plan: DistributionBlock[],
  isBothParents: boolean,
  modelType: 'flatRate' | 'incomeBased'
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate individual blocks
  plan.forEach((block, index) => {
    errors.push(...validateDistributionBlock(block, index));
  });

  // Check max blocks
  const maxBlocks = FLAT_RATE_CONFIG.maxBlocks;
  if (plan.length > maxBlocks) {
    errors.push({
      field: 'distributionPlan',
      message: `Maximal ${maxBlocks} Bezugsblöcke erlaubt`,
    });
  }

  // Check total duration
  const totalDays = plan.reduce((sum, block) => sum + block.durationDays, 0);

  const maxDays = isBothParents
    ? modelType === 'flatRate'
      ? FLAT_RATE_CONFIG.maxDaysBothParents
      : INCOME_BASED_CONFIG.maxDaysBothParents
    : modelType === 'flatRate'
      ? FLAT_RATE_CONFIG.maxDaysSingleParent
      : INCOME_BASED_CONFIG.maxDaysSingleParent;

  if (totalDays > maxDays) {
    errors.push({
      field: 'distributionPlan',
      message: `Gesamtdauer (${totalDays} Tage) überschreitet Maximum (${maxDays} Tage)`,
    });
  }

  // Check second parent minimum (for flat-rate)
  if (isBothParents && modelType === 'flatRate') {
    const parent2Days = plan
      .filter((block) => block.parent === 'parent2')
      .reduce((sum, block) => sum + block.durationDays, 0);

    const minParent2Days = Math.max(
      FLAT_RATE_CONFIG.secondParentMinDays,
      Math.floor((totalDays * FLAT_RATE_CONFIG.secondParentMinPercent) / 100)
    );

    if (parent2Days < minParent2Days) {
      errors.push({
        field: 'distributionPlan',
        message: `Elternteil 2 muss mindestens ${minParent2Days} Tage beziehen`,
      });
    }
  }

  // Check for gaps between blocks (blocks should be consecutive or overlap)
  const sortedBlocks = [...plan].sort((a, b) => a.startDate.localeCompare(b.startDate));
  for (let i = 1; i < sortedBlocks.length; i++) {
    const prevBlock = sortedBlocks[i - 1]!;
    const currBlock = sortedBlocks[i]!;

    // Allow overlap of up to overlapDaysAllowed
    const prevEndDate = new Date(prevBlock.endDate);
    const currStartDate = new Date(currBlock.startDate);

    const gapDays = Math.floor(
      (currStartDate.getTime() - prevEndDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (gapDays > 1) {
      errors.push({
        field: 'distributionPlan',
        message: `Lücke von ${gapDays} Tagen zwischen Block ${i} und ${i + 1}`,
      });
    }
  }

  return errors;
}

/**
 * Validate complete user data.
 */
export function validateUserData(data: Partial<UserData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Due date
  if (!data.dueDate) {
    errors.push({
      field: 'dueDate',
      message: 'Geburtstermin ist erforderlich',
    });
  } else if (!isValidDateString(data.dueDate)) {
    errors.push({
      field: 'dueDate',
      message: 'Ungültiges Datumsformat für Geburtstermin',
    });
  }

  // Parent data
  if (data.parent1) {
    errors.push(...validateParentData(data.parent1, 'Elternteil 1'));
  }

  if (data.parent2) {
    errors.push(...validateParentData(data.parent2, 'Elternteil 2'));
  }

  // Model selection
  if (!data.selectedModel?.type) {
    errors.push({
      field: 'selectedModel',
      message: 'Bitte wählen Sie ein KBG-Modell',
    });
  }

  // Income-based eligibility check
  if (data.selectedModel?.type === 'incomeBased') {
    const parent1Eligible = data.parent1?.hasWorked182Days ?? false;
    const parent2Eligible = data.parent2?.hasWorked182Days ?? false;

    if (!parent1Eligible && !parent2Eligible) {
      errors.push({
        field: 'selectedModel',
        message:
          'Für das einkommensabhängige Modell muss mindestens ein Elternteil 182 Tage erwerbstätig gewesen sein',
      });
    }
  }

  // Distribution plan
  if (data.distributionPlan && data.distributionPlan.length > 0 && data.selectedModel) {
    const hasParent2Blocks = data.distributionPlan.some((block) => block.parent === 'parent2');
    errors.push(
      ...validateDistributionPlan(data.distributionPlan, hasParent2Blocks, data.selectedModel.type)
    );
  }

  return errors;
}
