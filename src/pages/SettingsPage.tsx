import { useState } from 'react';
import { Link } from 'react-router-dom';
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
          isMother={true}
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
          isMother={false}
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
      {userData.dueDate && (
        <DistributionPlanBuilder
          blocks={userData.distributionPlan}
          onChange={updateDistributionPlan}
          model={userData.selectedModel}
          dueDate={userData.dueDate}
          birthConditions={userData.birthConditions}
          isBothParents={isBothParents}
          parent1Name={userData.parent1.name}
          parent2Name={userData.parent2.name}
          parent1Data={userData.parent1}
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

      {/* Success state with next steps */}
      {errors.length === 0 && userData.dueDate && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-5">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-primary-900">Alle erforderlichen Daten eingegeben</p>
          </div>
          
          <p className="mt-3 text-sm text-primary-800">
            Ihre Planung ist fertig! Entdecken Sie jetzt die nächsten Schritte:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/zeitplan"
              className="flex items-start gap-3 rounded-lg border border-primary-300 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="flex items-center gap-1 font-medium text-gray-900">
                  Zum Zeitplan
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Alle wichtigen Termine und Fristen auf einen Blick – von Mutterschutz bis Karenzende.
                </p>
              </div>
            </Link>

            <Link
              to="/rechner"
              className="flex items-start gap-3 rounded-lg border border-primary-300 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="flex items-center gap-1 font-medium text-gray-900">
                  Zum Rechner
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Berechnen Sie Ihr Wochengeld und Kinderbetreuungsgeld mit detaillierter Monatsübersicht.
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Auto-save indicator */}
      <p className="text-center text-xs text-gray-400">
        Ihre Daten werden automatisch in Ihrem Browser gespeichert
      </p>
    </div>
  );
}
