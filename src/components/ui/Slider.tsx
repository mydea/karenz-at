interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  id?: string;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  id,
  disabled,
  formatValue,
  className = '',
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{formatValue ? formatValue(min) : min}</span>
        <span className="font-medium text-primary-600">
          {formatValue ? formatValue(value) : value}
        </span>
        <span className="text-gray-500">{formatValue ? formatValue(max) : max}</span>
      </div>
      <input
        type="range"
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, rgb(220 38 38) 0%, rgb(220 38 38) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
        }}
      />
    </div>
  );
}
