import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { parseDate, toDateString } from '@/utils/dates';

interface DateInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

/**
 * Date input with calendar picker that stores/returns YYYY-MM-DD format.
 */
export function DateInput({ value, onChange, disabled, min, max, className = '' }: DateInputProps) {
  const dateValue = parseDate(value);
  const minDate = parseDate(min ?? '') ?? undefined;
  const maxDate = parseDate(max ?? '') ?? undefined;

  const handleChange = (newValue: Value) => {
    if (newValue instanceof Date) {
      onChange(toDateString(newValue));
    } else if (newValue === null) {
      onChange('');
    }
  };

  return (
    <div className={`date-input-wrapper ${className}`}>
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        format="dd.MM.yyyy"
        locale="de-AT"
        clearIcon={null}
        calendarIcon={
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        dayPlaceholder="TT"
        monthPlaceholder="MM"
        yearPlaceholder="JJJJ"
        calendarProps={{
          locale: 'de-AT',
          formatShortWeekday: (_locale, date) => {
            const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
            return days[date.getDay()] ?? '';
          },
          formatMonthYear: (_locale, date) => {
            const months = [
              'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
              'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
            ];
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
          },
        }}
      />
    </div>
  );
}
