# Project Rules: karenz-at

## Language

- **User-facing text**: German (UI labels, error messages, help text, FAQ content)
- **Internal/API-facing text**: English (code comments, variable names, function names, type definitions, commit messages)

## Date Handling

- **Storage format**: All dates must be stored as `YYYY-MM-DD` strings (ISO 8601 date format)
  - This avoids timezone shift issues when parsing/serializing
  - Example: `"2026-03-15"` not `new Date()` or timestamps
- **Display format**: German format `DD.MM.YYYY` for user-facing display
  - Example: `"15.03.2026"`
- **Parsing**: Always parse date strings explicitly, never rely on `new Date(string)` with ambiguous formats
