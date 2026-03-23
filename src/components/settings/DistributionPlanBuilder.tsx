import { useState, useRef, useEffect } from 'react';
import type { DistributionBlock, ChildcareAllowanceModel, BirthCondition, ParentData } from '@/types';
import { FLAT_RATE_CONFIG, INCOME_BASED_CONFIG, MUTTERSCHUTZ_CONFIG } from '@/data/constants';
import {
  addDays,
  daysBetween,
  formatDateGerman,
  parseDateGerman,
  isValidDateString,
} from '@/utils/dates';
import { calculateMutterschutz, hasWochengeldEntitlement } from '@/utils/calculations';

/**
 * Duration input that allows free typing and only validates on blur.
 */
function DurationInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  const [localValue, setLocalValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when external value changes and not focused
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const handleFocus = () => {
    setLocalValue(value.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const parsed = parseInt(localValue) || 0;
    const clamped = Math.min(Math.max(parsed, min), max);
    setLocalValue(clamped.toString());
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="number"
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      min={min}
      max={max}
      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
    />
  );
}

/**
 * End date input that allows editing in German format and validates on blur.
 */
function EndDateInput({
  value,
  onChange,
  minDate,
}: {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate: string; // YYYY-MM-DD - minimum valid end date
}) {
  const [localValue, setLocalValue] = useState(formatDateGerman(value));
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when external value changes and not focused
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalValue(formatDateGerman(value));
      setHasError(false);
    }
  }, [value]);

  const handleFocus = () => {
    setLocalValue(formatDateGerman(value));
    setHasError(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setHasError(false);
  };

  const handleBlur = () => {
    const parsed = parseDateGerman(localValue);

    if (parsed && isValidDateString(parsed)) {
      // Check if date is at least minDate
      if (parsed >= minDate) {
        setLocalValue(formatDateGerman(parsed));
        setHasError(false);
        onChange(parsed);
      } else {
        // Date is before minimum, use minimum
        setLocalValue(formatDateGerman(minDate));
        setHasError(false);
        onChange(minDate);
      }
    } else {
      // Invalid date, revert to original
      setLocalValue(formatDateGerman(value));
      setHasError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="TT.MM.JJJJ"
      className={`w-28 rounded border px-2 py-1 text-sm ${
        hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
      }`}
    />
  );
}

/**
 * Start date input that allows editing in German format and validates on blur.
 */
function StartDateInput({
  value,
  onChange,
  minDate,
  maxDate,
}: {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate: string; // YYYY-MM-DD - earliest valid start date
  maxDate?: string; // YYYY-MM-DD - latest valid start date (for overlap limits)
}) {
  const [localValue, setLocalValue] = useState(formatDateGerman(value));
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when external value changes and not focused
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalValue(formatDateGerman(value));
      setHasError(false);
    }
  }, [value]);

  const handleFocus = () => {
    setLocalValue(formatDateGerman(value));
    setHasError(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setHasError(false);
  };

  const handleBlur = () => {
    const parsed = parseDateGerman(localValue);

    if (parsed && isValidDateString(parsed)) {
      let finalDate = parsed;

      // Enforce minDate
      if (finalDate < minDate) {
        finalDate = minDate;
      }

      // Enforce maxDate if provided
      if (maxDate && finalDate > maxDate) {
        finalDate = maxDate;
      }

      setLocalValue(formatDateGerman(finalDate));
      setHasError(false);
      onChange(finalDate);
    } else {
      // Invalid date, revert to original
      setLocalValue(formatDateGerman(value));
      setHasError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="TT.MM.JJJJ"
      className={`w-28 rounded border px-2 py-1 text-sm ${
        hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
      }`}
    />
  );
}

interface DistributionPlanBuilderProps {
  blocks: DistributionBlock[];
  onChange: (blocks: DistributionBlock[]) => void;
  model: ChildcareAllowanceModel;
  dueDate: string; // Expected/actual birth date
  birthConditions: BirthCondition[];
  isBothParents: boolean;
  parent1Name?: string;
  parent2Name?: string;
  parent1Data?: ParentData;
}

export function DistributionPlanBuilder({
  blocks,
  onChange,
  model,
  dueDate,
  birthConditions,
  isBothParents,
  parent1Name,
  parent2Name,
  parent1Data,
}: DistributionPlanBuilderProps) {
  // Calculate Mutterschutz period
  const mutterschutz = calculateMutterschutz(dueDate, birthConditions);
  const preBirthMutterschutzDays = MUTTERSCHUTZ_CONFIG.weeksBeforeBirth * 7;
  const postBirthMutterschutzDays = mutterschutz.weeksAfterBirth * 7;
  const mutterschutzDays = preBirthMutterschutzDays + postBirthMutterschutzDays;

  // Check if mother has Wochengeld entitlement
  const motherHasWochengeld = parent1Data ? hasWochengeldEntitlement(parent1Data) : true;

  // KBG starts the day after Mutterschutz ends (with Wochengeld) or on birth date (without)
  const startDate = motherHasWochengeld
    ? (mutterschutz.endDate ? addDays(mutterschutz.endDate, 1) : null)
    : dueDate;

  // Refs to access current values without triggering effect reruns
  const blocksRef = useRef(blocks);
  const onChangeRef = useRef(onChange);
  blocksRef.current = blocks;
  onChangeRef.current = onChange;

  // When the KBG start date changes (e.g., birth conditions modified), shift all blocks
  useEffect(() => {
    const currentBlocks = blocksRef.current;

    // Skip if no blocks or no start date
    if (!startDate || currentBlocks.length === 0) return;

    // Check if first block's start date matches expected start date
    const firstBlock = currentBlocks[0];
    if (!firstBlock) return;
    const firstBlockStart = firstBlock.startDate;
    if (firstBlockStart === startDate) return;

    // Calculate the difference and shift all blocks
    const daysDiff = daysBetween(firstBlockStart, startDate);
    if (daysDiff === null || daysDiff === 0) return;

    // Shift all blocks by the difference
    const shiftedBlocks = currentBlocks.map((block) => {
      const newStartDate = addDays(block.startDate, daysDiff);
      const newEndDate = addDays(block.endDate, daysDiff);

      if (newStartDate && newEndDate) {
        return {
          ...block,
          startDate: newStartDate,
          endDate: newEndDate,
        };
      }
      return block;
    });

    onChangeRef.current(shiftedBlocks);
  }, [startDate]);

  // Track previous model type to detect changes
  const prevModelTypeRef = useRef(model.type);

  // Reset blocks when model type changes
  useEffect(() => {
    if (prevModelTypeRef.current !== model.type) {
      prevModelTypeRef.current = model.type;
      onChangeRef.current([]);
    }
  }, [model.type]);

  // Use names if provided, otherwise fallback to default labels
  const parent1Label = parent1Name || 'Elternteil 1';
  const parent2Label = parent2Name || 'Elternteil 2';
  const [editingBlock, setEditingBlock] = useState<number | null>(null);

  // Get max duration based on model and whether both parents take leave
  const config = model.type === 'flatRate' ? FLAT_RATE_CONFIG : INCOME_BASED_CONFIG;

  // The total allowance duration includes Mutterschutz after birth (when entitled)
  // So actual KBG days = total days - post-birth Mutterschutz days (if Wochengeld)
  const totalAllowanceDays =
    model.type === 'flatRate'
      ? (model.chosenDurationDays ??
        (isBothParents ? config.maxDaysBothParents : config.maxDaysSingleParent))
      : isBothParents
        ? INCOME_BASED_CONFIG.maxDaysBothParents
        : INCOME_BASED_CONFIG.maxDaysSingleParent;

  // Subtract post-birth Mutterschutz to get actual KBG days available (only if Wochengeld)
  const maxDays = motherHasWochengeld
    ? totalAllowanceDays - postBirthMutterschutzDays
    : totalAllowanceDays;

  // Calculate total days used
  const totalDaysUsed = blocks.reduce((sum, b) => sum + b.durationDays, 0);
  const remainingDays = maxDays - totalDaysUsed;

  // Calculate days per parent
  const parent1Days = blocks
    .filter((b) => b.parent === 'parent1')
    .reduce((sum, b) => sum + b.durationDays, 0);
  const parent2Days = blocks
    .filter((b) => b.parent === 'parent2')
    .reduce((sum, b) => sum + b.durationDays, 0);

  // Parent 1 (mother) totals including Mutterschutz (only if Wochengeld)
  const parent1DaysAfterBirth = motherHasWochengeld
    ? parent1Days + postBirthMutterschutzDays
    : parent1Days;
  const parent1TotalDays = motherHasWochengeld
    ? parent1Days + postBirthMutterschutzDays + preBirthMutterschutzDays
    : parent1Days;

  // Minimum days for second parent (flat-rate only)
  const minParent2Days =
    model.type === 'flatRate'
      ? Math.max(
          FLAT_RATE_CONFIG.secondParentMinDays,
          Math.floor((maxDays * FLAT_RATE_CONFIG.secondParentMinPercent) / 100)
        )
      : INCOME_BASED_CONFIG.reservedDaysPerParent;

  const addBlock = (parent: 'parent1' | 'parent2') => {
    if (blocks.length >= FLAT_RATE_CONFIG.maxBlocks) return;

    // Calculate start date for new block
    const lastBlock = blocks[blocks.length - 1];
    const newStartDate = lastBlock ? (addDays(lastBlock.endDate, 1) ?? startDate) : startDate;

    if (!newStartDate) return;

    const defaultDuration = Math.min(FLAT_RATE_CONFIG.minBlockDays, remainingDays);
    const newEndDate = addDays(newStartDate, defaultDuration - 1);

    if (!newEndDate) return;

    const newBlock: DistributionBlock = {
      parent,
      startDate: newStartDate,
      endDate: newEndDate,
      durationDays: defaultDuration,
    };

    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<DistributionBlock>) => {
    const newBlocks = [...blocks];
    const existingBlock = newBlocks[index];
    if (!existingBlock) return;

    // Update the target block
    const block: DistributionBlock = { ...existingBlock, ...updates };

    // Recalculate duration if dates changed (and duration wasn't explicitly set)
    if ((updates.startDate || updates.endDate) && !updates.durationDays) {
      const days = daysBetween(block.startDate, block.endDate);
      if (days !== null) {
        block.durationDays = days + 1; // Include both start and end day
      }
    }

    // Recalculate end date if duration changed (and end date wasn't explicitly set)
    if (updates.durationDays && !updates.endDate) {
      const newEnd = addDays(block.startDate, updates.durationDays - 1);
      if (newEnd) {
        block.endDate = newEnd;
      }
    }

    // Recalculate end date if start date changed (keep duration)
    if (updates.startDate && !updates.endDate && !updates.durationDays) {
      const newEnd = addDays(updates.startDate, block.durationDays - 1);
      if (newEnd) {
        block.endDate = newEnd;
      }
    }

    newBlocks[index] = block;
    onChange(newBlocks);
  };

  // Calculate overlap between two blocks (positive = overlap days, 0 = seamless, negative = gap)
  // If blockB starts before or on blockA's end date, there's overlap
  const calculateOverlapOrGap = (blockA: DistributionBlock, blockB: DistributionBlock): number => {
    // Gap = days between blockA end and blockB start
    // If blockA ends Oct 31 and blockB starts Nov 1, gap = 0 (seamless)
    // If blockA ends Oct 31 and blockB starts Nov 2, gap = 1 (1 day gap)
    // If blockA ends Oct 31 and blockB starts Oct 31, overlap = 1 (same day)
    // If blockA ends Oct 31 and blockB starts Oct 1, overlap = 31 (Oct 1-31)
    const daysDiff = daysBetween(blockA.endDate, blockB.startDate);

    if (daysDiff === null) return 0;

    // daysDiff = blockB.startDate - blockA.endDate
    // If daysDiff = 1, seamless (gap = 0)
    // If daysDiff > 1, gap = daysDiff - 1
    // If daysDiff <= 0, overlap = -daysDiff + 1 (includes both boundary days)

    if (daysDiff <= 0) {
      // Overlap: blockB starts on or before blockA ends
      return -daysDiff; // positive = overlap days
    } else if (daysDiff === 1) {
      // Seamless transition
      return 0;
    } else {
      // Gap: blockB starts after blockA ends (with days in between)
      return -(daysDiff - 1); // negative = gap days
    }
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const getParentColor = (parent: 'parent1' | 'parent2') =>
    parent === 'parent1' ? 'bg-primary-500' : 'bg-blue-500';

  const getParentLabel = (parent: 'parent1' | 'parent2') =>
    parent === 'parent1' ? parent1Label : parent2Label;

  // Total timeline includes Mutterschutz + KBG (only if Wochengeld)
  const totalTimelineDays = motherHasWochengeld ? mutterschutzDays + maxDays : maxDays;

  // Calculate percentage for visual bar (relative to total timeline)
  const getBlockWidth = (days: number) => Math.max((days / totalTimelineDays) * 100, 3);

  // Calculate total overlap days across all blocks
  const totalOverlapDays = blocks.reduce((sum, block, index) => {
    if (index === 0) return sum;
    const prevBlock = blocks[index - 1];
    if (!prevBlock) return sum;
    const overlapOrGap = calculateOverlapOrGap(prevBlock, block);
    return sum + (overlapOrGap > 0 ? overlapOrGap : 0);
  }, 0);

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Kinderbetreuungsgeld Bezugsverteilung</h3>
        <p className="mt-1 text-sm text-gray-500">
          Planen Sie, wann und wie lange jeder Elternteil Kinderbetreuungsgeld (KBG) beziehen soll.
          Sie können bis zu {FLAT_RATE_CONFIG.maxBlocks} Bezugsblöcke anlegen und flexibel zwischen
          den Elternteilen aufteilen.
        </p>
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700">Wie funktioniert das?</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-gray-400">•</span>
              <span>In der Zeitleiste sehen Sie die Bezugsblöcke für Ihre Karenz</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-gray-400">•</span>
              <span>Fügen Sie nach Bedarf Blöcke für die Eltern hinzu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-gray-400">•</span>
              <span>Sie können die Blöcke jederzeit bearbeiten oder löschen</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Mutterschutz info - only show when mother has Wochengeld */}
      {motherHasWochengeld && mutterschutz.startDate && mutterschutz.endDate && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-purple-500" />
              <span className="text-sm font-medium text-purple-900">Mutterschutz (Wochengeld)</span>
            </div>
            <span className="text-sm text-purple-700">
              {formatDateGerman(mutterschutz.startDate)} – {formatDateGerman(mutterschutz.endDate)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-purple-600">
            <span>
              {preBirthMutterschutzDays} Tage vor Geburt ({MUTTERSCHUTZ_CONFIG.weeksBeforeBirth}{' '}
              Wo.)
            </span>
            <span>
              {postBirthMutterschutzDays} Tage nach Geburt ({mutterschutz.weeksAfterBirth} Wo.)
            </span>
            <span>→ KBG beginnt am {startDate ? formatDateGerman(startDate) : '–'}</span>
          </div>
        </div>
      )}

      {/* Info box when no Wochengeld - KBG starts on birth date */}
      {!motherHasWochengeld && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-sm font-medium text-green-900">KBG ab Geburt</span>
            </div>
            <span className="text-sm text-green-700">
              ab {startDate ? formatDateGerman(startDate) : '–'}
            </span>
          </div>
          <p className="mt-1 text-xs text-green-600">
            Ohne Wochengeld-Anspruch beginnt das Kinderbetreuungsgeld direkt mit dem Tag der Geburt.
          </p>
        </div>
      )}

      {/* Error: Too many days planned */}
      {remainingDays < 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-red-800">Zu viele Tage geplant</h4>
              <p className="mt-1 text-sm text-red-700">
                Sie haben {Math.abs(remainingDays)} Tage mehr geplant als für das Kinderbetreuungsgeld
                verfügbar sind. Bitte reduzieren Sie die Dauer der Bezugsblöcke.
              </p>
              <p className="mt-2 text-sm text-red-600">
                <strong>Hinweis:</strong> Karenz kann länger dauern als der KBG-Bezug – Sie erhalten
                dann aber kein Kinderbetreuungsgeld mehr.{' '}
                <a
                  href="/faq#karenz-dauer"
                  className="underline hover:text-red-800"
                >
                  Mehr erfahren
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual timeline */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-gray-600">
            {motherHasWochengeld
              ? `Gesamtanspruch: ${totalAllowanceDays} Tage (davon ${postBirthMutterschutzDays} Tage Mutterschutz/Wochengeld)`
              : `Gesamtanspruch: ${totalAllowanceDays} Tage KBG`}
          </span>
          {motherHasWochengeld && <span className="text-gray-600">KBG: {maxDays} Tage</span>}
          <span className={remainingDays < 0 ? 'font-medium text-red-600' : 'text-gray-600'}>
            {remainingDays < 0
              ? `${Math.abs(remainingDays)} Tage zu viel geplant!`
              : `Noch verfügbar: ${remainingDays} Tage`}
          </span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-12 overflow-hidden rounded-lg bg-gray-100">
          <div className="flex h-full">
            {/* Pre-birth Mutterschutz block - only when mother has Wochengeld */}
            {motherHasWochengeld && preBirthMutterschutzDays > 0 && (
              <div
                className="flex items-center justify-center bg-purple-400 text-xs font-medium text-white"
                style={{ width: `${getBlockWidth(preBirthMutterschutzDays)}%` }}
                title={`Mutterschutz vor Geburt: ${preBirthMutterschutzDays} Tage`}
              >
                <span className="truncate px-1">MS↓</span>
              </div>
            )}

            {/* Post-birth Mutterschutz block - only when mother has Wochengeld */}
            {motherHasWochengeld && postBirthMutterschutzDays > 0 && (
              <div
                className="flex items-center justify-center bg-purple-600 text-xs font-medium text-white"
                style={{ width: `${getBlockWidth(postBirthMutterschutzDays)}%` }}
                title={`Mutterschutz nach Geburt: ${postBirthMutterschutzDays} Tage`}
              >
                <span className="truncate px-1">MS↑</span>
              </div>
            )}

            {/* KBG blocks */}
            {blocks.length === 0 && startDate ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                Noch keine KBG-Blöcke geplant
              </div>
            ) : (
              <>
                {blocks.map((block, index) => {
                  const prevBlock = index > 0 ? blocks[index - 1] : null;
                  const overlapOrGap = prevBlock ? calculateOverlapOrGap(prevBlock, block) : 0;
                  const overlapDays = overlapOrGap > 0 ? overlapOrGap : 0;
                  const nonOverlapDays = block.durationDays - overlapDays;
                  
                  // Colors for stripes
                  const prevColor = prevBlock?.parent === 'parent1' ? 'rgb(99 102 241)' : 'rgb(59 130 246)'; // primary-500 / blue-500
                  const currentColor = block.parent === 'parent1' ? 'rgb(99 102 241)' : 'rgb(59 130 246)';
                  
                  return (
                    <div
                      key={index}
                      className={`relative flex items-center justify-center text-xs font-medium text-white transition-all ${
                        editingBlock === index ? 'ring-2 ring-primary-400 ring-offset-1' : ''
                      }`}
                      style={{ width: `${getBlockWidth(block.durationDays)}%` }}
                      onClick={() => setEditingBlock(editingBlock === index ? null : index)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Overlap portion with stripes */}
                      {overlapDays > 0 && (
                        <div
                          className="absolute left-0 top-0 h-full"
                          style={{
                            width: `${(overlapDays / block.durationDays) * 100}%`,
                            background: `repeating-linear-gradient(
                              -45deg,
                              ${prevColor},
                              ${prevColor} 4px,
                              ${currentColor} 4px,
                              ${currentColor} 8px
                            )`,
                          }}
                          title={`Überlappung: ${overlapDays} Tage`}
                        />
                      )}
                      {/* Non-overlap portion with solid color */}
                      <div
                        className={`absolute top-0 h-full ${getParentColor(block.parent)}`}
                        style={{
                          left: overlapDays > 0 ? `${(overlapDays / block.durationDays) * 100}%` : '0',
                          width: overlapDays > 0 ? `${(nonOverlapDays / block.durationDays) * 100}%` : '100%',
                        }}
                      />
                      {/* Label */}
                      <span className="relative z-10 truncate px-1">{block.durationDays}d</span>
                    </div>
                  );
                })}
                {remainingDays > 0 && (
                  <div
                    className="flex flex-1 items-center justify-center text-xs text-gray-400"
                    style={{ minWidth: `${getBlockWidth(remainingDays)}%` }}
                  >
                    +{remainingDays}d
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {/* Mutterschutz legend entries - only when mother has Wochengeld */}
          {motherHasWochengeld && (
            <>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-400" />
                <span>MS vor Geburt: {preBirthMutterschutzDays}d</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-600" />
                <span>MS nach Geburt: {postBirthMutterschutzDays}d</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary-500" />
            <span>
              {parent1Label}: {parent1Days}d
              {motherHasWochengeld && (
                <span className="text-gray-500">
                  {' '}({parent1DaysAfterBirth}d nach Geburt, {parent1TotalDays}d gesamt)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span>
              {parent2Label}: {parent2Days}d
            </span>
          </div>
          {totalOverlapDays > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{
                  background: `repeating-linear-gradient(
                    -45deg,
                    rgb(99 102 241),
                    rgb(99 102 241) 2px,
                    rgb(59 130 246) 2px,
                    rgb(59 130 246) 4px
                  )`,
                }}
              />
              <span>Überlappung: {totalOverlapDays}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Blocks list */}
      <div className="space-y-3">
        {blocks.map((block, index) => {
          const prevBlock = index > 0 ? blocks[index - 1] : null;
          // overlapOrGap: positive = overlap days, 0 = seamless, negative = gap days
          const overlapOrGap = prevBlock ? calculateOverlapOrGap(prevBlock, block) : 0;
          const overlap = overlapOrGap > 0 ? overlapOrGap : 0;
          const gap = overlapOrGap < 0 ? -overlapOrGap : 0;
          const hasInvalidOverlap = overlap > FLAT_RATE_CONFIG.overlapDaysAllowed;

          // Min start date for this block
          const minStartDate =
            index === 0
              ? (startDate ?? block.startDate)
              : (addDays(prevBlock!.startDate, 1) ?? block.startDate);

          // Max start date allows up to overlapDaysAllowed overlap with previous block
          const maxStartDate = prevBlock
            ? addDays(prevBlock.endDate, FLAT_RATE_CONFIG.overlapDaysAllowed)
            : undefined;

          return (
            <div key={index}>
              {/* Show gap/overlap indicator between blocks */}
              {prevBlock && (
                <div
                  className={`mb-2 flex items-center justify-center gap-2 rounded px-3 py-1.5 text-xs ${
                    hasInvalidOverlap
                      ? 'bg-red-100 text-red-700'
                      : overlap > 0
                        ? 'bg-amber-100 text-amber-700'
                        : gap > 0
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-green-100 text-green-700'
                  }`}
                >
                  {overlap > 0 ? (
                    <>
                      <span>↔ Überlappung: {overlap} Tage</span>
                      {hasInvalidOverlap && (
                        <span className="font-medium">
                          (max. {FLAT_RATE_CONFIG.overlapDaysAllowed} erlaubt)
                        </span>
                      )}
                    </>
                  ) : gap > 0 ? (
                    <span>⋯ Lücke: {gap} Tage</span>
                  ) : (
                    <span>→ Nahtloser Übergang</span>
                  )}
                </div>
              )}

              <div
                className={`rounded-lg border p-4 ${
                  editingBlock === index ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                } ${hasInvalidOverlap ? 'border-red-300' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded ${getParentColor(block.parent)}`} />
                    <span className="font-medium">
                      Block {index + 1}: {getParentLabel(block.parent)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Block entfernen"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Von</label>
                    {index === 0 ? (
                      <p className="font-medium">{formatDateGerman(block.startDate)}</p>
                    ) : (
                      <StartDateInput
                        value={block.startDate}
                        onChange={(startDate) => updateBlock(index, { startDate })}
                        minDate={minStartDate}
                        maxDate={maxStartDate ?? undefined}
                      />
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Bis</label>
                    <EndDateInput
                      value={block.endDate}
                      onChange={(endDate) => updateBlock(index, { endDate })}
                      minDate={
                        addDays(block.startDate, FLAT_RATE_CONFIG.minBlockDays - 1) ??
                        block.startDate
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Dauer</label>
                    <div className="flex items-center gap-2">
                      <DurationInput
                        value={block.durationDays}
                        onChange={(days) => updateBlock(index, { durationDays: days })}
                        min={FLAT_RATE_CONFIG.minBlockDays}
                        max={remainingDays + block.durationDays}
                      />
                      <span className="text-sm text-gray-500">Tage</span>
                    </div>
                  </div>
                </div>

                {block.durationDays < FLAT_RATE_CONFIG.minBlockDays && (
                  <p className="mt-2 text-sm text-red-600">
                    Mindestdauer: {FLAT_RATE_CONFIG.minBlockDays} Tage
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add block buttons */}
      {blocks.length < FLAT_RATE_CONFIG.maxBlocks && remainingDays > 0 && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => addBlock('parent1')}
            className="btn-secondary flex-1"
          >
            <span className="mr-2 inline-block h-3 w-3 rounded bg-primary-500" />
            Block für {parent1Label} hinzufügen
          </button>
          <button
            type="button"
            onClick={() => addBlock('parent2')}
            className="btn-secondary flex-1"
          >
            <span className="mr-2 inline-block h-3 w-3 rounded bg-blue-500" />
            Block für {parent2Label} hinzufügen
          </button>
        </div>
      )}

      {/* Warnings */}
      {blocks.length >= FLAT_RATE_CONFIG.maxBlocks && (
        <p className="text-sm text-amber-600">
          Maximale Anzahl von {FLAT_RATE_CONFIG.maxBlocks} Blöcken erreicht.
        </p>
      )}

      {isBothParents && parent2Days < minParent2Days && parent2Days > 0 && (
        <p className="text-sm text-amber-600">
          {parent2Label} muss mindestens {minParent2Days} Tage beziehen (aktuell: {parent2Days}).
        </p>
      )}

      {/* Quick setup buttons */}
      {blocks.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Schnellauswahl:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (!startDate) return;
                const endDate = addDays(startDate, maxDays - 1);
                if (!endDate) return;
                onChange([
                  {
                    parent: 'parent1',
                    startDate,
                    endDate,
                    durationDays: maxDays,
                  },
                ]);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Nur {parent1Label}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!startDate) return;
                const parent1Days = Math.floor(maxDays * 0.8);
                const parent2Days = maxDays - parent1Days;
                const midDate = addDays(startDate, parent1Days - 1);
                const endDate = addDays(startDate, maxDays - 1);
                if (!midDate || !endDate) return;
                onChange([
                  {
                    parent: 'parent1',
                    startDate,
                    endDate: midDate,
                    durationDays: parent1Days,
                  },
                  {
                    parent: 'parent2',
                    startDate: addDays(midDate, 1) ?? midDate,
                    endDate,
                    durationDays: parent2Days,
                  },
                ]);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              80/20 Aufteilung
            </button>
            <button
              type="button"
              onClick={() => {
                if (!startDate) return;
                const halfDays = Math.floor(maxDays / 2);
                const midDate = addDays(startDate, halfDays - 1);
                const endDate = addDays(startDate, maxDays - 1);
                if (!midDate || !endDate) return;
                onChange([
                  {
                    parent: 'parent1',
                    startDate,
                    endDate: midDate,
                    durationDays: halfDays,
                  },
                  {
                    parent: 'parent2',
                    startDate: addDays(midDate, 1) ?? midDate,
                    endDate,
                    durationDays: maxDays - halfDays,
                  },
                ]);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              50/50 Aufteilung
            </button>
          </div>
        </div>
      )}

      {/* Info about rules */}
      <div className="text-xs text-gray-500">
        <p>
          Regeln: Min. {FLAT_RATE_CONFIG.minBlockDays} Tage pro Block, max.{' '}
          {FLAT_RATE_CONFIG.maxBlocks} Blöcke, max. {FLAT_RATE_CONFIG.maxSwitches} Wechsel
        </p>
      </div>
    </div>
  );
}
