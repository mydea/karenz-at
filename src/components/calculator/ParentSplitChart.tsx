/**
 * Visual representation of how KBG is split between parents.
 */

interface ParentSplitChartProps {
  parent1Days: number;
  parent1Amount: number;
  parent2Days: number;
  parent2Amount: number;
  parent1Name?: string;
  parent2Name?: string;
  partnershipBonusEligible: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function ParentSplitChart({
  parent1Days,
  parent1Amount,
  parent2Days,
  parent2Amount,
  parent1Name = 'Elternteil 1',
  parent2Name = 'Elternteil 2',
  partnershipBonusEligible,
}: ParentSplitChartProps) {
  const totalDays = parent1Days + parent2Days;
  const parent1Percent = totalDays > 0 ? (parent1Days / totalDays) * 100 : 0;
  const parent2Percent = totalDays > 0 ? (parent2Days / totalDays) * 100 : 0;

  if (totalDays === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">
          Keine Bezugsblöcke definiert
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Bar */}
      <div className="space-y-2">
        <div className="flex h-12 overflow-hidden rounded-lg">
          {parent1Percent > 0 && (
            <div
              className="flex items-center justify-center bg-blue-500 text-white transition-all"
              style={{ width: `${parent1Percent}%` }}
            >
              {parent1Percent >= 15 && (
                <span className="text-sm font-medium">{Math.round(parent1Percent)}%</span>
              )}
            </div>
          )}
          {parent2Percent > 0 && (
            <div
              className="flex items-center justify-center bg-purple-500 text-white transition-all"
              style={{ width: `${parent2Percent}%` }}
            >
              {parent2Percent >= 15 && (
                <span className="text-sm font-medium">{Math.round(parent2Percent)}%</span>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-gray-600">{parent1Name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-purple-500" />
            <span className="text-gray-600">{parent2Name}</span>
          </div>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Parent 1 */}
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="font-medium text-blue-900">{parent1Name}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Bezugstage</span>
              <span className="font-semibold text-blue-900">{parent1Days} Tage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Monate</span>
              <span className="font-semibold text-blue-900">~{Math.round(parent1Days / 30)} Mo.</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="font-medium text-blue-700">KBG Betrag</span>
              <span className="font-bold text-blue-900">{formatCurrency(parent1Amount)}</span>
            </div>
          </div>
        </div>

        {/* Parent 2 */}
        <div className={`rounded-lg border-2 p-4 ${
          parent2Days > 0 
            ? 'border-purple-200 bg-purple-50' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="mb-3 flex items-center gap-2">
            <div className={`h-3 w-3 rounded ${parent2Days > 0 ? 'bg-purple-500' : 'bg-gray-400'}`} />
            <span className={`font-medium ${parent2Days > 0 ? 'text-purple-900' : 'text-gray-600'}`}>
              {parent2Name}
            </span>
          </div>
          {parent2Days > 0 ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Bezugstage</span>
                <span className="font-semibold text-purple-900">{parent2Days} Tage</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Monate</span>
                <span className="font-semibold text-purple-900">~{Math.round(parent2Days / 30)} Mo.</span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-2">
                <span className="font-medium text-purple-700">KBG Betrag</span>
                <span className="font-bold text-purple-900">{formatCurrency(parent2Amount)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Kein Bezug geplant. Fügen Sie Bezugsblöcke für den zweiten Elternteil hinzu,
              um den Partnerschaftsbonus zu erhalten.
            </p>
          )}
        </div>
      </div>

      {/* Partnership Bonus Indicator */}
      <div className={`rounded-lg p-4 text-center ${
        partnershipBonusEligible 
          ? 'bg-primary-50 border border-primary-200' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center justify-center gap-2">
          {partnershipBonusEligible ? (
            <>
              <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-primary-800">
                Partnerschaftsbonus: €1.000 (€500 pro Elternteil)
              </span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">
                Partnerschaftsbonus: Beide Elternteile müssen je 124 Tage beziehen
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
