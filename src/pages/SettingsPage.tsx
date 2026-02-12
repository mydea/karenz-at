import { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { FormField, DateInput } from '@/components/ui';
import {
  ParentSection,
  ModelSelector,
  BirthConditionsSelector,
  DistributionPlanBuilder,
} from '@/components/settings';
import { validateUserData } from '@/utils/validation';
import { formatDateGerman } from '@/utils/dates';
import { calculateKbgStartDate } from '@/utils/calculations';

export default function SettingsPage() {
  const {
    userData,
    updateDueDate,
    updateParent1,
    updateParent2,
    updateSelectedModel,
    updateDistributionPlan,
    updateBirthConditions,
    resetData,
    isBothParents,
  } = useUserData();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calculate KBG start date (day after Mutterschutz ends)
  const kbgStartDate = userData.dueDate
    ? calculateKbgStartDate(userData.dueDate, userData.birthConditions)
    : null;

  // Validate on render for real-time feedback
  const errors = validateUserData(userData);
  const errorsByField = errors.reduce(
    (acc, err) => {
      acc[err.field] = err.message;
      return acc;
    },
    {} as Record<string, string>
  );

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
          <p className="mt-1 text-gray-600">
            Geben Sie Ihre persönlichen Daten ein, um Berechnungen und Zeitpläne zu erstellen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="btn-secondary text-sm"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Möchten Sie wirklich alle Daten löschen? Dies kann nicht rückgängig gemacht werden.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Ja, löschen
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Due date */}
      <div className="card">
        <FormField
          label="Errechneter Geburtstermin / Geburtsdatum"
          htmlFor="dueDate"
          required
          error={errorsByField['dueDate']}
          hint="Bei bereits geborenen Kindern das tatsächliche Geburtsdatum eingeben"
        >
          <DateInput
            id="dueDate"
            value={userData.dueDate}
            onChange={updateDueDate}
            placeholder="TT.MM.JJJJ"
          />
        </FormField>

        {userData.dueDate && !errorsByField['dueDate'] && (
          <p className="mt-2 text-sm text-gray-500">
            Geburtstermin: {formatDateGerman(userData.dueDate)}
          </p>
        )}
      </div>

      {/* Parent sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ParentSection
          label="Elternteil 1 (Mutter)"
          data={userData.parent1}
          onChange={updateParent1}
          dueDate={userData.dueDate}
          errors={Object.fromEntries(
            Object.entries(errorsByField)
              .filter(([key]) => key.startsWith('Elternteil 1'))
              .map(([key, value]) => [key.replace('Elternteil 1.', ''), value])
          )}
        />
        <ParentSection
          label="Elternteil 2 (Vater/Partner:in)"
          data={userData.parent2}
          onChange={updateParent2}
          dueDate={userData.dueDate}
          errors={Object.fromEntries(
            Object.entries(errorsByField)
              .filter(([key]) => key.startsWith('Elternteil 2'))
              .map(([key, value]) => [key.replace('Elternteil 2.', ''), value])
          )}
        />
      </div>

      {/* Birth conditions */}
      <BirthConditionsSelector
        values={userData.birthConditions}
        onChange={updateBirthConditions}
      />

      {/* Model selector */}
      <ModelSelector
        model={userData.selectedModel}
        onChange={updateSelectedModel}
        parent1={userData.parent1}
        parent2={userData.parent2}
        isBothParents={isBothParents}
      />

      {/* Distribution plan builder */}
      {kbgStartDate && (
        <DistributionPlanBuilder
          blocks={userData.distributionPlan}
          onChange={updateDistributionPlan}
          model={userData.selectedModel}
          startDate={kbgStartDate}
          isBothParents={isBothParents}
          parent1Name={userData.parent1.name}
          parent2Name={userData.parent2.name}
        />
      )}

      {/* Validation summary */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-medium text-amber-900">Noch auszufüllen:</h3>
          <ul className="mt-2 space-y-1">
            {errors.slice(0, 5).map((error, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                {error.message}
              </li>
            ))}
            {errors.length > 5 && (
              <li className="text-sm text-amber-700">... und {errors.length - 5} weitere</li>
            )}
          </ul>
        </div>
      )}

      {/* Success state */}
      {errors.length === 0 && userData.dueDate && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-900">
            ✓ Alle erforderlichen Daten eingegeben
          </p>
          <p className="mt-1 text-sm text-green-700">
            Sie können jetzt den Zeitplan und Rechner nutzen.
          </p>
        </div>
      )}

      {/* Auto-save indicator */}
      <p className="text-center text-xs text-gray-400">
        Ihre Daten werden automatisch in Ihrem Browser gespeichert
      </p>
    </div>
  );
}
