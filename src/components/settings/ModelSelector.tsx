import type { ChildcareAllowanceModel, AllowanceType, ParentData } from '@/types';
import { RadioGroup, Slider } from '@/components/ui';
import { FLAT_RATE_CONFIG, INCOME_BASED_CONFIG } from '@/data/constants';

interface ModelSelectorProps {
  model: ChildcareAllowanceModel;
  onChange: (model: ChildcareAllowanceModel) => void;
  parent1: ParentData;
  parent2: ParentData;
  isBothParents: boolean;
}

export function ModelSelector({
  model,
  onChange,
  parent1,
  parent2,
  isBothParents,
}: ModelSelectorProps) {
  // Check eligibility for income-based model
  const isIncomeBasedEligible = parent1.hasWorked182Days || parent2.hasWorked182Days;

  // Calculate daily rate for flat-rate based on duration
  const calculateFlatRateDailyRate = (days: number): number => {
    const minDays = isBothParents
      ? FLAT_RATE_CONFIG.minDaysBothParents
      : FLAT_RATE_CONFIG.minDaysSingleParent;
    const maxDays = isBothParents
      ? FLAT_RATE_CONFIG.maxDaysBothParents
      : FLAT_RATE_CONFIG.maxDaysSingleParent;

    // Linear interpolation between min and max rates
    const ratio = (days - minDays) / (maxDays - minDays);
    return FLAT_RATE_CONFIG.dailyRateMax - ratio * (FLAT_RATE_CONFIG.dailyRateMax - FLAT_RATE_CONFIG.dailyRateMin);
  };

  // Get duration bounds based on whether both parents are involved
  const minDays = isBothParents
    ? FLAT_RATE_CONFIG.minDaysBothParents
    : FLAT_RATE_CONFIG.minDaysSingleParent;
  const maxDays = isBothParents
    ? FLAT_RATE_CONFIG.maxDaysBothParents
    : FLAT_RATE_CONFIG.maxDaysSingleParent;

  const currentDuration = model.chosenDurationDays ?? minDays;
  const dailyRate = calculateFlatRateDailyRate(currentDuration);
  const totalAmount = dailyRate * currentDuration;

  const formatDuration = (days: number): string => {
    const months = Math.round(days / 30.44);
    return `${days} Tage (~${months} Monate)`;
  };

  const handleTypeChange = (type: AllowanceType) => {
    onChange({
      type,
      chosenDurationDays: type === 'flatRate' ? currentDuration : undefined,
    });
  };

  const handleDurationChange = (days: number) => {
    onChange({
      ...model,
      chosenDurationDays: days,
    });
  };

  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Kinderbetreuungsgeld-Modell</h3>

      <RadioGroup
        name="allowanceType"
        value={model.type}
        onChange={handleTypeChange}
        options={[
          {
            value: 'flatRate' as AllowanceType,
            label: 'Pauschales KBG (Konto)',
            description: 'Flexible Bezugsdauer, fester Gesamtbetrag (~€15.000). Keine Beschäftigungsvoraussetzung.',
          },
          {
            value: 'incomeBased' as AllowanceType,
            label: 'Einkommensabhängiges KBG',
            description: '80% vom Nettoeinkommen (max. €80,12/Tag). Kürzere Bezugsdauer.',
            disabled: !isIncomeBasedEligible,
          },
        ]}
      />

      {!isIncomeBasedEligible && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            <strong>Hinweis:</strong> Für das einkommensabhängige Modell muss mindestens ein
            Elternteil 182 Tage durchgehend erwerbstätig gewesen sein.
          </p>
        </div>
      )}

      {/* Duration slider for flat-rate model */}
      {model.type === 'flatRate' && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">Bezugsdauer wählen</h4>
          
          <Slider
            value={currentDuration}
            onChange={handleDurationChange}
            min={minDays}
            max={maxDays}
            step={1}
            formatValue={formatDuration}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <p className="text-sm text-gray-500">Tagessatz</p>
              <p className="text-xl font-semibold text-primary-600">
                €{dailyRate.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <p className="text-sm text-gray-500">Gesamtbetrag</p>
              <p className="text-xl font-semibold text-primary-600">
                €{totalAmount.toLocaleString('de-AT', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Der Gesamtbetrag bleibt gleich – kürzere Bezugsdauer = höherer Tagessatz
          </p>
        </div>
      )}

      {/* Info for income-based model */}
      {model.type === 'incomeBased' && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">Einkommensabhängiges Modell</h4>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
              <span>
                Maximale Bezugsdauer: {isBothParents ? '426' : '365'} Tage
                ({isBothParents ? '~14' : '~12'} Monate)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
              <span>
                Tagessatz: 80% vom Nettoeinkommen (max. €{INCOME_BASED_CONFIG.dailyRateMax}/Tag)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
              <span>
                Zuverdienst max. €{INCOME_BASED_CONFIG.additionalIncomeLimit.toLocaleString('de-AT')}/Jahr
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
