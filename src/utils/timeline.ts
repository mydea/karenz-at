/**
 * Timeline utilities for generating parental leave events and deadlines.
 */

import type { UserData, TimelineEvent, DistributionBlock } from '@/types';
import { calculateMutterschutz } from './calculations';
import { addDays, subtractDays, formatDateGerman, daysBetween } from './dates';

/**
 * Generate all timeline events based on user data.
 */
export function generateTimelineEvents(userData: UserData): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const { dueDate, birthConditions, distributionPlan, parent1, parent2 } = userData;

  if (!dueDate) return events;

  // Calculate Mutterschutz period
  const mutterschutz = calculateMutterschutz(dueDate, birthConditions);

  // Check if birth date is today or in the past
  const today = new Date().toISOString().split('T')[0];
  const isBirthPastOrToday = dueDate <= today;

  // === Birth Date ===
  events.push({
    id: 'birth',
    title: isBirthPastOrToday ? 'Geburtstermin' : 'Errechneter Geburtstermin',
    description: isBirthPastOrToday
      ? 'Der Geburtstag Ihres Kindes.'
      : 'Der voraussichtliche Geburtstermin Ihres Kindes.',
    date: dueDate,
    category: 'mutterschutz',
    isPeriod: false,
    priority: 0,
  });

  // === Papamonat / Familienzeitbonus Period ===
  const papamonatEnd = addDays(dueDate, 90); // 91 days total (day 0-90)
  if (papamonatEnd) {
    events.push({
      id: 'papamonat-period',
      title: 'Papamonat (Familienzeit)',
      description:
        'Zeitraum für den Papamonat/Familienzeitbonus. Der Vater kann innerhalb dieser 91 Tage ' +
        '28–31 zusammenhängende Tage Familienzeit nehmen. Wichtig: Die Familienzeit kann erst ' +
        'beginnen, wenn die Mutter aus dem Krankenhaus entlassen wurde. Der Familienzeitbonus ' +
        'beträgt €22,60 pro Tag. Die Meldung beim Arbeitgeber muss spätestens 3 Monate vor dem ' +
        'errechneten Geburtstermin erfolgen (bei Frühgeburt: am Tag der Geburt).',
      date: dueDate,
      endDate: papamonatEnd,
      category: 'karenz',
      parent: 'parent2',
      isPeriod: true,
      faqLink: 'papamonat',
      priority: 3,
    });
  }

  // === Mutterschutz Period ===
  if (mutterschutz.startDate && mutterschutz.endDate) {
    // Pre-birth Mutterschutz
    events.push({
      id: 'mutterschutz-start',
      title: 'Beginn Mutterschutz',
      description:
        'Absolutes Beschäftigungsverbot beginnt 8 Wochen vor dem errechneten Geburtstermin. ' +
        'Ab diesem Zeitpunkt erhalten Sie Wochengeld von der Krankenkasse.',
      date: mutterschutz.startDate,
      category: 'mutterschutz',
      parent: 'parent1',
      isPeriod: false,
      faqLink: 'mutterschutz',
      priority: 1,
    });

    // Full Mutterschutz period
    events.push({
      id: 'mutterschutz-period',
      title: 'Mutterschutz (Wochengeld)',
      description: `Schutzfrist vor und nach der Geburt. Sie erhalten Wochengeld statt Gehalt. ` +
        `Nach der Geburt: ${mutterschutz.weeksAfterBirth} Wochen.`,
      date: mutterschutz.startDate,
      endDate: mutterschutz.endDate,
      category: 'mutterschutz',
      parent: 'parent1',
      isPeriod: true,
      faqLink: 'mutterschutz',
      priority: 2,
    });

    // End of Mutterschutz
    events.push({
      id: 'mutterschutz-end',
      title: 'Ende Mutterschutz',
      description:
        'Ende der Schutzfrist. Ab dem nächsten Tag kann Kinderbetreuungsgeld bezogen werden.',
      date: mutterschutz.endDate,
      category: 'mutterschutz',
      parent: 'parent1',
      isPeriod: false,
      priority: 3,
    });

    // KBG Start Date
    const kbgStartDate = addDays(mutterschutz.endDate, 1);
    if (kbgStartDate) {
      events.push({
        id: 'kbg-start',
        title: 'Frühester KBG-Beginn',
        description:
          'Ab diesem Tag kann Kinderbetreuungsgeld bezogen werden. ' +
          'Der Antrag sollte rechtzeitig gestellt werden.',
        date: kbgStartDate,
        category: 'kbg',
        isPeriod: false,
        faqLink: 'kinderbetreuungsgeld',
        priority: 4,
      });
    }
  }

  // === Employer Notification Deadlines ===
  // Mother must notify employer about Karenz at least 3 months before due date
  // or at birth if premature
  const employerNotificationDeadline = subtractDays(dueDate, 91); // ~3 months
  if (employerNotificationDeadline) {
    events.push({
      id: 'employer-notification-mother',
      title: 'Karenz-Meldung Arbeitgeber (Mutter)',
      description:
        'Spätester Termin zur Bekanntgabe der Karenz beim Arbeitgeber. ' +
        'Die Meldung muss Beginn und Dauer der Karenz enthalten.',
      date: employerNotificationDeadline,
      category: 'employer',
      parent: 'parent1',
      isPeriod: false,
      faqLink: 'karenz-meldung',
      priority: 5,
    });
  }

  // Father notification for Papamonat: 3 months before due date
  const fatherPapamonatNotification = subtractDays(dueDate, 91); // 3 months before
  if (fatherPapamonatNotification) {
    events.push({
      id: 'father-papamonat-notification',
      title: 'Papamonat-Meldung Arbeitgeber',
      description:
        'Spätester Termin für den Vater, den Papamonat (Familienzeit) beim Arbeitgeber zu melden. ' +
        'Die Meldung muss Beginn und voraussichtliche Dauer (28–31 Tage) enthalten. ' +
        'Bei Frühgeburt kann die Meldung auch am Tag der Geburt erfolgen.',
      date: fatherPapamonatNotification,
      category: 'employer',
      parent: 'parent2',
      isPeriod: false,
      faqLink: 'papamonat',
      priority: 6,
    });
  }

  // === Kündigungsschutz (Dismissal Protection) ===
  // For mother: from pregnancy notification until 4 months after birth
  const dismissalProtectionEnd = addDays(dueDate, 122); // ~4 months after birth
  if (dismissalProtectionEnd) {
    events.push({
      id: 'dismissal-protection-mother',
      title: 'Kündigungsschutz Mutter',
      description:
        'Besonderer Kündigungsschutz für die Mutter. Beginnt mit Bekanntgabe der Schwangerschaft, ' +
        'endet 4 Monate nach der Geburt (bzw. 4 Wochen nach Ende der Karenz).',
      date: dueDate,
      endDate: dismissalProtectionEnd,
      category: 'employer',
      parent: 'parent1',
      isPeriod: true,
      faqLink: 'kuendigungsschutz',
      priority: 10,
    });
  }

  // === KBG Application Deadline ===
  // Must apply within 182 days of birth for full retroactive payment
  const kbgApplicationDeadline = addDays(dueDate, 182);
  if (kbgApplicationDeadline) {
    events.push({
      id: 'kbg-application-deadline',
      title: 'KBG-Antragsfrist',
      description:
        'Kinderbetreuungsgeld sollte innerhalb von 182 Tagen nach der Geburt beantragt werden. ' +
        'Rückwirkende Auszahlung maximal 182 Tage.',
      date: kbgApplicationDeadline,
      category: 'deadline',
      isPeriod: false,
      faqLink: 'kbg-antrag',
      priority: 7,
    });
  }

  // === Familienbeihilfe ===
  events.push({
    id: 'familienbeihilfe-start',
    title: 'Familienbeihilfe ab Geburt',
    description:
      'Anspruch auf Familienbeihilfe beginnt mit dem Geburtsmonat. ' +
      'Antrag beim Finanzamt oder online über FinanzOnline.',
    date: dueDate,
    category: 'benefit',
    isPeriod: false,
    faqLink: 'familienbeihilfe',
    priority: 8,
  });

  // === Distribution Plan Events ===
  if (distributionPlan && distributionPlan.length > 0) {
    addDistributionPlanEvents(events, distributionPlan, parent1.name, parent2.name);
  }

  // === Karenz End / Return to Work ===
  // Calculate latest possible Karenz end (child's 2nd birthday)
  const karenzMaxEnd = addDays(dueDate, 730); // ~2 years
  if (karenzMaxEnd) {
    events.push({
      id: 'karenz-max-end',
      title: 'Spätestes Karenz-Ende',
      description:
        'Karenz kann maximal bis zum 2. Geburtstag des Kindes dauern. ' +
        'Danach besteht Anspruch auf Rückkehr zum gleichen oder gleichwertigen Arbeitsplatz.',
      date: karenzMaxEnd,
      category: 'karenz',
      isPeriod: false,
      faqLink: 'karenz-ende',
      priority: 15,
    });
  }

  // Sort by date and priority
  events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.priority - b.priority;
  });

  return events;
}

/**
 * Add events for the distribution plan (KBG blocks).
 */
function addDistributionPlanEvents(
  events: TimelineEvent[],
  blocks: DistributionBlock[],
  parent1Name?: string,
  parent2Name?: string
): void {
  const getParentName = (parent: 'parent1' | 'parent2') =>
    parent === 'parent1' ? (parent1Name || 'Elternteil 1') : (parent2Name || 'Elternteil 2');

  blocks.forEach((block, index) => {
    const parentName = getParentName(block.parent);
    const blockNum = index + 1;

    // Block period
    events.push({
      id: `kbg-block-${index}`,
      title: `KBG-Bezug: ${parentName}`,
      description: `Block ${blockNum}: ${parentName} bezieht Kinderbetreuungsgeld für ${block.durationDays} Tage.`,
      date: block.startDate,
      endDate: block.endDate,
      category: 'kbg',
      parent: block.parent,
      isPeriod: true,
      priority: 20 + index,
    });

    // Block start
    events.push({
      id: `kbg-block-${index}-start`,
      title: `KBG-Beginn: ${parentName}`,
      description: `${parentName} beginnt mit dem Bezug von Kinderbetreuungsgeld.`,
      date: block.startDate,
      category: 'kbg',
      parent: block.parent,
      isPeriod: false,
      priority: 21 + index * 2,
    });

    // Block end
    events.push({
      id: `kbg-block-${index}-end`,
      title: `KBG-Ende: ${parentName}`,
      description: `${parentName} beendet den Bezug von Kinderbetreuungsgeld.`,
      date: block.endDate,
      category: 'kbg',
      parent: block.parent,
      isPeriod: false,
      priority: 22 + index * 2,
    });

    // Employer notification for Karenz (3 months before block start)
    if (index > 0) {
      // For subsequent blocks (parent switches), notification needed
      const notificationDate = subtractDays(block.startDate, 91);
      if (notificationDate) {
        events.push({
          id: `karenz-notification-${index}`,
          title: `Karenz-Meldung: ${parentName}`,
          description: `Spätester Termin für ${parentName}, Karenz beim Arbeitgeber zu melden.`,
          date: notificationDate,
          category: 'employer',
          parent: block.parent,
          isPeriod: false,
          priority: 25 + index,
        });
      }
    }
  });
}

/**
 * Get category display properties.
 */
export function getCategoryInfo(category: TimelineEvent['category']): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (category) {
    case 'mutterschutz':
      return {
        label: 'Mutterschutz',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
      };
    case 'karenz':
      return {
        label: 'Karenz',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
      };
    case 'kbg':
      return {
        label: 'Kinderbetreuungsgeld',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
      };
    case 'employer':
      return {
        label: 'Arbeitgeber',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
      };
    case 'deadline':
      return {
        label: 'Frist',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
      };
    case 'benefit':
      return {
        label: 'Leistung',
        color: 'text-teal-700',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-300',
      };
    default:
      return {
        label: 'Sonstiges',
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
      };
  }
}

/**
 * Format a date range for display.
 */
export function formatDateRange(startDate: string, endDate?: string): string {
  if (!endDate || startDate === endDate) {
    return formatDateGerman(startDate);
  }
  return `${formatDateGerman(startDate)} – ${formatDateGerman(endDate)}`;
}

/**
 * Get relative time description (e.g., "in 30 Tagen", "vor 5 Tagen").
 */
export function getRelativeTime(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const days = daysBetween(todayStr, dateStr);

  if (days === null) return '';
  if (days === 0) return 'Heute';
  if (days === 1) return 'Morgen';
  if (days === -1) return 'Gestern';
  if (days > 0 && days <= 7) return `in ${days} Tagen`;
  if (days < 0 && days >= -7) return `vor ${Math.abs(days)} Tagen`;
  if (days > 7 && days <= 30) return `in ${Math.ceil(days / 7)} Wochen`;
  if (days < -7 && days >= -30) return `vor ${Math.ceil(Math.abs(days) / 7)} Wochen`;
  if (days > 30 && days <= 365) return `in ${Math.ceil(days / 30)} Monaten`;
  if (days < -30 && days >= -365) return `vor ${Math.ceil(Math.abs(days) / 30)} Monaten`;
  return '';
}

/**
 * Check if an event is in the past.
 */
export function isEventPast(event: TimelineEvent): boolean {
  const today = new Date().toISOString().split('T')[0];
  const endDate = event.endDate || event.date;
  return endDate < today;
}

/**
 * Check if an event is currently active (for periods).
 */
export function isEventActive(event: TimelineEvent): boolean {
  if (!event.isPeriod || !event.endDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return event.date <= today && event.endDate >= today;
}

/**
 * Generate iCal format for export.
 */
export function generateICal(events: TimelineEvent[]): string {
  const formatICalDate = (dateStr: string) => dateStr.replace(/-/g, '');
  const escapeText = (text: string) => text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Karenz.at//Timeline//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Karenz Timeline
`;

  events.forEach((event) => {
    const uid = `${event.id}@karenz.at`;
    const dtstart = formatICalDate(event.date);
    const dtend = event.endDate
      ? formatICalDate(addDays(event.endDate, 1) || event.endDate)
      : formatICalDate(addDays(event.date, 1) || event.date);

    ical += `BEGIN:VEVENT
UID:${uid}
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
SUMMARY:${escapeText(event.title)}
DESCRIPTION:${escapeText(event.description)}
CATEGORIES:${getCategoryInfo(event.category).label}
END:VEVENT
`;
  });

  ical += 'END:VCALENDAR';
  return ical;
}
