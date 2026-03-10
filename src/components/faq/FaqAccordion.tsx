/**
 * Accordion component for FAQ items.
 */

import { useState, useEffect } from 'react';
import type { FaqItem } from '@/data/faq';
import { getFaqById } from '@/data/faq';

interface FaqAccordionProps {
  item: FaqItem;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (id: string, isOpen: boolean) => void;
  onRelatedClick?: (id: string) => void;
}

export function FaqAccordion({
  item,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  onRelatedClick,
}: FaqAccordionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  // Sync with controlled prop
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setInternalIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setInternalIsOpen(newIsOpen);
    onToggle?.(item.id, newIsOpen);
  };

  return (
    <div id={item.id} className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={handleToggle}
        className="flex w-full items-start justify-between py-4 text-left"
      >
        <span className="pr-4 font-medium text-gray-900">{item.question}</span>
        <span className="ml-4 flex-shrink-0 text-gray-400">
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[2000px] pb-4' : 'max-h-0'
        }`}
      >
        {/* Answer with markdown-like formatting */}
        <div className="prose prose-sm max-w-none text-gray-600">
          {item.answer.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-3 last:mb-0">
              {formatText(paragraph)}
            </p>
          ))}
        </div>

        {/* Official Links */}
        {item.officialLinks && item.officialLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.officialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Related Questions */}
        {item.relatedIds && item.relatedIds.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Verwandte Fragen
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.relatedIds.map((relatedId) => {
                const related = getFaqById(relatedId);
                if (!related) return null;
                return (
                  <button
                    key={relatedId}
                    onClick={() => onRelatedClick?.(relatedId)}
                    className="text-left text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    → {related.question}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format text with basic markdown-like syntax.
 */
function formatText(text: string): React.ReactNode {
  // Split by **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle line breaks within paragraphs
    return part.split('\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}
