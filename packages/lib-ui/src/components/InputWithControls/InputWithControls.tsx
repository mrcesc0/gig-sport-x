import styles from './InputWithControls.module.css';

import { useCallback, useEffect, useState } from 'react';
import { Observable } from 'rxjs';

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
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getValue$?: () => Observable<number>;
}

type OnChangeEvent = React.ChangeEvent<
  HTMLInputElement & { valueAsNumber: number }
>;

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
  onChange,
  getValue$,
}: InputWithControlsProps) {
  const [value, setValue] = useState<number>(defaultValue);

  const numericStep = step === 'any' ? 1 : Number(step);

  const handleInput = useCallback((event: OnChangeEvent) => {
    const { valueAsNumber } = event.target;
    setValue(valueAsNumber);
  }, []);

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

  useEffect(() => {
    const getValue$$ = getValue$?.().subscribe({
      next: (_value) => setValue(_value),
    });

    return () => {
      getValue$$?.unsubscribe();
    };
  }, [getValue$]);

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
        onChange={(event) => onChange?.(event)}
      />
      <button type="button" className={styles.inputBtn} onClick={increase}>
        +
      </button>
    </div>
  );
}
