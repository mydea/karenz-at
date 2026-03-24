/**
 * Side-by-side comparison of flat-rate vs income-based models.
 */

import type { ModelComparison as ModelComparisonType } from '@/types';

interface ModelComparisonProps {
  comparison: ModelComparisonType;
  selectedModel: 'flatRate' | 'incomeBased';
  onSelectModel?: (model: 'flatRate' | 'incomeBased') => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function formatDays(days: number): string {
  const months = Math.round(days / 30);
  return `${days} Tage (~${months} Mo.)`;
}

const REASON_MESSAGES: Record<string, string> = {
  notEligibleForIncomeBased: 'Einkommensabhängiges Modell nicht verfügbar (182 Tage Voraussetzung nicht erfüllt)',
  higherTotalIncomeBased: 'Das einkommensabhängige Modell ergibt bei Ihrem Einkommen mehr Geld',
  higherTotalFlatRate: 'Das pauschale Modell ist bei Ihrer gewählten Bezugsdauer vorteilhafter',
  longerDurationFlatRate: 'Das pauschale Modell ermöglicht eine längere Bezugsdauer',
  similarAmounts: 'Beide Modelle ergeben ähnliche Beträge – wählen Sie nach Präferenz',
};

export function ModelComparison({
  comparison,
  selectedModel,
  onSelectModel,
}: ModelComparisonProps) {
  const { flatRate, incomeBased, recommendation, reasonKey } = comparison;

  return (
    <div className="space-y-4">
      {/* Recommendation Banner */}
      <div className={`rounded-lg p-4 ${
        recommendation === 'flatRate' 
          ? 'bg-amber-50 border border-amber-200' 
          : recommendation === 'incomeBased'
            ? 'bg-primary-50 border border-primary-200'
            : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-full p-1 ${
            recommendation === 'flatRate' 
              ? 'bg-amber-100 text-amber-600' 
              : recommendation === 'incomeBased'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600'
          }`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {recommendation === 'flatRate' && 'Empfehlung: Pauschales KBG'}
              {recommendation === 'incomeBased' && 'Empfehlung: Einkommensabhängiges KBG'}
              {recommendation === 'either' && 'Beide Modelle sind vergleichbar'}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {REASON_MESSAGES[reasonKey] || reasonKey}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Flat Rate Card */}
        <div 
          className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
            selectedModel === 'flatRate'
              ? 'border-amber-400 bg-amber-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/50'
          }`}
          onClick={() => onSelectModel?.('flatRate')}
        >
          {recommendation === 'flatRate' && (
            <div className="absolute -top-3 right-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
              Empfohlen
            </div>
          )}
          
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Pauschales KBG (Konto)</h3>
            {selectedModel === 'flatRate' && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">Gewählt</span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Tagessatz</span>
              <span className="font-semibold">{formatCurrency(flatRate.dailyRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monatlich</span>
              <span className="font-semibold">{formatCurrency(flatRate.monthlyRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bezugsdauer</span>
              <span className="font-semibold">{formatDays(flatRate.durationDays)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Gesamtbetrag</span>
                <span className="text-lg font-bold text-amber-600">
                  {formatCurrency(flatRate.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            ✓ Flexible Bezugsdauer wählbar<br />
            ✓ Keine Beschäftigungsvoraussetzung<br />
            ✓ Höhere Zuverdienstgrenze (€18.000/Jahr)
          </div>
        </div>

        {/* Income-Based Card */}
        <div 
          className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
            !incomeBased.eligible 
              ? 'border-gray-200 bg-gray-50 opacity-60'
              : selectedModel === 'incomeBased'
                ? 'border-primary-400 bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
          }`}
          onClick={() => incomeBased.eligible && onSelectModel?.('incomeBased')}
        >
          {recommendation === 'incomeBased' && incomeBased.eligible && (
            <div className="absolute -top-3 right-4 rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">
              Empfohlen
            </div>
          )}
          
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Einkommensabhängiges KBG</h3>
            {selectedModel === 'incomeBased' && (
              <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">Gewählt</span>
            )}
            {!incomeBased.eligible && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                Nicht verfügbar
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Tagessatz</span>
              <span className="font-semibold">{formatCurrency(incomeBased.dailyRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monatlich</span>
              <span className="font-semibold">{formatCurrency(incomeBased.monthlyRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bezugsdauer</span>
              <span className="font-semibold">{formatDays(incomeBased.durationDays)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Gesamtbetrag</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(incomeBased.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            {incomeBased.eligible ? (
              <>
                ✓ 80% des Einkommens<br />
                ✓ Höherer Tagessatz bei gutem Einkommen<br />
                ✗ Kürzere Bezugsdauer (max. 14 Monate)
              </>
            ) : (
              <>
                ✗ 182 Tage Beschäftigung vor Geburt erforderlich<br />
                Mindestens ein Elternteil muss die Voraussetzung erfüllen
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
