import type { ParentData } from '@/types';
import { FormField, CurrencyInput, Toggle } from '@/components/ui';
import { subtractDays, subtractWeeks, formatDateGerman } from '@/utils/dates';
import { MUTTERSCHUTZ_CONFIG } from '@/data/constants';

interface ParentSectionProps {
  label: string;
  data: ParentData;
  onChange: (data: ParentData) => void;
  dueDate?: string;
  errors?: Record<string, string>;
}

export function ParentSection({ label, data, onChange, dueDate, errors = {} }: ParentSectionProps) {
  // Calculate the cutoff date (182 days before birth)
  const cutoffDate = dueDate ? subtractDays(dueDate, 182) : null;

  // Calculate the reference period for income (3 months before Mutterschutz start)
  // Mutterschutz starts 8 weeks before due date
  const mutterschutzStart = dueDate
    ? subtractWeeks(dueDate, MUTTERSCHUTZ_CONFIG.weeksBeforeBirth)
    : null;

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
          placeholder="z.B. Maria"
        />
      </FormField>

      {/* Monthly Net Income */}
      <FormField
        label="Durchschnittliches monatliches Nettoeinkommen"
        hint={
          mutterschutzStart
            ? `Durchschnitt der 3 Monate vor Mutterschutzbeginn (vor ${formatDateGerman(mutterschutzStart)})`
            : 'Durchschnitt der 3 Monate vor Beginn des Mutterschutzes'
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
        {data.monthlyNetIncome === 0 && (
          <p className="mt-1 text-sm text-amber-600">
            Bei Einkommen 0 erhalten Sie den Mindesttagessatz (€41,14/Tag)
          </p>
        )}
      </FormField>

      {/* 182 days employment */}
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
    </div>
  );
}
