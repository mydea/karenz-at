/**
 * Summary cards showing key calculator figures.
 */

interface MutterschutzInfo {
  durationDays: number;
  dailyWochengeld: number;
  totalWochengeld: number;
}

interface SummaryCardsProps {
  mutterschutz?: MutterschutzInfo;
  dailyRate: number;
  monthlyRate: number;
  totalAmount: number;
  durationDays: number;
  partnershipBonus: number;
  multipleBirthSupplement: number;
  familienbonusYearly: number;
  grandTotal: number;
  modelType: 'flatRate' | 'incomeBased';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function formatDays(days: number): string {
  const weeks = Math.round(days / 7);
  if (days <= 100) {
    return `${days} Tage (~${weeks} Wo.)`;
  }
  const months = Math.round(days / 30);
  return `${days} Tage (~${months} Mo.)`;
}

export function SummaryCards({
  mutterschutz,
  dailyRate,
  monthlyRate,
  totalAmount,
  durationDays,
  partnershipBonus,
  multipleBirthSupplement,
  familienbonusYearly,
  grandTotal,
  modelType,
}: SummaryCardsProps) {
  const modelLabel = modelType === 'flatRate' 
    ? 'Pauschales KBG (Konto)' 
    : 'Einkommensabhängiges KBG';

  return (
    <div className="space-y-4">
      {/* Mutterschutz/Wochengeld Card */}
      {mutterschutz && mutterschutz.totalWochengeld > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white shadow-lg">
          <div className="mb-4 text-sm font-medium text-pink-100">Mutterschutz (Wochengeld)</div>
          <div className="mb-6 text-4xl font-bold">{formatCurrency(mutterschutz.totalWochengeld)}</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-pink-200">Tagessatz</div>
              <div className="font-semibold">{formatCurrency(mutterschutz.dailyWochengeld)}</div>
            </div>
            <div>
              <div className="text-pink-200">Monatlich</div>
              <div className="font-semibold">{formatCurrency(mutterschutz.dailyWochengeld * 30)}</div>
            </div>
            <div>
              <div className="text-pink-200">Dauer</div>
              <div className="font-semibold">{formatDays(mutterschutz.durationDays)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main KBG Card */}
      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="mb-4 text-sm font-medium text-blue-100">{modelLabel}</div>
        <div className="mb-6 text-4xl font-bold">{formatCurrency(totalAmount)}</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-blue-200">Tagessatz</div>
            <div className="font-semibold">{formatCurrency(dailyRate)}</div>
          </div>
          <div>
            <div className="text-blue-200">Monatlich</div>
            <div className="font-semibold">{formatCurrency(monthlyRate)}</div>
          </div>
          <div>
            <div className="text-blue-200">Bezugsdauer</div>
            <div className="font-semibold">{formatDays(durationDays)}</div>
          </div>
        </div>
      </div>

      {/* Additional Benefits Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Partnership Bonus */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 text-sm text-gray-500">Partnerschaftsbonus</div>
          <div className={`text-xl font-semibold ${partnershipBonus > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {partnershipBonus > 0 ? formatCurrency(partnershipBonus) : '—'}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {partnershipBonus > 0 ? '€500 pro Elternteil' : 'Nicht qualifiziert'}
          </div>
        </div>

        {/* Multiple Birth Supplement */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 text-sm text-gray-500">Mehrlingszuschlag</div>
          <div className={`text-xl font-semibold ${multipleBirthSupplement > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {multipleBirthSupplement > 0 ? formatCurrency(multipleBirthSupplement) : '—'}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {multipleBirthSupplement > 0 ? 'Zusätzlich pro Tag' : 'Nicht zutreffend'}
          </div>
        </div>

        {/* Familienbonus */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 text-sm text-gray-500">Familienbonus Plus</div>
          <div className="text-xl font-semibold text-blue-600">
            {formatCurrency(familienbonusYearly)}
          </div>
          <div className="mt-1 text-xs text-gray-400">Pro Jahr (Steuerbonus)</div>
        </div>

        {/* Grand Total */}
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="mb-1 text-sm font-medium text-emerald-700">Gesamtleistung</div>
          <div className="text-xl font-bold text-emerald-800">
            {formatCurrency(grandTotal)}
          </div>
          <div className="mt-1 text-xs text-emerald-600">Wochengeld + KBG + Boni</div>
        </div>
      </div>
    </div>
  );
}
