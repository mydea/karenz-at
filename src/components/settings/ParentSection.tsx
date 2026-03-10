import type { ParentData, EmploymentStatus } from '@/types';
import { FormField, CurrencyInput, Toggle } from '@/components/ui';
import { subtractDays, subtractWeeks, formatDateGerman } from '@/utils/dates';
import { MUTTERSCHUTZ_CONFIG, WOCHENGELD_CONFIG } from '@/data/constants';

interface ParentSectionProps {
  label: string;
  data: ParentData;
  onChange: (data: ParentData) => void;
  dueDate?: string;
  errors?: Record<string, string>;
  isMother?: boolean;
}

const EMPLOYMENT_STATUS_OPTIONS: { value: EmploymentStatus; label: string; description: string }[] = [
  {
    value: 'employed',
    label: 'Angestellt / Selbstständig',
    description: 'Wochengeld basiert auf Ihrem Nettoeinkommen',
  },
  {
    value: 'unemployed',
    label: 'Arbeitslosengeld/Notstandshilfe',
    description: 'Wochengeld = 180% des Arbeitslosengeldes',
  },
  {
    value: 'marginallyEmployed',
    label: 'Geringfügig beschäftigt (mit Selbstversicherung)',
    description: `Mindestwochengeld €${WOCHENGELD_CONFIG.minimumDailyRate}/Tag`,
  },
  {
    value: 'notEmployed',
    label: 'Nicht erwerbstätig / Hausfrau',
    description: 'Kein Anspruch auf Wochengeld',
  },
];

export function ParentSection({ label, data, onChange, dueDate, errors = {}, isMother = false }: ParentSectionProps) {
  const cutoffDate = dueDate ? subtractDays(dueDate, 182) : null;
  const mutterschutzStart = dueDate
    ? subtractWeeks(dueDate, MUTTERSCHUTZ_CONFIG.weeksBeforeBirth)
    : null;

  const employmentStatus = data.employmentStatus || 'employed';
  const showIncomeField = employmentStatus === 'employed';
  const showUnemploymentBenefit = employmentStatus === 'unemployed';

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>

      {/* Name (optional) */}
      <FormField label="Name" hint="Optional, nur für Ihre Übersicht">
        <input
          type="text"
          value={data.name ?? ''}
          onChange={(e) => onChange({ ...data, name: e.target.value || undefined })}
          className="input"
          placeholder={isMother ? 'z.B. Maria' : 'z.B. Thomas'}
        />
      </FormField>

      {/* Employment Status (only for mother/parent1) */}
      {isMother && (
        <FormField
          label="Beschäftigungsstatus"
          hint="Bestimmt Ihren Wochengeld-Anspruch während des Mutterschutzes"
        >
          <div className="space-y-2">
            {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  employmentStatus === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="employmentStatus"
                  value={option.value}
                  checked={employmentStatus === option.value}
                  onChange={() => onChange({ ...data, employmentStatus: option.value })}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </FormField>
      )}

      {/* No Wochengeld Warning */}
      {isMother && employmentStatus === 'notEmployed' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-800">Kein Wochengeld-Anspruch</p>
              <p className="mt-1 text-sm text-amber-700">
                Ohne Erwerbstätigkeit oder Arbeitslosengeld-Bezug besteht kein Anspruch auf Wochengeld. 
                Das Kinderbetreuungsgeld (pauschal) können Sie trotzdem ab der Geburt beziehen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Net Income - only for employed */}
      {showIncomeField && (
        <FormField
          label={isMother ? 'Durchschnittliches monatliches Nettoeinkommen' : 'Monatliches Nettoeinkommen'}
          hint={
            isMother && mutterschutzStart
              ? `Durchschnitt der 3 Monate vor Mutterschutzbeginn (vor ${formatDateGerman(mutterschutzStart)})`
              : 'Für die Berechnung des einkommensabhängigen KBG'
          }
        >
          <CurrencyInput
            value={data.monthlyNetIncome}
            onChange={(value) => onChange({ ...data, monthlyNetIncome: value })}
            placeholder="2.200"
          />
          {errors['monthlyNetIncome'] && (
            <p className="mt-1 text-sm text-red-600">{errors['monthlyNetIncome']}</p>
          )}
        </FormField>
      )}

      {/* Daily Unemployment Benefit - only for unemployed */}
      {showUnemploymentBenefit && (
        <FormField
          label="Tägliches Arbeitslosengeld"
          hint="Wird mit 180% für das Wochengeld berechnet"
        >
          <CurrencyInput
            value={data.dailyUnemploymentBenefit || 0}
            onChange={(value) => onChange({ ...data, dailyUnemploymentBenefit: value })}
            placeholder="35"
          />
          {data.dailyUnemploymentBenefit && data.dailyUnemploymentBenefit > 0 && (
            <p className="mt-1 text-sm text-blue-600">
              → Wochengeld: ca. €{(data.dailyUnemploymentBenefit * WOCHENGELD_CONFIG.unemployedMultiplier).toFixed(2)}/Tag
            </p>
          )}
        </FormField>
      )}

      {/* Minimum Wochengeld Info - for marginally employed */}
      {isMother && employmentStatus === 'marginallyEmployed' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Mindestwochengeld:</strong> €{WOCHENGELD_CONFIG.minimumDailyRate}/Tag 
            (ca. €{(WOCHENGELD_CONFIG.minimumDailyRate * 30).toFixed(0)}/Monat)
          </p>
          <p className="mt-1 text-sm text-blue-700">
            Voraussetzung: Selbstversicherung in der Kranken- und Pensionsversicherung
          </p>
        </div>
      )}

      {/* 182 days employment - only relevant for income-based KBG */}
      {(employmentStatus === 'employed' || !isMother) && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Toggle
            checked={data.hasWorked182Days}
            onChange={(checked) => onChange({ ...data, hasWorked182Days: checked })}
            label="182 Tage durchgehend erwerbstätig vor Geburt?"
          />
          <p className="mt-2 text-sm text-gray-500">
            Erforderlich für das einkommensabhängige Kinderbetreuungsgeld
          </p>
          {cutoffDate && (
            <p className="mt-1 text-sm text-blue-600">
              → Beschäftigung muss spätestens am <strong>{formatDateGerman(cutoffDate)}</strong> begonnen haben
            </p>
          )}
        </div>
      )}
    </div>
  );
}
