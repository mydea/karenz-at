import { useState, useEffect, forwardRef } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Currency input that formats numbers with € symbol and thousand separators.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, id, placeholder = '0', disabled, min = 0, max, className = '' }, ref) => {
    const formatValue = (num: number): string => {
      if (num === 0) return '';
      return num.toLocaleString('de-AT');
    };

    const [displayValue, setDisplayValue] = useState(() => formatValue(value));
    const [isFocused, setIsFocused] = useState(false);

    // Sync display value when external value changes
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatValue(value));
      }
    }, [value, isFocused]);

    const parseValue = (input: string): number => {
      // Remove all non-numeric characters except comma and dot
      const cleaned = input.replace(/[^\d,.-]/g, '');
      // Replace comma with dot for parsing
      const normalized = cleaned.replace(',', '.');
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);

      const parsed = parseValue(input);
      let clamped = parsed;

      if (min !== undefined && parsed < min) clamped = min;
      if (max !== undefined && parsed > max) clamped = max;

      onChange(clamped);
    };

    const handleBlur = () => {
      setIsFocused(false);
      setDisplayValue(formatValue(value));
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Show raw number on focus for easier editing
      if (value > 0) {
        setDisplayValue(value.toString());
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          id={id}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`input pl-8 ${className}`}
          autoComplete="off"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
