import { useState, useEffect, forwardRef } from 'react';
import { formatDateGerman, parseDateGerman, isValidDateString } from '@/utils/dates';

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

/**
 * Date input that displays/accepts German format (DD.MM.YYYY)
 * but stores/returns YYYY-MM-DD format.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, id, placeholder = 'TT.MM.JJJJ', disabled, className = '' }, ref) => {
    // Display value in German format
    const [displayValue, setDisplayValue] = useState(() =>
      value ? formatDateGerman(value) : ''
    );
    const [isFocused, setIsFocused] = useState(false);

    // Sync display value when external value changes
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(value ? formatDateGerman(value) : '');
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);

      // Try to parse as German date
      const parsed = parseDateGerman(input);
      if (parsed) {
        onChange(parsed);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Reformat on blur if valid
      if (isValidDateString(value)) {
        setDisplayValue(formatDateGerman(value));
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    return (
      <input
        ref={ref}
        type="text"
        id={id}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${className}`}
        autoComplete="off"
      />
    );
  }
);

DateInput.displayName = 'DateInput';
