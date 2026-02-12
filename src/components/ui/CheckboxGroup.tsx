interface CheckboxOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface CheckboxGroupProps<T extends string> {
  values: T[];
  onChange: (values: T[]) => void;
  options: CheckboxOption<T>[];
  disabled?: boolean;
}

export function CheckboxGroup<T extends string>({
  values,
  onChange,
  options,
  disabled,
}: CheckboxGroupProps<T>) {
  const handleChange = (optionValue: T, checked: boolean) => {
    if (checked) {
      onChange([...values, optionValue]);
    } else {
      onChange(values.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isChecked = values.includes(option.value);

        return (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              isChecked
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="mt-0.5 text-xs text-gray-500">{option.description}</p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
