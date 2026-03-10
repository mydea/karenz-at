/**
 * Summary cards showing key calculator figures.
 */

import { Link } from 'react-router-dom';

interface MutterschutzInfo {
  durationDays: number;
  dailyWochengeld: number;
  totalWochengeld: number;
  hasWochengeldEntitlement: boolean;
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
      {/* Mutterschutz/Wochengeld Card - With entitlement */}
      {mutterschutz && mutterschutz.hasWochengeldEntitlement && mutterschutz.totalWochengeld > 0 && (
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

      {/* Mutterschutz Card - No entitlement warning */}
      {mutterschutz && !mutterschutz.hasWochengeldEntitlement && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="font-semibold text-amber-800">Kein Wochengeld-Anspruch</div>
              <p className="mt-1 text-sm text-amber-700">
                Ohne Erwerbstätigkeit oder Arbeitslosengeld-Bezug besteht kein Anspruch auf Wochengeld 
                während des Mutterschutzes ({mutterschutz.durationDays} Tage).
              </p>
              <p className="mt-2 text-sm text-amber-700">
                Das Kinderbetreuungsgeld beginnt erst nach der Geburt (nach Ende des Mutterschutzes).
              </p>
              <Link 
                to="/faq#wg-ohne-einkommen" 
                className="mt-2 inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                Mehr erfahren
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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
          <div className="mt-1 text-xs text-emerald-600">
            {mutterschutz?.hasWochengeldEntitlement ? 'Wochengeld + KBG + Boni' : 'KBG + Boni'}
          </div>
        </div>
      </div>
    </div>
  );
}
