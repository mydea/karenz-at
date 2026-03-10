/**
 * FAQ content for the Karenz.at application.
 * All content in German as per project rules.
 */

export type FaqCategory =
  | 'mutterschutz'
  | 'karenz'
  | 'kbg'
  | 'wochengeld'
  | 'arbeitgeber'
  | 'kuendigungsschutz'
  | 'vaeterkarenz'
  | 'familienbeihilfe'
  | 'wiedereinstieg';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  relatedIds?: string[];
  officialLinks?: Array<{
    label: string;
    url: string;
  }>;
}

export interface FaqCategoryInfo {
  id: FaqCategory;
  label: string;
  description: string;
  icon: string;
}

export const FAQ_CATEGORIES: FaqCategoryInfo[] = [
  {
    id: 'mutterschutz',
    label: 'Mutterschutz',
    description: 'Beschäftigungsverbot vor und nach der Geburt',
    icon: '🤰',
  },
  {
    id: 'wochengeld',
    label: 'Wochengeld',
    description: 'Einkommensersatz während des Mutterschutzes',
    icon: '💰',
  },
  {
    id: 'karenz',
    label: 'Karenz',
    description: 'Elternkarenz und Ansprüche',
    icon: '👶',
  },
  {
    id: 'kbg',
    label: 'Kinderbetreuungsgeld',
    description: 'KBG-Modelle und Berechnung',
    icon: '📊',
  },
  {
    id: 'vaeterkarenz',
    label: 'Väterkarenz',
    description: 'Spezielle Regelungen für Väter',
    icon: '👨',
  },
  {
    id: 'kuendigungsschutz',
    label: 'Kündigungsschutz',
    description: 'Schutz vor Kündigung während Karenz',
    icon: '🛡️',
  },
  {
    id: 'arbeitgeber',
    label: 'Arbeitgeber',
    description: 'Pflichten und Rechte des Arbeitgebers',
    icon: '🏢',
  },
  {
    id: 'familienbeihilfe',
    label: 'Familienbeihilfe',
    description: 'Familienbeihilfe und Familienbonus',
    icon: '👨‍👩‍👧',
  },
  {
    id: 'wiedereinstieg',
    label: 'Wiedereinstieg',
    description: 'Rückkehr in den Beruf',
    icon: '💼',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  // === MUTTERSCHUTZ ===
  {
    id: 'ms-wann-beginnt',
    question: 'Wann beginnt der Mutterschutz?',
    answer: `Der Mutterschutz (Beschäftigungsverbot) beginnt in der Regel **8 Wochen vor dem errechneten Geburtstermin**. Ab diesem Zeitpunkt dürfen Sie nicht mehr arbeiten.

Bei Frühgeburten, Mehrlingsgeburten oder Kaiserschnitt verlängert sich der Mutterschutz nach der Geburt auf **12 Wochen**.

Wird das Kind nach dem errechneten Termin geboren, verlängert sich der Mutterschutz vor der Geburt entsprechend. Die 8 Wochen nach der Geburt bleiben davon unberührt.`,
    category: 'mutterschutz',
    relatedIds: ['ms-wie-lange', 'wg-was-ist'],
    officialLinks: [
      {
        label: 'Mutterschutz - oesterreich.gv.at',
        url: 'https://www.oesterreich.gv.at/themen/arbeit_und_pension/mutterschaft_und_karenz/1/Seite.210410.html',
      },
    ],
  },
  {
    id: 'ms-wie-lange',
    question: 'Wie lange dauert der Mutterschutz?',
    answer: `Der Mutterschutz dauert insgesamt mindestens **16 Wochen**:
- **8 Wochen vor** dem errechneten Geburtstermin
- **8 Wochen nach** der Geburt

**Verlängerung auf 12 Wochen nach der Geburt** bei:
- Frühgeburt
- Mehrlingsgeburt (Zwillinge, Drillinge)
- Kaiserschnitt
- Sonstigen Komplikationen (mit ärztlichem Attest)

Wenn das Kind früher kommt, werden die "verlorenen" Tage vor der Geburt an die Zeit nach der Geburt angehängt.`,
    category: 'mutterschutz',
    relatedIds: ['ms-wann-beginnt', 'karenz-wann-beginnt'],
  },
  {
    id: 'ms-arbeit-erlaubt',
    question: 'Darf ich während des Mutterschutzes arbeiten?',
    answer: `**Nein**, während des Mutterschutzes besteht ein absolutes Beschäftigungsverbot. Dies dient dem Schutz von Mutter und Kind.

Auch wenn Sie sich fit fühlen und arbeiten möchten, ist es Ihrem Arbeitgeber **verboten**, Sie zu beschäftigen. Verstöße können mit Strafen geahndet werden.

**Ausnahmen:**
- Geringfügige Beschäftigung bei einem anderen Arbeitgeber ist unter bestimmten Voraussetzungen möglich
- Nach der 8. Woche kann bei normaler Geburt theoretisch Elternkarenz beginnen`,
    category: 'mutterschutz',
    relatedIds: ['wg-was-ist'],
  },

  // === WOCHENGELD ===
  {
    id: 'wg-was-ist',
    question: 'Was ist Wochengeld?',
    answer: `Wochengeld ist der **Einkommensersatz während des Mutterschutzes**. Es wird von der Krankenkasse (ÖGK) ausbezahlt und entspricht in etwa Ihrem bisherigen Nettoeinkommen.

**Höhe:** Durchschnittliches Nettoeinkommen der letzten 3 Monate vor Beginn des Mutterschutzes.

**Dauer:** Für die gesamte Dauer des Mutterschutzes (8 Wochen vor bis 8-12 Wochen nach der Geburt).

Das Wochengeld ist **steuerfrei**, unterliegt aber dem Progressionsvorbehalt (erhöht den Steuersatz für das restliche Einkommen).`,
    category: 'wochengeld',
    relatedIds: ['wg-hoehe', 'wg-antrag', 'ms-wann-beginnt'],
    officialLinks: [
      {
        label: 'Wochengeld - ÖGK',
        url: 'https://www.gesundheitskasse.at/cdscontent/?contentid=10007.870043',
      },
    ],
  },
  {
    id: 'wg-hoehe',
    question: 'Wie hoch ist das Wochengeld?',
    answer: `Die Höhe hängt von Ihrer Beschäftigungssituation ab:

**Angestellte:**
- Durchschnittliches Nettoeinkommen der letzten 3 Monate
- Beispiel: €2.100 netto/Monat → ca. €70/Tag

**Arbeitslose (mit ALG/Notstandshilfe):**
- **180%** des täglichen Arbeitslosengeldes
- Beispiel: €35 ALG/Tag → €63 Wochengeld/Tag

**Geringfügig Beschäftigte (mit Selbstversicherung):**
- Fixbetrag: **€12,19/Tag** (2026)
- Ca. €366/Monat

**Selbstständige:**
- Wird aus dem Versicherungswert berechnet
- Bei GSVG-Versicherung

Das Wochengeld ist **steuerfrei**, unterliegt aber dem Progressionsvorbehalt.`,
    category: 'wochengeld',
    relatedIds: ['wg-was-ist', 'wg-anspruch', 'wg-arbeitslos', 'wg-geringfuegig'],
  },
  {
    id: 'wg-antrag',
    question: 'Wie beantrage ich Wochengeld?',
    answer: `**Antragsstellung:**
1. Arbeitsunfähigkeitsmeldung durch Ihre Ärztin/Ihren Arzt oder Hebamme
2. Automatische Weiterleitung an die ÖGK durch den Arzt
3. Die ÖGK informiert auch Ihren Arbeitgeber

**Benötigte Unterlagen:**
- Mutter-Kind-Pass mit bestätigtem Geburtstermin
- Eventuell Gehaltsbestätigung vom Arbeitgeber

Das Wochengeld wird automatisch ausgezahlt, sobald die Meldung bei der ÖGK eingeht. Sie müssen keinen separaten Antrag stellen.`,
    category: 'wochengeld',
    relatedIds: ['wg-was-ist'],
  },
  {
    id: 'wg-anspruch',
    question: 'Wer hat Anspruch auf Wochengeld?',
    answer: `**Anspruch auf Wochengeld haben:**
- Angestellte in Krankenversicherung
- Freie Dienstnehmerinnen
- Selbstständige (mit Gewerblicher Sozialversicherung)
- Arbeitslose (mit Arbeitslosengeld/Notstandshilfe)
- Geringfügig Beschäftigte (mit Selbstversicherung)

**Keinen Anspruch haben:**
- Hausfrauen ohne jegliche Erwerbstätigkeit
- Frauen ohne Krankenversicherung
- Frauen, die weder arbeiten noch Arbeitslosengeld beziehen

**Wichtig:** Eine vorherige Beschäftigung oder ein laufender Leistungsbezug ist Voraussetzung für das Wochengeld!`,
    category: 'wochengeld',
    relatedIds: ['wg-was-ist', 'wg-arbeitslos', 'wg-geringfuegig', 'wg-ohne-einkommen'],
    officialLinks: [
      {
        label: 'Wochengeld Anspruch - AK',
        url: 'https://www.arbeiterkammer.at/wochengeld',
      },
    ],
  },
  {
    id: 'wg-arbeitslos',
    question: 'Bekomme ich Wochengeld, wenn ich arbeitslos bin?',
    answer: `**Ja**, wenn Sie bei Beginn des Mutterschutzes Arbeitslosengeld oder Notstandshilfe beziehen, haben Sie Anspruch auf Wochengeld.

**Höhe:** Das Wochengeld beträgt **180% Ihres täglichen Arbeitslosengeldes**.

**Beispiel:** Bei €35 Arbeitslosengeld/Tag erhalten Sie €63 Wochengeld/Tag.

**Wichtig:**
- Die Schwangerschaft muss während des Leistungsbezugs eingetreten sein ODER
- Das Arbeitsverhältnis muss während der Schwangerschaft geendet haben

Endet der Arbeitslosengeld-Bezug vor dem Mutterschutz und Sie nehmen keine neue Arbeit auf, besteht **kein** Wochengeld-Anspruch mehr.`,
    category: 'wochengeld',
    relatedIds: ['wg-anspruch', 'wg-was-ist', 'kbg-pauschal'],
    officialLinks: [
      {
        label: 'Wochengeld für Arbeitslose - AK',
        url: 'https://www.arbeiterkammer.at/beratung/arbeitundrecht/Arbeitslosigkeit/Wochengeld_fuer_Arbeitslose.html',
      },
    ],
  },
  {
    id: 'wg-geringfuegig',
    question: 'Bekomme ich Wochengeld bei geringfügiger Beschäftigung?',
    answer: `**Ja, aber nur mit Selbstversicherung!**

Geringfügig Beschäftigte sind nur unfallversichert. Für Wochengeld müssen Sie sich **freiwillig selbstversichern** (Kranken- und Pensionsversicherung).

**Höhe:** Fixbetrag von **€12,19 pro Tag** (2026), unabhängig vom tatsächlichen Einkommen.

Das sind ca. €366 pro Monat während des Mutterschutzes.

**Selbstversicherung:**
- Kostet ca. €70/Monat (2026)
- Bringt auch Pensionszeiten
- Muss VOR Beginn des Mutterschutzes abgeschlossen sein

**Ohne Selbstversicherung:** Kein Wochengeld-Anspruch!`,
    category: 'wochengeld',
    relatedIds: ['wg-anspruch', 'wg-ohne-einkommen'],
    officialLinks: [
      {
        label: 'Geringfügig beschäftigt - AK',
        url: 'https://www.arbeiterkammer.at/beratung/arbeitundrecht/Arbeitsverhaeltnisse/Geringfuegige_Beschaeftigung.html',
      },
    ],
  },
  {
    id: 'wg-ohne-einkommen',
    question: 'Was ist, wenn ich kein Einkommen habe (Hausfrau)?',
    answer: `**Ohne Erwerbstätigkeit oder Arbeitslosengeld-Bezug besteht KEIN Anspruch auf Wochengeld.**

Das Wochengeld ist eine Einkommensersatzleistung und setzt vorheriges Einkommen voraus.

**Was Sie trotzdem erhalten:**
- **Kinderbetreuungsgeld (pauschal):** Ab der Geburt, ohne Beschäftigungsvoraussetzung
- **Familienbeihilfe:** Ab dem Geburtsmonat
- **Familienbonus Plus:** Steuerabsetzbetrag (bei eigenem/Partner-Einkommen)

**Tipp:** Das pauschale KBG kann auch ohne vorherige Erwerbstätigkeit bezogen werden – im Gegensatz zum einkommensabhängigen KBG.

**Finanzielle Lücke:** Ohne Wochengeld gibt es in den 8 Wochen vor der Geburt keine Geldleistung. Das KBG beginnt erst nach der Geburt.`,
    category: 'wochengeld',
    relatedIds: ['wg-anspruch', 'kbg-pauschal', 'fb-was-ist'],
  },

  // === KARENZ ===
  {
    id: 'karenz-was-ist',
    question: 'Was ist Karenz?',
    answer: `Karenz ist die **arbeitsrechtliche Freistellung** von der Arbeit zur Betreuung eines Kindes. Während der Karenz ruht das Arbeitsverhältnis, Sie erhalten aber keinen Lohn vom Arbeitgeber.

**Wichtige Unterscheidung:**
- **Karenz** = arbeitsrechtlicher Anspruch auf Freistellung
- **Kinderbetreuungsgeld (KBG)** = finanzielle Leistung der Krankenkasse

Sie können Karenz nehmen, ohne KBG zu beziehen, und umgekehrt. Die meisten Eltern kombinieren beides.

**Anspruch:** Beide Elternteile haben einen Rechtsanspruch auf Karenz, unabhängig vom Geschlecht.`,
    category: 'karenz',
    relatedIds: ['karenz-wann-beginnt', 'karenz-dauer', 'kbg-was-ist'],
    officialLinks: [
      {
        label: 'Karenz - Arbeiterkammer',
        url: 'https://www.arbeiterkammer.at/beratung/arbeitundrecht/karenz/index.html',
      },
    ],
  },
  {
    id: 'karenz-wann-beginnt',
    question: 'Wann beginnt die Karenz?',
    answer: `Die Karenz kann frühestens **im Anschluss an den Mutterschutz** beginnen, also:
- Nach den 8 Wochen Beschäftigungsverbot nach der Geburt (normale Geburt)
- Nach den 12 Wochen (bei Kaiserschnitt, Frühgeburt, Komplikationen)

**Für Väter:** Die Karenz kann bereits ab dem Tag der Geburt beginnen.

**Meldepflicht:** Sie müssen die Karenz spätestens am **letzten Tag des Mutterschutzes** beim Arbeitgeber melden, wenn Sie diese direkt im Anschluss antreten wollen.`,
    category: 'karenz',
    relatedIds: ['karenz-was-ist', 'ms-wie-lange', 'ag-meldung'],
  },
  {
    id: 'karenz-dauer',
    question: 'Wie lange kann ich in Karenz gehen?',
    answer: `Die Karenz kann **bis zum 2. Geburtstag des Kindes** dauern.

**Aufteilung zwischen Eltern:**
- Mindestens **2 Monate** muss jeder Elternteil nehmen
- Maximal **2 Teilungen** (= 3 Karenzteile) sind möglich
- Die Karenzteile müssen nahtlos aneinander anschließen

**Mindestdauer pro Karenzteil:** 2 Monate

**Beispiel:** Mutter nimmt Karenz bis zum 1. Geburtstag, dann übernimmt der Vater bis zum 2. Geburtstag.

**Achtung:** Die Karenz ist unabhängig vom KBG-Bezug. Das KBG kann kürzer oder länger sein.`,
    category: 'karenz',
    relatedIds: ['karenz-was-ist', 'karenz-aufteilung'],
  },
  {
    id: 'karenz-aufteilung',
    question: 'Können beide Eltern gleichzeitig in Karenz gehen?',
    answer: `**Grundsätzlich:** Nein, die Karenz kann nicht gleichzeitig genommen werden.

**Ausnahme - Karenz-Überlappung:**
Beim ersten Wechsel zwischen den Eltern ist eine **Überlappung von maximal 1 Monat** möglich. In diesem Monat sind beide Eltern gleichzeitig in Karenz.

**Väterfrühkarenz ("Papamonat"):**
Der Vater kann innerhalb der ersten **3 Monate nach der Geburt** einen "Papamonat" von bis zu 31 Tagen nehmen. Dies läuft parallel zum Mutterschutz der Mutter und zählt nicht zur regulären Karenzzeit.`,
    category: 'karenz',
    relatedIds: ['karenz-dauer', 'vk-papamonat'],
    officialLinks: [
      {
        label: 'Aufteilung der Karenz - AK',
        url: 'https://www.arbeiterkammer.at/beratung/arbeitundrecht/karenz/Aufteilung_der_Karenz.html',
      },
    ],
  },

  // === KINDERBETREUUNGSGELD ===
  {
    id: 'kbg-was-ist',
    question: 'Was ist Kinderbetreuungsgeld (KBG)?',
    answer: `Das Kinderbetreuungsgeld ist eine **finanzielle Leistung** für Eltern, die ihr Kind selbst betreuen. Es wird von der Krankenkasse (ÖGK) ausbezahlt.

**Zwei Systeme:**
1. **Pauschales KBG (Konto):** Fixbetrag unabhängig vom Einkommen, flexible Bezugsdauer
2. **Einkommensabhängiges KBG:** 80% des letzten Einkommens, kürzere Bezugsdauer

**Wichtig:** KBG ist nicht das Gleiche wie Karenz! Sie können KBG auch ohne Karenz beziehen (z.B. bei Teilzeitarbeit unter der Zuverdienstgrenze).`,
    category: 'kbg',
    relatedIds: ['kbg-pauschal', 'kbg-einkommensabhaengig', 'karenz-was-ist'],
    officialLinks: [
      {
        label: 'KBG - Bundeskanzleramt',
        url: 'https://www.bundeskanzleramt.gv.at/agenda/familie/kinderbetreuungsgeld.html',
      },
    ],
  },
  {
    id: 'kbg-pauschal',
    question: 'Wie funktioniert das pauschale Kinderbetreuungsgeld?',
    answer: `Das **pauschale KBG (Konto)** bietet einen fixen Gesamtbetrag von ca. **€15.000**, der auf verschiedene Bezugsdauern aufgeteilt werden kann.

**Bezugsdauer:**
- Ein Elternteil: 365–851 Tage
- Beide Elternteile: 456–1.063 Tage

**Je kürzer die Bezugsdauer, desto höher der Tagessatz:**
- Kürzeste Variante: ca. €41/Tag
- Längste Variante: ca. €18/Tag

**Vorteile:**
- Keine Beschäftigungsvoraussetzung
- Höhere Zuverdienstgrenze (€18.000/Jahr)
- Flexible Dauer wählbar`,
    category: 'kbg',
    relatedIds: ['kbg-was-ist', 'kbg-einkommensabhaengig', 'kbg-zuverdienst'],
  },
  {
    id: 'kbg-einkommensabhaengig',
    question: 'Wie funktioniert das einkommensabhängige KBG?',
    answer: `Das **einkommensabhängige KBG** ersetzt **80% Ihres letzten Nettoeinkommens**, maximal €80,12 pro Tag (ca. €2.400/Monat).

**Bezugsdauer:**
- Ein Elternteil: max. 365 Tage (12 Monate)
- Beide Elternteile: max. 426 Tage (14 Monate)

**Voraussetzungen:**
- 182 Tage durchgehende Erwerbstätigkeit vor der Geburt
- Kranken- und pensionsversicherungspflichtige Beschäftigung

**Achtung:** Niedrigere Zuverdienstgrenze von nur €8.600/Jahr!

**Für wen lohnt es sich?** Bei höherem Einkommen und kürzerem Karenzwunsch.`,
    category: 'kbg',
    relatedIds: ['kbg-was-ist', 'kbg-pauschal', 'kbg-182-tage'],
  },
  {
    id: 'kbg-182-tage',
    question: 'Was bedeutet die 182-Tage-Regel?',
    answer: `Für das **einkommensabhängige KBG** müssen Sie in den **182 Tagen (ca. 6 Monate) vor der Geburt** durchgehend erwerbstätig gewesen sein.

**Voraussetzungen:**
- Kranken- und pensionsversicherungspflichtige Beschäftigung in Österreich
- Keine Unterbrechung länger als 14 Tage
- Kein Bezug von Arbeitslosengeld in dieser Zeit

**Was zählt als Erwerbstätigkeit:**
- Angestelltenverhältnis
- Freies Dienstverhältnis
- Selbständige Tätigkeit

**Was unterbricht NICHT:**
- Krankheit bei aufrechtem Dienstverhältnis
- Urlaub bei aufrechtem Dienstverhältnis
- Mutterschutz direkt im Anschluss`,
    category: 'kbg',
    relatedIds: ['kbg-einkommensabhaengig'],
  },
  {
    id: 'kbg-zuverdienst',
    question: 'Wie viel darf ich zum Kinderbetreuungsgeld dazuverdienen?',
    answer: `Die Zuverdienstgrenze hängt vom gewählten KBG-Modell ab:

**Pauschales KBG (Konto):**
- €18.000 pro Kalenderjahr ODER
- 60% des letzten Einkommens (der höhere Wert gilt)

**Einkommensabhängiges KBG:**
- €8.600 pro Kalenderjahr (strenger!)

**Bei Überschreitung:**
- Nur der überschreitende Betrag muss zurückgezahlt werden
- Keine Rückzahlung des gesamten KBG

**Tipp:** Prüfen Sie vor einem Nebenjob die Zuverdienstgrenze genau!`,
    category: 'kbg',
    relatedIds: ['kbg-pauschal', 'kbg-einkommensabhaengig'],
    officialLinks: [
      {
        label: 'Zuverdienstrechner - ÖGK',
        url: 'https://www.sozialversicherung.at/kbgZuverdienstrechner/',
      },
    ],
  },
  {
    id: 'kbg-antrag',
    question: 'Wie beantrage ich Kinderbetreuungsgeld?',
    answer: `**Antragstellung:**
- Online über MeineSV oder oesterreich.gv.at
- Persönlich bei der ÖGK
- Per Post an die zuständige ÖGK-Stelle

**Frist:** Spätestens **182 Tage** nach Bezugsbeginn (rückwirkende Zahlung nur für diese Zeit)

**Benötigte Unterlagen:**
- Geburtsurkunde des Kindes
- Meldebestätigung (Hauptwohnsitz)
- Nachweis über Mutter-Kind-Pass-Untersuchungen
- Bei einkommensabhängigem KBG: Einkommensnachweise

**Tipp:** Beantragen Sie das KBG möglichst früh nach der Geburt!`,
    category: 'kbg',
    relatedIds: ['kbg-was-ist'],
    officialLinks: [
      {
        label: 'KBG beantragen - ÖGK',
        url: 'https://www.gesundheitskasse.at/cdscontent/?contentid=10007.870038',
      },
    ],
  },
  {
    id: 'kbg-partnerschaftsbonus',
    question: 'Was ist der Partnerschaftsbonus?',
    answer: `Der Partnerschaftsbonus ist eine **Einmalzahlung von €500 pro Elternteil** (also €1.000 insgesamt).

**Voraussetzung:**
- Beide Elternteile beziehen KBG
- Jeder Elternteil bezieht mindestens **124 Tage**
- Das KBG-Verhältnis liegt zwischen 40:60 und 60:40

**Antrag:**
- Automatisch bei der letzten KBG-Auszahlung geprüft
- Separater Antrag innerhalb von 124 Tagen nach Bezugsende

**Gilt für beide KBG-Modelle** (pauschal und einkommensabhängig).`,
    category: 'kbg',
    relatedIds: ['kbg-was-ist', 'karenz-aufteilung'],
  },

  // === VÄTERKARENZ ===
  {
    id: 'vk-papamonat',
    question: 'Was ist der Papamonat (Familienzeitbonus)?',
    answer: `Der "Papamonat" ermöglicht Vätern, **bis zu 31 Tage** nach der Geburt beim Kind zu sein.

**Familienzeitbonus:**
- €25,06 pro Tag (ca. €777 für 31 Tage)
- Muss innerhalb von **91 Tagen nach der Geburt** bezogen werden
- Keine Erwerbstätigkeit während dieser Zeit erlaubt

**Arbeitsrechtlich:**
- Kein Rechtsanspruch auf Freistellung!
- Mit dem Arbeitgeber zu vereinbaren
- Oft über Urlaub oder unbezahlte Freistellung geregelt

**Achtung:** Der Familienzeitbonus wird vom späteren KBG-Anspruch abgezogen!`,
    category: 'vaeterkarenz',
    relatedIds: ['vk-rechte', 'karenz-aufteilung'],
    officialLinks: [
      {
        label: 'Familienzeitbonus - Bundeskanzleramt',
        url: 'https://www.bundeskanzleramt.gv.at/agenda/familie/kinderbetreuungsgeld/familienzeitbonus.html',
      },
    ],
  },
  {
    id: 'vk-rechte',
    question: 'Welche Rechte haben Väter bei der Karenz?',
    answer: `Väter haben **dieselben Karenz-Rechte wie Mütter**:

**Gleiche Rechte:**
- Anspruch auf Karenz bis zum 2. Geburtstag
- Kündigungsschutz während der Karenz
- Rückkehrrecht auf gleichwertigen Arbeitsplatz
- Anspruch auf KBG

**Besonderheiten für Väter:**
- Karenz kann ab dem **Tag der Geburt** beginnen
- Familienzeitbonus ("Papamonat") als zusätzliche Option
- Mindestens 2 Monate Karenz müssen beim Vater liegen (wenn beide Eltern Karenz nehmen)

**Wichtig:** Meldung der Väterkarenz spätestens **8 Wochen vor Antritt** an den Arbeitgeber!`,
    category: 'vaeterkarenz',
    relatedIds: ['karenz-was-ist', 'vk-papamonat', 'ks-wann'],
  },

  // === KÜNDIGUNGSSCHUTZ ===
  {
    id: 'ks-wann',
    question: 'Wann gilt der Kündigungsschutz?',
    answer: `Der Kündigungsschutz beginnt mit der **Meldung der Schwangerschaft** an den Arbeitgeber und dauert:

**Für Mütter:**
- Ab Bekanntgabe der Schwangerschaft
- Während des gesamten Mutterschutzes
- Während der gesamten Karenz
- Bis **4 Wochen nach Ende der Karenz**

**Für Väter:**
- Ab Meldung der Karenz
- Frühestens jedoch 4 Monate vor Karenzantritt
- Bis 4 Wochen nach Ende der Karenz

**Auch geschützt:** Kündigung durch den Arbeitnehmer selbst bleibt jederzeit möglich.`,
    category: 'kuendigungsschutz',
    relatedIds: ['ks-ausnahmen', 'ag-meldung'],
    officialLinks: [
      {
        label: 'Kündigungsschutz - AK',
        url: 'https://www.arbeiterkammer.at/beratung/arbeitundrecht/karenz/Kuendigungsschutz_waehrend_der_Karenz.html',
      },
    ],
  },
  {
    id: 'ks-ausnahmen',
    question: 'Gibt es Ausnahmen vom Kündigungsschutz?',
    answer: `Ja, in **Ausnahmefällen** kann das Arbeits- und Sozialgericht eine Kündigung genehmigen:

**Mögliche Gründe:**
- Betriebsstilllegung
- Insolvenz des Arbeitgebers
- Schwere Pflichtverletzungen der Arbeitnehmerin

**Nicht ausreichend:**
- Wirtschaftliche Schwierigkeiten des Arbeitgebers
- Umstrukturierungen
- Persönliche Gründe des Arbeitgebers

**Wichtig:** Ohne Zustimmung des Gerichts ist jede Kündigung unwirksam! Sie müssen aber innerhalb von **2 Wochen** die Unwirksamkeit geltend machen.`,
    category: 'kuendigungsschutz',
    relatedIds: ['ks-wann'],
  },

  // === ARBEITGEBER ===
  {
    id: 'ag-meldung',
    question: 'Wann muss ich meinem Arbeitgeber Bescheid geben?',
    answer: `**Meldepflichten:**

**Schwangerschaft:**
- Sobald bekannt (für Kündigungsschutz)
- Spätestens bei Beginn Mutterschutz

**Karenz:**
- Spätestens am **letzten Tag des Mutterschutzes** (wenn direkt anschließend)
- Sonst: **3 Monate vor Karenzbeginn**
- Für Väter: **8 Wochen vor Karenzbeginn**

**Bei der Meldung angeben:**
- Beginn der Karenz
- Voraussichtliche Dauer
- Ob der andere Elternteil ebenfalls Karenz nimmt

**Tipp:** Schriftliche Meldung mit Empfangsbestätigung!`,
    category: 'arbeitgeber',
    relatedIds: ['karenz-wann-beginnt', 'ks-wann'],
  },
  {
    id: 'ag-pflichten',
    question: 'Welche Pflichten hat mein Arbeitgeber?',
    answer: `**Pflichten des Arbeitgebers:**

**Während Schwangerschaft/Mutterschutz:**
- Freistellung ab Beginn des Beschäftigungsverbots
- Keine gefährlichen Arbeiten
- Keine Nacht-/Sonntagsarbeit (außer in bestimmten Branchen)

**Während Karenz:**
- Arbeitsplatz freihalten
- Gleichwertigen Arbeitsplatz bei Rückkehr
- Weiterbildungsangebote ermöglichen

**Bei Rückkehr:**
- Einarbeitung bei Änderungen
- Kein schlechterer Arbeitsplatz
- Anrechnung der Karenzzeit für Vorrückungen (je nach KV)

**Verboten:** Benachteiligung wegen Schwangerschaft oder Karenz.`,
    category: 'arbeitgeber',
    relatedIds: ['ag-meldung', 'we-rechte'],
  },

  // === FAMILIENBEIHILFE ===
  {
    id: 'fb-was-ist',
    question: 'Was ist die Familienbeihilfe?',
    answer: `Die Familienbeihilfe ist eine **monatliche Geldleistung** für Eltern mit Kindern in Österreich.

**Höhe (ab 2025):**
- Ab Geburt: €132,80/Monat
- Ab 3 Jahren: €141,50/Monat
- Ab 10 Jahren: €164,20/Monat
- Ab 19 Jahren: €191,60/Monat

**Zuschläge:**
- Geschwisterstaffelung bei mehreren Kindern
- Erhöhung bei Behinderung

**Anspruch:**
- Hauptwohnsitz in Österreich
- Kind lebt im gemeinsamen Haushalt
- Bis zum 18. Lebensjahr (bzw. länger bei Ausbildung)

Die Familienbeihilfe wird **steuerfrei** ausbezahlt.`,
    category: 'familienbeihilfe',
    relatedIds: ['fb-familienbonus'],
    officialLinks: [
      {
        label: 'Familienbeihilfe - Bundeskanzleramt',
        url: 'https://www.bundeskanzleramt.gv.at/agenda/familie/familienbeihilfe.html',
      },
    ],
  },
  {
    id: 'fb-familienbonus',
    question: 'Was ist der Familienbonus Plus?',
    answer: `Der Familienbonus Plus ist ein **Steuerabsetzbetrag**, der Ihre Steuerlast direkt reduziert.

**Höhe:**
- €166,68/Monat (€2.000/Jahr) pro Kind bis 18 Jahre
- €58,34/Monat (€700/Jahr) pro Kind ab 18 Jahre (in Ausbildung)

**Voraussetzung:**
- Ausreichende Steuerlast (sonst geht der Bonus teilweise verloren)
- Familienbeihilfenbezug für das Kind
- Kann zwischen den Eltern aufgeteilt werden

**Achtung:** Der Familienbonus ist kein Geld, das Sie überwiesen bekommen, sondern eine Reduktion Ihrer Lohnsteuer!

**Bei geringem Einkommen:** Der Kindermehrbetrag (bis €700/Jahr) kann beantragt werden.`,
    category: 'familienbeihilfe',
    relatedIds: ['fb-was-ist'],
  },

  // === WIEDEREINSTIEG ===
  {
    id: 'we-rechte',
    question: 'Welche Rechte habe ich bei der Rückkehr aus der Karenz?',
    answer: `**Ihre Rechte beim Wiedereinstieg:**

**Arbeitsplatzgarantie:**
- Rückkehr auf Ihren bisherigen oder einen gleichwertigen Arbeitsplatz
- Gleiches Gehalt (inkl. zwischenzeitlicher Erhöhungen)
- Gleiche Arbeitsbedingungen

**Elternteilzeit:**
- Rechtsanspruch in Betrieben mit mehr als 20 Mitarbeitern
- Bis zum 7. Geburtstag des Kindes (bei Karenz)
- Arbeitszeit und Lage können Sie vorschlagen

**Kündigungsschutz:**
- Läuft noch 4 Wochen nach Karenz-Ende weiter
- Bei Elternteilzeit: bis 4 Wochen nach Ende der Teilzeit

**Wichtig:** Schriftlich und fristgerecht die Rückkehr ankündigen!`,
    category: 'wiedereinstieg',
    relatedIds: ['we-teilzeit', 'ag-pflichten', 'ks-wann'],
    officialLinks: [
      {
        label: 'Wiedereinstieg nach der Karenz - AK',
        url: 'https://www.arbeiterkammer.at/beratung/arbeitundrecht/karenz/Wiedereinstieg_ins_Berufsleben.html',
      },
    ],
  },
  {
    id: 'we-teilzeit',
    question: 'Habe ich einen Anspruch auf Elternteilzeit?',
    answer: `**Rechtsanspruch auf Elternteilzeit** besteht wenn:
- Der Betrieb mehr als **20 Arbeitnehmer** hat
- Ihr Arbeitsverhältnis mindestens **3 Jahre** besteht
- Sie die Teilzeit spätestens **3 Monate vorher** beantragen

**Dauer:**
- Bis zum **7. Geburtstag** des Kindes (wenn Sie vorher in Karenz waren)
- Bis zum **4. Geburtstag**, wenn Sie nicht in Karenz waren

**Sie können vorschlagen:**
- Gewünschte Arbeitszeit (Stunden pro Woche)
- Gewünschte Lage der Arbeitszeit
- Beginn und Dauer der Teilzeit

**Kündigungsschutz:** Auch während der Elternteilzeit!

**Kleine Betriebe:** Vereinbarung mit dem Arbeitgeber nötig (kein Rechtsanspruch).`,
    category: 'wiedereinstieg',
    relatedIds: ['we-rechte'],
    officialLinks: [
      {
        label: 'Elternteilzeit - AK',
        url: 'https://www.arbeiterkammer.at/beratung/arbeitundrecht/karenz/Elternteilzeit.html',
      },
    ],
  },
];

/**
 * Get FAQ items by category.
 */
export function getFaqByCategory(category: FaqCategory): FaqItem[] {
  return FAQ_ITEMS.filter((item) => item.category === category);
}

/**
 * Get a single FAQ item by ID.
 */
export function getFaqById(id: string): FaqItem | undefined {
  return FAQ_ITEMS.find((item) => item.id === id);
}

/**
 * Search FAQ items by query string.
 */
export function searchFaq(query: string): FaqItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return FAQ_ITEMS;

  return FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get related FAQ items for a given item.
 */
export function getRelatedFaq(item: FaqItem): FaqItem[] {
  if (!item.relatedIds || item.relatedIds.length === 0) return [];
  return item.relatedIds
    .map((id) => getFaqById(id))
    .filter((related): related is FaqItem => related !== undefined);
}
