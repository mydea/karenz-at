import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FAQ_ITEMS,
  FAQ_CATEGORIES,
  searchFaq,
  getFaqByCategory,
  getFaqById,
  type FaqCategory,
} from '@/data/faq';
import { FaqAccordion, FaqSearch, FaqCategoryFilter } from '@/components/faq';

export default function FaqPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const accordionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Read hash from URL on mount and when it changes
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && getFaqById(hash)) {
      setOpenItemId(hash);
      setSearchQuery('');
      setSelectedCategory(null);
    }
  }, [location.hash]);

  // Scroll to the open item after initial render
  useEffect(() => {
    if (openItemId && !initialScrollDone) {
      const timeoutId = setTimeout(() => {
        const element = accordionRefs.current.get(openItemId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setInitialScrollDone(true);
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [openItemId, initialScrollDone]);

  // Update URL hash when item is opened/closed
  const handleItemToggle = useCallback(
    (id: string, isOpen: boolean) => {
      if (isOpen) {
        navigate(`/faq#${id}`, { replace: true });
        setOpenItemId(id);
      } else if (openItemId === id) {
        navigate('/faq', { replace: true });
        setOpenItemId(null);
      }
    },
    [navigate, openItemId]
  );

  // Filter FAQ items based on search and category
  const filteredItems = useMemo(() => {
    let items = searchQuery ? searchFaq(searchQuery) : FAQ_ITEMS;

    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    return items;
  }, [searchQuery, selectedCategory]);

  // Group items by category for display
  const groupedItems = useMemo(() => {
    if (searchQuery || selectedCategory) {
      return null;
    }

    const groups = new Map<FaqCategory, typeof FAQ_ITEMS>();
    for (const item of filteredItems) {
      const existing = groups.get(item.category) || [];
      groups.set(item.category, [...existing, item]);
    }
    return groups;
  }, [filteredItems, searchQuery, selectedCategory]);

  // Handle clicking on a related question
  const handleRelatedClick = (id: string) => {
    setSearchQuery('');
    setSelectedCategory(null);
    navigate(`/faq#${id}`, { replace: true });
    setOpenItemId(id);

    setTimeout(() => {
      const element = accordionRefs.current.get(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Clear open item and URL hash when filters change
  useEffect(() => {
    if (searchQuery || selectedCategory) {
      setOpenItemId(null);
      if (location.hash) {
        navigate('/faq', { replace: true });
      }
    }
  }, [searchQuery, selectedCategory, location.hash, navigate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Häufige Fragen</h1>
        <p className="mt-1 text-gray-600">
          Antworten auf die wichtigsten Fragen rund um Karenz, Mutterschutz und
          Kinderbetreuungsgeld.
        </p>
      </div>

      {/* Search */}
      <div className="card">
        <FaqSearch
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={searchQuery ? filteredItems.length : undefined}
        />

        {/* Category Filter */}
        <div className="mt-4">
          <FaqCategoryFilter
            categories={FAQ_CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>

      {/* FAQ Content */}
      {searchQuery || selectedCategory ? (
        // Flat list when searching or filtering
        <div className="card">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 font-medium">Keine Ergebnisse gefunden</p>
              <p className="mt-1 text-sm">
                Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div>
              {selectedCategory && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    {FAQ_CATEGORIES.find((c) => c.id === selectedCategory)?.icon}
                  </span>
                  <span>
                    {FAQ_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                  </span>
                  <span>·</span>
                  <span>{filteredItems.length} Fragen</span>
                </div>
              )}
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) accordionRefs.current.set(item.id, el);
                  }}
                >
                  <FaqAccordion
                    item={item}
                    isOpen={item.id === openItemId}
                    onToggle={handleItemToggle}
                    onRelatedClick={handleRelatedClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Grouped by category when not searching
        <div className="space-y-6">
          {FAQ_CATEGORIES.map((category) => {
            const items = getFaqByCategory(category.id);
            if (items.length === 0) return null;

            return (
              <div key={category.id} className="card">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h2 className="font-semibold text-gray-900">{category.label}</h2>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      ref={(el) => {
                        if (el) accordionRefs.current.set(item.id, el);
                      }}
                    >
                      <FaqAccordion
                        item={item}
                        isOpen={item.id === openItemId}
                        onToggle={handleItemToggle}
                        onRelatedClick={handleRelatedClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Footer */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center">
        <h3 className="font-semibold text-gray-900">Ihre Frage nicht gefunden?</h3>
        <p className="mt-2 text-sm text-gray-600">
          Für individuelle Beratung wenden Sie sich an Ihre örtliche Arbeiterkammer oder die
          ÖGK.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="https://www.arbeiterkammer.at/beratung/arbeitundrecht/karenz/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Arbeiterkammer
          </a>
          <a
            href="https://www.oesterreich.gv.at/themen/arbeit_und_pension/mutterschaft_und_karenz.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            oesterreich.gv.at
          </a>
          <a
            href="https://www.gesundheitskasse.at/cdscontent/?contentid=10007.870038"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            ÖGK
          </a>
        </div>
      </div>
    </div>
  );
}
