import { useState } from 'react';
import type { ParentData } from '@/types';
import { FormField, CurrencyInput, Toggle } from '@/components/ui';
import { subtractDays, formatDateGerman } from '@/utils/dates';

interface ParentSectionProps {
  label: string;
  data: ParentData;
  onChange: (data: ParentData) => void;
  dueDate?: string;
  errors?: Record<string, string>;
}

export function ParentSection({ label, data, onChange, dueDate, errors = {} }: ParentSectionProps) {
  const [salaryMode, setSalaryMode] = useState<'monthly' | 'yearly'>('monthly');

  const handleSalaryChange = (value: number) => {
    // Always store as monthly
    const monthly = salaryMode === 'yearly' ? value / 12 : value;
    onChange({ ...data, monthlySalary: monthly });
  };

  const displaySalary = salaryMode === 'yearly' ? data.monthlySalary * 12 : data.monthlySalary;

  // Calculate the cutoff date (182 days before birth)
  const cutoffDate = dueDate ? subtractDays(dueDate, 182) : null;

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

      {/* Salary with monthly/yearly toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label mb-0">Bruttogehalt</span>
          <div className="flex rounded-lg border border-gray-200 text-sm">
            <button
              type="button"
              onClick={() => setSalaryMode('monthly')}
              className={`px-3 py-1 transition-colors ${
                salaryMode === 'monthly'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Monatlich
            </button>
            <button
              type="button"
              onClick={() => setSalaryMode('yearly')}
              className={`px-3 py-1 transition-colors ${
                salaryMode === 'yearly'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Jährlich
            </button>
          </div>
        </div>
        <CurrencyInput
          value={displaySalary}
          onChange={handleSalaryChange}
          placeholder={salaryMode === 'monthly' ? '3.000' : '36.000'}
        />
        {errors['monthlySalary'] && (
          <p className="text-sm text-red-600">{errors['monthlySalary']}</p>
        )}
        {data.monthlySalary === 0 && (
          <p className="text-sm text-amber-600">
            Bei Einkommen 0 erhalten Sie den Mindesttagessatz
          </p>
        )}
      </div>

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
