/**
 * Monthly breakdown chart showing Wochengeld and KBG payments over time.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { MonthlyBreakdownItem } from '@/types';

interface MonthlyBreakdownChartProps {
  data: MonthlyBreakdownItem[];
  regularMonthlyIncome?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <div className="mb-2 font-medium text-gray-900">{label}</div>
      {payload.map((entry, index) => (
        entry.value > 0 && (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        )
      ))}
      {payload.length > 1 && payload.some(p => p.value > 0) && (
        <div className="mt-2 border-t border-gray-200 pt-2 text-sm font-semibold">
          Gesamt: {formatCurrency(total)}
        </div>
      )}
    </div>
  );
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function formatShortLabel(month: string): string {
  // month is in format "YYYY-MM"
  const [year, monthNum] = month.split('-');
  const monthIndex = parseInt(monthNum!, 10) - 1;
  const shortYear = year!.slice(2);
  return `${SHORT_MONTHS[monthIndex]} '${shortYear}`;
}

export function MonthlyBreakdownChart({
  data,
  regularMonthlyIncome,
}: MonthlyBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">
          Erstellen Sie einen Bezugsplan, um die monatliche Aufschlüsselung zu sehen
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalWochengeld = data.reduce((sum, d) => sum + d.wochengeldAmount, 0);
  const totalKbg = data.reduce((sum, d) => sum + d.kbgAmount, 0);
  const grandTotal = totalWochengeld + totalKbg;

  // Add short labels for x-axis
  const chartData = data.map((item) => ({
    ...item,
    shortLabel: formatShortLabel(item.month),
  }));

  // Determine if we need to skip labels (for many months)
  const labelInterval = data.length > 12 ? 1 : 0;

  return (
    <div className="space-y-4">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="shortLabel"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval={labelInterval}
            />
            <YAxis
              tickFormatter={(value) => `€${value}`}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={32}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px' }}
            />
            {regularMonthlyIncome && regularMonthlyIncome > 0 && (
              <ReferenceLine
                y={regularMonthlyIncome}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                label={{
                  value: `Netto: ${formatCurrency(regularMonthlyIncome)}`,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: '#6b7280',
                }}
              />
            )}
            <Bar
              dataKey="wochengeldAmount"
              name="Wochengeld"
              stackId="benefits"
              fill="#ec4899"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="kbgAmount"
              name="KBG"
              stackId="benefits"
              fill="#3b82f6"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 text-center text-sm sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-gray-500">Bezugsmonate</div>
          <div className="text-lg font-semibold text-gray-900">{data.length}</div>
        </div>
        <div className="rounded-lg bg-pink-50 p-3">
          <div className="text-pink-600">Wochengeld</div>
          <div className="text-lg font-semibold text-pink-700">
            {formatCurrency(totalWochengeld)}
          </div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-blue-600">KBG</div>
          <div className="text-lg font-semibold text-blue-700">
            {formatCurrency(totalKbg)}
          </div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <div className="text-emerald-600">Gesamt</div>
          <div className="text-lg font-semibold text-emerald-700">
            {formatCurrency(grandTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
