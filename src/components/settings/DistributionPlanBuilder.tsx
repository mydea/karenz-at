import { useState, useRef, useEffect } from 'react';
import type { DistributionBlock, ChildcareAllowanceModel, BirthCondition } from '@/types';
import { FLAT_RATE_CONFIG, INCOME_BASED_CONFIG } from '@/data/constants';
import { addDays, daysBetween, formatDateGerman, parseDateGerman, isValidDateString } from '@/utils/dates';
import { calculateMutterschutz } from '@/utils/calculations';

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

interface DistributionPlanBuilderProps {
  blocks: DistributionBlock[];
  onChange: (blocks: DistributionBlock[]) => void;
  model: ChildcareAllowanceModel;
  dueDate: string; // Expected/actual birth date
  birthConditions: BirthCondition[];
  isBothParents: boolean;
  parent1Name?: string;
  parent2Name?: string;
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
}: DistributionPlanBuilderProps) {
  // Calculate Mutterschutz period
  const mutterschutz = calculateMutterschutz(dueDate, birthConditions);
  const mutterschutzDays = mutterschutz.startDate && mutterschutz.endDate
    ? (daysBetween(mutterschutz.startDate, mutterschutz.endDate) ?? 0) + 1
    : 0;

  // KBG starts the day after Mutterschutz ends
  const startDate = mutterschutz.endDate ? addDays(mutterschutz.endDate, 1) : null;
  
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
    const firstBlockStart = currentBlocks[0].startDate;
    if (firstBlockStart === startDate) return;
    
    // Calculate the difference and shift all blocks
    const daysDiff = daysBetween(firstBlockStart, startDate);
    if (daysDiff === null || daysDiff === 0) return;
    
    // Shift all blocks by the difference
    const shiftedBlocks = currentBlocks.map(block => {
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
  
  // Use names if provided, otherwise fallback to default labels
  const parent1Label = parent1Name || 'Elternteil 1';
  const parent2Label = parent2Name || 'Elternteil 2';
  const [editingBlock, setEditingBlock] = useState<number | null>(null);

  // Get max duration based on model and whether both parents take leave
  const config = model.type === 'flatRate' ? FLAT_RATE_CONFIG : INCOME_BASED_CONFIG;
  const maxDays =
    model.type === 'flatRate'
      ? model.chosenDurationDays ?? (isBothParents ? config.maxDaysBothParents : config.maxDaysSingleParent)
      : isBothParents
        ? INCOME_BASED_CONFIG.maxDaysBothParents
        : INCOME_BASED_CONFIG.maxDaysSingleParent;

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
    const newStartDate = lastBlock
      ? addDays(lastBlock.endDate, 1) ?? startDate
      : startDate;

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

    // Update the target block
    const block = { ...newBlocks[index], ...updates };

    // Recalculate duration if dates changed
    if (updates.startDate || updates.endDate) {
      const days = daysBetween(block.startDate, block.endDate);
      if (days !== null) {
        block.durationDays = days + 1; // Include both start and end day
      }
    }

    // Recalculate end date if duration changed
    if (updates.durationDays && !updates.endDate) {
      const newEnd = addDays(block.startDate, updates.durationDays - 1);
      if (newEnd) {
        block.endDate = newEnd;
      }
    }

    newBlocks[index] = block;

    // Cascade changes to following blocks - adjust their start dates
    for (let i = index + 1; i < newBlocks.length; i++) {
      const prevBlock = newBlocks[i - 1];
      const currentBlock = newBlocks[i];
      const newStartDate = addDays(prevBlock.endDate, 1);

      if (newStartDate && newStartDate !== currentBlock.startDate) {
        const newEndDate = addDays(newStartDate, currentBlock.durationDays - 1);
        newBlocks[i] = {
          ...currentBlock,
          startDate: newStartDate,
          endDate: newEndDate ?? currentBlock.endDate,
        };
      }
    }

    onChange(newBlocks);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const getParentColor = (parent: 'parent1' | 'parent2') =>
    parent === 'parent1' ? 'bg-primary-500' : 'bg-blue-500';

  const getParentLabel = (parent: 'parent1' | 'parent2') =>
    parent === 'parent1' ? parent1Label : parent2Label;

  // Total timeline includes Mutterschutz + KBG
  const totalTimelineDays = mutterschutzDays + maxDays;
  
  // Calculate percentage for visual bar (relative to total timeline)
  const getBlockWidth = (days: number) => Math.max((days / totalTimelineDays) * 100, 3);

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Bezugsverteilung</h3>
        <p className="mt-1 text-sm text-gray-500">
          Planen Sie, wie der Bezug zwischen den Elternteilen aufgeteilt werden soll.
        </p>
      </div>

      {/* Mutterschutz info */}
      {mutterschutz.startDate && mutterschutz.endDate && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-purple-500" />
              <span className="text-sm font-medium text-purple-900">
                Mutterschutz (Wochengeld)
              </span>
            </div>
            <span className="text-sm text-purple-700">
              {formatDateGerman(mutterschutz.startDate)} – {formatDateGerman(mutterschutz.endDate)}
            </span>
          </div>
          <p className="mt-1 text-xs text-purple-600">
            {mutterschutzDays} Tage ({mutterschutz.weeksAfterBirth === 12 ? '8 + 12' : '8 + 8'} Wochen) · Danach beginnt das Kinderbetreuungsgeld
          </p>
        </div>
      )}

      {/* Visual timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">KBG-Dauer: {maxDays} Tage</span>
          <span className={remainingDays < 0 ? 'text-red-600' : 'text-gray-600'}>
            Noch verfügbar: {remainingDays} Tage
          </span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-12 overflow-hidden rounded-lg bg-gray-100">
          <div className="flex h-full">
            {/* Mutterschutz block */}
            {mutterschutzDays > 0 && (
              <div
                className="flex items-center justify-center bg-purple-500 text-xs font-medium text-white"
                style={{ width: `${getBlockWidth(mutterschutzDays)}%` }}
                title={`Mutterschutz: ${mutterschutzDays} Tage`}
              >
                <span className="truncate px-1">MS</span>
              </div>
            )}
            
            {/* KBG blocks */}
            {blocks.length === 0 && startDate ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                Noch keine KBG-Blöcke geplant
              </div>
            ) : (
              <>
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center justify-center text-xs font-medium text-white transition-all ${getParentColor(block.parent)} ${
                      editingBlock === index ? 'ring-2 ring-offset-1 ring-primary-400' : ''
                    }`}
                    style={{ width: `${getBlockWidth(block.durationDays)}%` }}
                    onClick={() => setEditingBlock(editingBlock === index ? null : index)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="truncate px-1">
                      {block.durationDays}d
                    </span>
                  </div>
                ))}
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
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-purple-500" />
            <span>Mutterschutz: {mutterschutzDays} Tage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary-500" />
            <span>{parent1Label}: {parent1Days} Tage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span>{parent2Label}: {parent2Days} Tage</span>
          </div>
        </div>
      </div>

      {/* Blocks list */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${
              editingBlock === index ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Von</label>
                <p className="font-medium">{formatDateGerman(block.startDate)}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Bis</label>
                <EndDateInput
                  value={block.endDate}
                  onChange={(endDate) => updateBlock(index, { endDate })}
                  minDate={addDays(block.startDate, FLAT_RATE_CONFIG.minBlockDays - 1) ?? block.startDate}
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
        ))}
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
            Block für {parent1Label}
          </button>
          <button
            type="button"
            onClick={() => addBlock('parent2')}
            className="btn-secondary flex-1"
          >
            <span className="mr-2 inline-block h-3 w-3 rounded bg-blue-500" />
            Block für {parent2Label}
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
                onChange([{
                  parent: 'parent1',
                  startDate,
                  endDate,
                  durationDays: maxDays,
                }]);
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
        <p>Regeln: Min. {FLAT_RATE_CONFIG.minBlockDays} Tage pro Block, max. {FLAT_RATE_CONFIG.maxBlocks} Blöcke, max. {FLAT_RATE_CONFIG.maxSwitches} Wechsel</p>
      </div>
    </div>
  );
}
