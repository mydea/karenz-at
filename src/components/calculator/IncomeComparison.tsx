/**
 * Component showing comparison between regular income and benefits.
 */

interface IncomeComparisonProps {
  regularMonthlyIncome: number;
  averageBenefitMonthly: number;
  differencePercent: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function IncomeComparison({
  regularMonthlyIncome,
  averageBenefitMonthly,
  differencePercent,
}: IncomeComparisonProps) {
  if (regularMonthlyIncome <= 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-500">
          Geben Sie ein monatliches Einkommen ein, um den Vergleich zu sehen
        </p>
      </div>
    );
  }

  const isPositive = differencePercent >= 0;
  const absPercent = Math.abs(differencePercent);

  return (
    <div className="space-y-4">
      {/* Comparison Bars */}
      <div className="space-y-3">
        {/* Regular Income */}
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">Reguläres Nettoeinkommen</span>
            <span className="font-semibold">{formatCurrency(regularMonthlyIncome)}</span>
          </div>
          <div className="h-6 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gray-500"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Average Benefit */}
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">Ø Leistung/Monat (Wochengeld + KBG)</span>
            <span className="font-semibold">{formatCurrency(averageBenefitMonthly)}</span>
          </div>
          <div className="h-6 w-full rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${Math.min((averageBenefitMonthly / regularMonthlyIncome) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Difference Summary */}
      <div className={`rounded-lg p-4 ${
        isPositive ? 'bg-green-50' : 'bg-amber-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Monatliche Differenz</div>
            <div className={`text-lg font-semibold ${
              isPositive ? 'text-green-700' : 'text-amber-700'
            }`}>
              {isPositive ? '+' : ''}{formatCurrency(averageBenefitMonthly - regularMonthlyIncome)}
            </div>
          </div>
          <div className={`rounded-full px-4 py-2 ${
            isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            <span className="text-xl font-bold">
              {isPositive ? '+' : '-'}{absPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <p className="text-xs text-gray-500">
        <span className="font-medium">Hinweis:</span> Wochengeld und KBG sind steuerfrei und werden 
        hier mit Ihrem Nettoeinkommen verglichen.
      </p>
    </div>
  );
}
