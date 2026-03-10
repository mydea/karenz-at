/**
 * Search input for FAQ.
 */

interface FaqSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export function FaqSearch({ value, onChange, resultCount }: FaqSearchProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Suchen Sie nach Fragen oder Stichworten..."
        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      {value && resultCount !== undefined && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          <span className="text-sm text-gray-500">
            {resultCount} {resultCount === 1 ? 'Ergebnis' : 'Ergebnisse'}
          </span>
        </div>
      )}
    </div>
  );
}
