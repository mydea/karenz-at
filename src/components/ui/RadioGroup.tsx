interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps<T extends string> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  disabled?: boolean;
}

export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  disabled,
}: RadioGroupProps<T>) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isChecked = value === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              isChecked
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={() => onChange(option.value)}
              disabled={isDisabled}
              className="mt-0.5 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="mt-1 text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
