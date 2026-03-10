# Implementation Plan: karenz-at

## Overview

A German-language React web application providing information and utilities for Austrian parental leave (Karenz). The app will be built with React Router and deployed to Cloudflare.

### Scope & Limitations
- **Target audience**: Employees (Angestellte/Arbeiter) only
- **Not supported**: Self-employed (Selbstständige) — app should clearly communicate this limitation
- **Unemployed parents**: Supported with income = 0 (receive minimum rates)
- **Multiple children**: Twins/triplets supported via `BirthCondition`; existing children from previous births not in scope
- **Data storage**: Local only (localStorage), no user accounts or cloud sync

---

## Phase 1: Project Setup & Foundation

### 1.1 Development Environment
- [ ] Initialize React project with Vite
- [ ] Configure React Router for client-side routing
- [ ] Set up TypeScript for type safety
- [ ] Configure ESLint and Prettier
- [ ] Set up Tailwind CSS (or chosen styling solution)

### 1.2 Core Architecture
- [ ] Define folder structure:
  ```
  src/
  ├── components/     # Reusable UI components
  ├── pages/          # Route-level components
  ├── hooks/          # Custom React hooks
  ├── utils/          # Helper functions & calculations
  ├── types/          # TypeScript type definitions
  ├── data/           # Static data (FAQ content, legal info)
  └── locales/        # German language strings
  ```
- [ ] Create base layout component with navigation
- [ ] Implement responsive design foundation

### 1.3 Data Management
- [ ] Define TypeScript interfaces for all data models:
  ```typescript
  interface UserData {
    dueDate: string;                    // YYYY-MM-DD format
    parent1: ParentData;
    parent2: ParentData;
    selectedModel: ChildcareAllowanceModel;
    distributionPlan: DistributionBlock[];  // Planned distribution between parents
    birthConditions: BirthCondition[];  // Multi-select, affects Mutterschutz & benefits
  }
  
  interface ParentData {
    name?: string;
    monthlyNetIncome: number;           // Average monthly net income (3 months before Mutterschutz)
    hasWorked182Days: boolean;          // Required for einkommensabhängig (182 days before birth)
  }
  
  // === Birth Conditions (affect Mutterschutz duration & benefits) ===
  
  enum BirthCondition {
    CESAREAN = 'CESAREAN',              // Kaiserschnitt - extends Mutterschutz to 12 weeks
    PREMATURE = 'PREMATURE',            // Frühgeburt - extends Mutterschutz to 12 weeks
    TWINS = 'TWINS',                    // Zwillinge - affects Mehrlingszuschlag
    TRIPLETS_OR_MORE = 'TRIPLETS_OR_MORE', // Drillinge+ - higher Mehrlingszuschlag
    COMPLICATED_BIRTH = 'COMPLICATED_BIRTH', // Komplikationen - may extend Mutterschutz
  }
  
  // === Childcare Allowance (Kinderbetreuungsgeld) Models ===
  
  type AllowanceType = 'flatRate' | 'incomeBased';
  // flatRate = Pauschales KBG (Konto)
  // incomeBased = Einkommensabhängiges KBG
  
  interface ChildcareAllowanceModel {
    type: AllowanceType;
    // For flatRate: chosen duration in days (365-851 single, 456-1063 both)
    chosenDurationDays?: number;
  }
  
  // === Distribution Plan (Bezugsplan) ===
  
  interface DistributionBlock {
    parent: 'parent1' | 'parent2';
    startDate: string;                  // YYYY-MM-DD
    endDate: string;                    // YYYY-MM-DD
    durationDays: number;
  }
  ```

- [ ] Define childcare allowance model constants and rules:
  ```typescript
  // === Flat-Rate Childcare Allowance (Pauschales KBG / Konto) ===
  const FLAT_RATE_CONFIG = {
    // Duration range
    minDaysSingleParent: 365,           // ~12 months
    maxDaysSingleParent: 851,           // ~28 months
    minDaysBothParents: 456,            // ~15 months
    maxDaysBothParents: 1063,           // ~35 months
    
    // Daily rates (inversely proportional to duration)
    dailyRateMin: 17.65,                // EUR at longest duration
    dailyRateMax: 41.14,                // EUR at shortest duration
    
    // Parent split rules
    secondParentMinPercent: 20,         // 20% reserved for 2nd parent
    secondParentMinDays: 91,            // Minimum in shortest variant
    
    // Block rules
    maxSwitches: 2,                     // Max switches between parents
    maxBlocks: 3,                       // Results in max 3 blocks
    minBlockDays: 61,                   // Each block minimum 61 days
    overlapDaysAllowed: 31,             // Simultaneous receipt at first switch
    
    // Additional income limit (Zuverdienst)
    additionalIncomeLimit: 18000,       // EUR/year or 60% of previous income
    
    // Modification rules
    canChangeVariantOnce: true,         // Can change duration once per child
    changeDeadlineDays: 91,             // Must request 91 days before end
  };
  
  // === Income-Based Childcare Allowance (Einkommensabhängiges KBG) ===
  const INCOME_BASED_CONFIG = {
    // Duration (fixed, not flexible like flat-rate)
    maxDaysSingleParent: 365,           // ~12 months
    maxDaysBothParents: 426,            // ~14 months (12+2)
    
    // Rate calculation
    incomeReplacementPercent: 80,       // 80% of net income
    dailyRateMax: 80.12,                // EUR (~2,400/month cap)
    dailyRateMin: 41.14,                // EUR (fallback minimum)
    
    // Parent split rules
    reservedDaysPerParent: 61,          // Each parent has 61 days reserved
    
    // Block rules
    minBlockDays: 61,                   // Each block minimum 61 days
    overlapDaysAllowed: 31,             // Simultaneous receipt at first switch
    
    // Eligibility requirement
    requiredWorkDaysBeforeBirth: 182,   // Must work 182 days before birth
    
    // Additional income limit (Zuverdienst)
    additionalIncomeLimit: 8600,        // EUR/year (stricter than flat-rate)
    
    // Modification rules
    canChangeVariant: false,            // Cannot change once selected
    bothParentsBoundToModel: true,      // Both must use same model
  };
  ```

- [ ] Create localStorage hook for persistence (`useLocalStorage`)
- [ ] Implement data validation utilities
- [ ] Implement distribution plan validation:
  - Max 2 switches (3 blocks total)
  - Each block minimum 61 days
  - Total days within model limits
  - Second parent minimum days respected
  - No gaps between blocks (except allowed overlap)

---

## Phase 2: Settings/Data Entry Page

### 2.1 Form Components
- [ ] Date picker component for due date entry
  - Support past dates (actual birth) and future dates (estimated)
  - German date format (DD.MM.YYYY)
- [ ] Salary input components
  - Monthly/yearly toggle
  - Separate inputs for both parents
  - Currency formatting (€)
- [ ] Employment eligibility toggle for each parent
  - "182 Tage durchgehend erwerbstätig vor Geburt?"
  - Show calculated cutoff date when birth date is entered
  - Required to unlock einkommensabhängig model
- [ ] Childcare allowance model selector
  - Radio buttons: Flat-rate (Pauschales KBG) vs. Income-based (Einkommensabhängiges KBG)
  - Show eligibility warnings if requirements not met
  - For flat-rate: duration slider (365-1063 days) with live daily rate display
- [ ] Distribution plan builder
  - Visual block editor showing parent1/parent2 blocks
  - Drag to adjust block boundaries
  - Show validation: min 61 days per block, max 3 blocks
  - Display reserved days for second parent (20% / 91 days minimum)
  - Option to add 31-day overlap at first switch
- [ ] Birth conditions multi-select (`birthConditions: BirthCondition[]`)
  - Options: Kaiserschnitt, Frühgeburt, Zwillinge, Drillinge+, Komplikationen
  - Multi-select checkboxes or tag-style selector
  - Show explanation: "Relevant für Mutterschutz-Dauer und Mehrlingszuschlag"

### 2.2 Form Logic
- [ ] Form validation with helpful German error messages
- [ ] Auto-save to localStorage on change
- [ ] Clear data / reset functionality

---

## Phase 3: Timeline View

### 3.1 Timeline Data Model
- [ ] Research and document all relevant Austrian dates/deadlines:
  - Mutterschutz start (8 weeks before due date, 12 weeks for cesarean/complications)
  - Mutterschutz end (8 weeks after birth, 12 weeks for cesarean/premature)
  - Karenz start options
  - Kinderbetreuungsgeld application deadlines
  - Employer notification deadlines
  - Kündigungsschutz periods
  - Familienbeihilfe relevant dates

### 3.2 Timeline UI
- [ ] Design timeline/calendar component
  - Vertical scrollable timeline
  - Color-coded event categories
  - Mobile-friendly touch interactions
- [ ] Implement date calculation utilities
- [ ] Create event cards with detailed information
- [ ] Add "today" marker and relative time indicators
- [ ] Implement zoom/scale controls (month/quarter/year view)

### 3.3 Timeline Features
- [ ] Filter events by category
- [ ] Export timeline to calendar (iCal)
- [ ] Print-friendly view
- [ ] Link timeline events to FAQ entries

---

## Phase 4: Money Calculator

### 4.1 Calculation Engine
- [ ] Implement flat-rate allowance calculations:
  - Daily rate = f(chosen duration) — inversely proportional
  - Range: €41.14/day (365 days) to €17.65/day (851/1063 days)
  - Total amount is constant regardless of duration chosen
  - Formula: `totalAmount = dailyRateMax * minDays` (approx. €15,016)
- [ ] Implement income-based allowance calculations:
  - Daily rate = 80% of maternity allowance (Wochengeld)
  - Cap at €80.12/day (~€2,400/month)
  - Minimum €41.14/day (fallback rate)
  - Formula from income: `(annualIncome * 0.62 + 4000) / 365`
- [ ] Implement calculation functions:
  ```typescript
  // Flat-rate calculations
  calculateFlatRateDailyRate(durationDays: number): number
  calculateFlatRateTotal(durationDays: number): number
  
  // Income-based calculations  
  calculateIncomeBasedDailyRate(annualGrossIncome: number): number
  calculateFromMaternityAllowance(maternityAllowance: number): number
  
  // Comparison helpers
  calculateTotalBenefit(model: ChildcareAllowanceModel, parentData: ParentData): number
  compareBothModels(parentData: ParentData): ModelComparison
  ```
- [ ] Handle special cases:
  - Minimum/maximum benefit caps
  - Part-time work during parental leave (additional income limits: €18k flat-rate, €8.6k income-based)
  - Partner not eligible for income-based (falls back to minimum rate)
  - Partnership bonus (+€500 each if both take at least 124 days)
  - Unemployed parent (income = 0 → receive minimum flat-rate)
- [ ] Implement Familienbonus Plus calculations:
  - €166.68/month (€2,000/year) per child 0-18 years
  - Included in total benefits overview
  - Note: Tax credit, requires sufficient tax liability

### 4.2 Calculator UI
- [ ] Model comparison view (side-by-side)
- [ ] Monthly breakdown chart/graph
- [ ] Interactive sliders for "what-if" scenarios
- [ ] Split visualization between parents
- [ ] Summary cards with key figures

### 4.3 Results Display
- [ ] Total expected benefits per model
- [ ] Monthly payment timeline
- [ ] Comparison with regular income
- [ ] Recommendations based on user's situation

---

## Phase 5: FAQ Section

### 5.1 Content Structure
- [x] Research and compile FAQ content:
  - Mutterschutz (maternity protection)
  - Karenz (parental leave) basics
  - Kinderbetreuungsgeld (childcare allowance)
  - Employer rights and obligations
  - Kündigungsschutz (dismissal protection)
  - Väterkarenz (paternity leave)
  - Wochengeld (maternity allowance)
  - Familienbeihilfe (family allowance)
  - Returning to work options

### 5.2 FAQ UI
- [x] Searchable FAQ interface
- [x] Collapsible accordion sections
- [x] Category filtering
- [x] Cross-links between related topics
- [x] Links to official sources (help.gv.at, etc.)

### 5.3 Integration
- [ ] Link FAQ entries from timeline events
- [ ] Link FAQ entries from calculator results
- [ ] "Learn more" buttons throughout the app

---

## Phase 6: Polish & Deployment

### 6.1 UI/UX Refinement
- [ ] Implement consistent German language throughout
- [ ] Add loading states and skeleton screens
- [ ] Implement error boundaries and fallbacks
- [ ] Add onboarding/intro for first-time users
- [ ] Accessibility audit (WCAG compliance)
- [ ] Add legal disclaimer (footer or dedicated page):
  - Best effort, no guarantees — not legal or financial advice
  - Display last content update date
  - Encourage users to verify with official sources (ÖGK, AMS, help.gv.at)
  - Note: Only for employees, not self-employed

### 6.2 Performance
- [ ] Code splitting by route
- [ ] Lazy load heavy components (charts, timeline)
- [ ] Optimize bundle size
- [ ] Add PWA support for offline use

### 6.3 Testing
- [ ] Unit tests for calculation functions
- [ ] Integration tests for data persistence
- [ ] E2E tests for critical user flows
- [ ] Cross-browser testing

### 6.4 Deployment
- [ ] Configure Cloudflare Pages
- [ ] Set up custom domain (if applicable)
- [ ] Configure caching and CDN
- [ ] Set up analytics (privacy-respecting)
- [ ] Create deployment pipeline

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build Tool | Vite | Fast dev experience, good React support |
| Routing | React Router v6 | Standard, file-based routing possible |
| Styling | Tailwind CSS | Rapid development, good responsive utilities |
| State Management | React Context + localStorage | Simple app, no complex state needed |
| Charts | Recharts or Chart.js | Timeline and calculator visualizations |
| Date Handling | date-fns | Lightweight, German locale support |
| Forms | React Hook Form | Good validation, performance |
| Deployment | Cloudflare Pages | As specified, good free tier |

---

## Data Sources & References

- [oesterreich.gv.at - Kinderbetreuungsgeld Varianten](https://www.oesterreich.gv.at/themen/familie_und_partnerschaft/finanzielle-unterstuetzungen/3/2.html)
- [Bundeskanzleramt - KBG Konto](https://www.bundeskanzleramt.gv.at/agenda/familie/kinderbetreuungsgeld/basisinformationen-kinderbetreuungsgeld/kinderbetreuungsgeld-konto-pauschalsystem.html)
- [Bundeskanzleramt - Einkommensabhängiges KBG](https://www.bundeskanzleramt.gv.at/agenda/familie/kinderbetreuungsgeld/basisinformationen-kinderbetreuungsgeld/einkommensabhaengiges-kinderbetreuungsgeld.html)
- [Arbeiterkammer - Karenz](https://www.arbeiterkammer.at/karenz)
- [Kinderbetreuungsgeld Online-Rechner](https://www.oesterreich.gv.at/themen/familie_und_partnerschaft/finanzielle-unterstuetzungen/3/4.html)
- Austrian legal texts: MSchG (Mutterschutzgesetz), VKG (Väter-Karenzgesetz), KBGG (Kinderbetreuungsgeldgesetz)

---

## Childcare Allowance Models Summary (Kinderbetreuungsgeld)

### Flat-Rate Model (Pauschales KBG / Konto)

| Aspect | Details |
|--------|---------|
| Code type | `'flatRate'` |
| Eligibility | No prior employment required |
| Duration (1 parent) | 365–851 days (~12–28 months) |
| Duration (2 parents) | 456–1063 days (~15–35 months) |
| Daily rate | €17.65 (longest) to €41.14 (shortest) |
| Total amount | ~€15,016 (constant regardless of duration) |
| Second parent reserve | 20% of total (min. 91 days) |
| Parent switches | Max 2 switches → max 3 blocks |
| Min block duration | 61 days |
| Overlap allowed | 31 days at first switch |
| Additional income limit | €18,000/year or 60% of prior income |
| Can change variant | Yes, once per child (91 days before end) |

### Income-Based Model (Einkommensabhängiges KBG)

| Aspect | Details |
|--------|---------|
| Code type | `'incomeBased'` |
| Eligibility | 182 days continuous employment before birth |
| Duration (1 parent) | Max 365 days (~12 months) |
| Duration (2 parents) | Max 426 days (~14 months) |
| Daily rate | 80% of net income |
| Daily rate cap | €80.12/day (~€2,400/month) |
| Daily rate minimum | €41.14/day (fallback) |
| Reserved per parent | 61 days each (non-transferable) |
| Min block duration | 61 days |
| Overlap allowed | 31 days at first switch |
| Additional income limit | €8,600/year |
| Can change variant | No, both parents bound to choice |

### Key Decision Factors

- **Higher income + short leave** → Income-based model (up to €2,400/month)
- **Lower income or longer leave** → Flat-rate model (flexible duration)
- **Only one parent eligible** → Can mix (eligible parent uses income-based, other uses flat-rate minimum)
- **Partnership bonus**: +€500 each if both parents take ≥124 days

---

## Milestones

1. **MVP (Minimum Viable Product)**: Settings page + basic timeline with key dates
2. **v1.0**: Full timeline + money calculator with all models
3. **v1.1**: Complete FAQ + cross-linking
4. **v2.0**: PWA support, calendar export, advanced features
