import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '@/hooks';
import type { TimelineEvent, TimelineEventCategory } from '@/types';
import {
  generateTimelineEvents,
  getCategoryInfo,
  formatDateRange,
  getRelativeTime,
  isEventPast,
  isEventActive,
  generateICal,
} from '@/utils/timeline';
import { formatDateGerman } from '@/utils/dates';

// All available categories
const ALL_CATEGORIES: TimelineEventCategory[] = [
  'mutterschutz',
  'karenz',
  'kbg',
  'employer',
  'deadline',
  'benefit',
];

export default function TimelinePage() {
  const { userData } = useUserData();
  const [selectedCategories, setSelectedCategories] = useState<TimelineEventCategory[]>(ALL_CATEGORIES);
  const [showPastEvents, setShowPastEvents] = useState(true);

  // Generate events from user data
  const allEvents = useMemo(() => {
    if (!userData.dueDate) return [];
    return generateTimelineEvents(userData);
  }, [userData]);

  // Filter events by category and past/future
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (!selectedCategories.includes(event.category)) return false;
      if (!showPastEvents && isEventPast(event)) return false;
      return true;
    });
  }, [allEvents, selectedCategories, showPastEvents]);

  // Group events by month for better organization
  const eventsByMonth = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach((event) => {
      const monthKey = event.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });
    return groups;
  }, [filteredEvents]);

  // Get sorted month keys
  const sortedMonths = useMemo(() => {
    return Object.keys(eventsByMonth).sort();
  }, [eventsByMonth]);

  // Toggle category filter
  const toggleCategory = (category: TimelineEventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Export to iCal
  const handleExport = () => {
    const ical = generateICal(filteredEvents);
    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'karenz-timeline.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format month header
  const formatMonthHeader = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Get today's date for "today" marker
  const today = new Date().toISOString().split('T')[0];

  // No data state
  if (!userData.dueDate) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zeitplan</h1>
          <p className="mt-1 text-gray-600">
            Übersicht aller wichtigen Termine und Fristen für Ihre Karenz.
          </p>
        </div>

        <div className="card">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Keine Daten vorhanden
            </h3>
            <p className="mt-2 text-gray-500">
              Bitte geben Sie zuerst den Geburtstermin in den Einstellungen ein.
            </p>
            <a
              href="/einstellungen"
              className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Zu den Einstellungen
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zeitplan</h1>
          <p className="mt-1 text-gray-600">
            Übersicht aller wichtigen Termine und Fristen für Ihre Karenz.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Kalender exportieren
        </button>
      </div>

      {/* Summary Card */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">Geburtstermin</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDateGerman(userData.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Termine gesamt</p>
            <p className="text-lg font-semibold text-gray-900">{allEvents.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Angezeigt</p>
            <p className="text-lg font-semibold text-gray-900">{filteredEvents.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Heute</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDateGerman(today)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Filter</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((category) => {
            const info = getCategoryInfo(category);
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? `${info.bgColor} ${info.color} ring-1 ${info.borderColor}`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {isSelected && (
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {info.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showPastEvents}
              onChange={(e) => setShowPastEvents(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Vergangene Termine anzeigen
          </label>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedMonths.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            Keine Termine für die ausgewählten Filter.
          </div>
        ) : (
          sortedMonths.map((monthKey) => (
            <div key={monthKey}>
              {/* Month Header */}
              <h2 className="text-lg font-semibold text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
                {formatMonthHeader(monthKey)}
              </h2>

              {/* Events for this month */}
              <div className="space-y-3">
                {eventsByMonth[monthKey].map((event) => (
                  <TimelineEventCard
                    key={event.id}
                    event={event}
                    today={today}
                    parent1Name={userData.parent1.name}
                    parent2Name={userData.parent2.name}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Event Card Component
function TimelineEventCard({
  event,
  today,
  parent1Name,
  parent2Name,
}: {
  event: TimelineEvent;
  today: string;
  parent1Name?: string;
  parent2Name?: string;
}) {
  const info = getCategoryInfo(event.category);
  const isPast = isEventPast(event);
  const isActive = isEventActive(event);
  const isToday = event.date === today;
  const relativeTime = getRelativeTime(event.date);

  const getParentLabel = () => {
    if (!event.parent) return null;
    if (event.parent === 'parent1') return parent1Name || 'Elternteil 1';
    if (event.parent === 'parent2') return parent2Name || 'Elternteil 2';
    return 'Beide Elternteile';
  };

  return (
    <div
      className={`card relative overflow-hidden transition-opacity ${
        isPast && !isActive ? 'opacity-60' : ''
      }`}
    >
      {/* Category color bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${info.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`}
      />

      {/* Today marker */}
      {isToday && (
        <div className="absolute right-0 top-0 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-bl">
          Heute
        </div>
      )}

      {/* Active period marker */}
      {isActive && (
        <div className="absolute right-0 top-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-bl">
          Aktuell
        </div>
      )}

      <div className="pl-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900">{event.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 ${info.bgColor} ${info.color} text-xs font-medium`}>
                {info.label}
              </span>
              {getParentLabel() && (
                <span className="text-gray-500">• {getParentLabel()}</span>
              )}
              {event.isPeriod && (
                <span className="text-gray-500">• Zeitraum</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatDateRange(event.date, event.endDate)}
            </p>
            {relativeTime && (
              <p className={`text-sm ${isPast ? 'text-gray-400' : 'text-primary-600'}`}>
                {relativeTime}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-600">{event.description}</p>

        {/* FAQ Link */}
        {event.faqLink && (
          <Link
            to={`/faq#${event.faqLink}`}
            className="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            Mehr erfahren
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
