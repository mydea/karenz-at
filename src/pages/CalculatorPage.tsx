/**
 * Calculator page for KBG benefit calculations.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';
import {
  SummaryCards,
  ModelComparison,
  MonthlyBreakdownChart,
  ParentSplitChart,
} from '@/components/calculator';
import {
  calculateFullResults,
  compareBothModels,
  calculatePartnershipBonus,
} from '@/utils/calculations';

export default function CalculatorPage() {
  const { userData, updateSelectedModel, isBothParents, isDataComplete } = useUserData();

  // Calculate comparison between models
  const comparison = useMemo(() => {
    const durationDays =
      userData.selectedModel.chosenDurationDays ||
      userData.distributionPlan.reduce((sum, b) => sum + b.durationDays, 0) ||
      456;

    return compareBothModels(
      userData.parent1,
      userData.parent2,
      durationDays,
      isBothParents
    );
  }, [userData.parent1, userData.parent2, userData.selectedModel, userData.distributionPlan, isBothParents]);

  // Calculate full results
  const results = useMemo(() => {
    if (userData.distributionPlan.length === 0 || !userData.dueDate) {
      return null;
    }

    return calculateFullResults(
      userData.dueDate,
      userData.parent1,
      userData.parent2,
      userData.selectedModel,
      userData.distributionPlan,
      userData.birthConditions
    );
  }, [userData]);

  // Check partnership bonus eligibility
  const partnershipBonusEligible = useMemo(() => {
    return calculatePartnershipBonus(userData.distributionPlan) > 0;
  }, [userData.distributionPlan]);

  // Handle model selection
  const handleSelectModel = (model: 'flatRate' | 'incomeBased') => {
    updateSelectedModel({
      ...userData.selectedModel,
      type: model,
    });
  };

  // Empty state - no data
  if (!isDataComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechner</h1>
          <p className="mt-1 text-gray-600">
            Berechnen Sie Ihr Kinderbetreuungsgeld für verschiedene Modelle.
          </p>
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Daten erforderlich
          </h3>
          <p className="mt-2 text-gray-500">
            Bitte geben Sie zuerst Ihre Daten in den Einstellungen ein, um die
            Berechnung durchzuführen.
          </p>
          <Link
            to="/einstellungen"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Zu den Einstellungen
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rechner</h1>
        <p className="mt-1 text-gray-600">
          Berechnen Sie Ihr Kinderbetreuungsgeld und vergleichen Sie die Modelle.
        </p>
      </div>

      {/* Model Comparison Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Modellvergleich
        </h2>
        <ModelComparison
          comparison={comparison}
          selectedModel={userData.selectedModel.type}
          onSelectModel={handleSelectModel}
        />
      </section>

      {/* Results Section */}
      {results ? (
        <>
          {/* Summary Cards */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Ihre Leistungen
            </h2>
            <SummaryCards
              mutterschutz={{
                durationDays: results.mutterschutz.durationDays,
                dailyWochengeld: results.mutterschutz.dailyWochengeld,
                totalWochengeld: results.mutterschutz.totalWochengeld,
              }}
              dailyRate={results.selectedModelResults.dailyRate}
              monthlyRate={results.selectedModelResults.monthlyRate}
              totalAmount={results.selectedModelResults.totalAmount}
              durationDays={results.selectedModelResults.durationDays}
              partnershipBonus={results.partnershipBonus}
              multipleBirthSupplement={results.multipleBirthSupplement}
              familienbonusYearly={results.familienbonusYearly}
              grandTotal={results.grandTotal}
              modelType={userData.selectedModel.type}
            />
          </section>

          {/* Parent Split */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Aufteilung zwischen Elternteilen
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <ParentSplitChart
                parent1Days={results.parentBreakdown.parent1.days}
                parent1Amount={results.parentBreakdown.parent1.amount}
                parent2Days={results.parentBreakdown.parent2.days}
                parent2Amount={results.parentBreakdown.parent2.amount}
                parent1Name={userData.parent1.name || 'Elternteil 1'}
                parent2Name={userData.parent2.name || 'Elternteil 2'}
                partnershipBonusEligible={partnershipBonusEligible}
              />
            </div>
          </section>

          {/* Monthly Breakdown Chart */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Monatliche Zahlungen
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <MonthlyBreakdownChart
                data={results.monthlyBreakdown}
                regularMonthlyIncome={results.incomeComparison.regularMonthlyIncome}
              />
            </div>
          </section>
        </>
      ) : (
        /* No distribution plan yet */
        <section>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                <h3 className="font-medium text-amber-800">
                  Bezugsplan erforderlich
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Erstellen Sie in den Einstellungen einen Bezugsplan, um die
                  detaillierte Berechnung und monatliche Aufschlüsselung zu sehen.
                </p>
                <Link
                  to="/einstellungen"
                  className="mt-3 inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
                >
                  Bezugsplan erstellen
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Still show summary based on model comparison */}
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Voraussichtliche Leistungen (geschätzt)
            </h2>
            <SummaryCards
              dailyRate={
                userData.selectedModel.type === 'flatRate'
                  ? comparison.flatRate.dailyRate
                  : comparison.incomeBased.dailyRate
              }
              monthlyRate={
                userData.selectedModel.type === 'flatRate'
                  ? comparison.flatRate.monthlyRate
                  : comparison.incomeBased.monthlyRate
              }
              totalAmount={
                userData.selectedModel.type === 'flatRate'
                  ? comparison.flatRate.totalAmount
                  : comparison.incomeBased.totalAmount
              }
              durationDays={
                userData.selectedModel.type === 'flatRate'
                  ? comparison.flatRate.durationDays
                  : comparison.incomeBased.durationDays
              }
              partnershipBonus={0}
              multipleBirthSupplement={0}
              familienbonusYearly={2000}
              grandTotal={
                userData.selectedModel.type === 'flatRate'
                  ? comparison.flatRate.totalAmount
                  : comparison.incomeBased.totalAmount
              }
              modelType={userData.selectedModel.type}
            />
          </div>
        </section>
      )}

      {/* Additional Info */}
      <section className="rounded-lg bg-gray-50 p-6">
        <h3 className="font-medium text-gray-900">Wichtige Hinweise</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>
              Die Berechnung dient als Orientierung. Die tatsächlichen Beträge können abweichen.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>
              Das Kinderbetreuungsgeld ist steuerfrei, beeinflusst aber die Steuerprogression.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>
              Der Familienbonus Plus ist ein Steuerabsetzbetrag und erfordert ausreichende Steuerlast.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>
              Zuverdienstgrenzen: €18.000/Jahr (pauschales KBG) bzw. €8.600/Jahr (einkommensabhängiges KBG).
            </span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          Für verbindliche Auskünfte wenden Sie sich bitte an die ÖGK oder Ihre zuständige Krankenkasse.
        </p>
      </section>
    </div>
  );
}
