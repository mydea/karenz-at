/**
 * Category filter chips for FAQ.
 */

import type { FaqCategory, FaqCategoryInfo } from '@/data/faq';

interface FaqCategoryFilterProps {
  categories: FaqCategoryInfo[];
  selected: FaqCategory | null;
  onSelect: (category: FaqCategory | null) => void;
}

export function FaqCategoryFilter({
  categories,
  selected,
  onSelect,
}: FaqCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Alle
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selected === category.id
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="mr-1">{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );
}
