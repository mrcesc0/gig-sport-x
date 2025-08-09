import styles from './InputWithControls.module.css';

import { useCallback, useEffect, useState } from 'react';

interface InputWithControlsProps {
  min?: number;
  max?: number;
  step?: string;
  defaultValue: number;
  ariaLabel: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  pattern?: string;
  onValueChange?: (newValue: number) => void;
}

/**
 * A numeric input component with increment and decrement buttons.
 *
 * `InputWithControls` provides a reusable number input field that includes
 * two buttons to increase or decrease the value. It supports decimal steps, min/max limits,
 * two-digit precision formatting, and integrates accessibility and keyboard input.
 *
 * ## Features:
 * - Accepts `step`, `min`, and `max` props to constrain the input
 * - Handles decimal precision (rounded to 2 decimals)
 * - Falls back to step `1` if step is `"any"`
 * - Notifies parent with `onValueChange` whenever the value changes
 * - Fully accessible with ARIA attributes and labels
 */
export function InputWithControls({
  min,
  max,
  required,
  disabled,
  ariaLabel,
  placeholder,
  autoFocus,
  defaultValue,
  pattern,
  step = 'any',
  onValueChange,
}: InputWithControlsProps) {
  const [value, setValue] = useState<number>(defaultValue);

  // Fallback step when "any" is provided
  const numericStep = step === 'any' ? 1 : Number(step);

  /**
   * Handles manual user input (keyboard typing) and updates the state.
   */
  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { valueAsNumber } = event.target as unknown as HTMLInputElement & {
        valueAsNumber: number;
      };
      setValue(valueAsNumber);
    },
    []
  );

  /**
   * Decreases the value by `step`, respecting the `min` limit and rounding to 2 decimals.
   */
  const decrease = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement>) => {
      setValue((currentValue = 0) => {
        const newValue = parseFloat((currentValue - numericStep).toFixed(2));
        const minValue = Number(min);

        if (isNaN(minValue)) return newValue;

        return newValue >= minValue ? newValue : minValue;
      });
    },
    [numericStep, min]
  );

  /**
   * Increases the value by `step`, respecting the `max` limit and rounding to 2 decimals.
   */
  const increase = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement>) => {
      setValue((currentValue) => {
        const newValue = parseFloat((currentValue + numericStep).toFixed(2));
        const maxValue = Number(max);

        if (isNaN(maxValue)) return newValue;

        return newValue <= maxValue ? newValue : maxValue;
      });
    },
    [numericStep, max]
  );

  /**
   * Notifies parent whenever `value` changes.
   */
  useEffect(() => {
    onValueChange?.(value);
  }, [onValueChange, value]);

  return (
    <div className={styles.inputWithControls}>
      <button type="button" className={styles.inputBtn} onClick={decrease}>
        -
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        className={styles.input}
        pattern={pattern}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel}
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={value}
        onInput={handleInput}
      />
      <button type="button" className={styles.inputBtn} onClick={increase}>
        +
      </button>
    </div>
  );
}
