'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { OtpInputProps } from '@/types/verification';

export const OtpInput: React.FC<OtpInputProps> = ({
  digitCount = 6,
  currentValue,
  onOtpChange,
  isDisabled = false,
  hasError = false,
  isAutoFocused = true,
}) => {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  // Pad or trim value to array of characters
  const digitsArray = React.useMemo(() => {
    const rawDigits = currentValue.split('').slice(0, digitCount);
    while (rawDigits.length < digitCount) {
      rawDigits.push('');
    }
    return rawDigits;
  }, [currentValue, digitCount]);

  React.useEffect(() => {
    if (isAutoFocused && !isDisabled) {
      const firstEmptyIndex = digitsArray.findIndex((digit) => digit === '');
      const targetIndex = firstEmptyIndex === -1 ? digitCount - 1 : firstEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }
  }, [isAutoFocused, isDisabled, digitCount, digitsArray]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const incomingValue = event.target.value;
    const cleanDigits = incomingValue.replace(/\D/g, '');

    if (cleanDigits.length === 0) {
      // Deletion
      const updatedDigits = [...digitsArray];
      updatedDigits[index] = '';
      onOtpChange(updatedDigits.join(''));
      return;
    }

    if (cleanDigits.length === 1) {
      const updatedDigits = [...digitsArray];
      updatedDigits[index] = cleanDigits;
      const combinedValue = updatedDigits.join('');
      onOtpChange(combinedValue);

      // Auto-advance to next input
      if (index < digitCount - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    // Multiple digits pasted into a single box
    handlePastedDigits(cleanDigits);
  };

  const handlePastedDigits = (pastedText: string): void => {
    const numericOnly = pastedText.replace(/\D/g, '').slice(0, digitCount);
    if (numericOnly.length === 0) {
      return;
    }

    onOtpChange(numericOnly);

    const targetFocusIndex = Math.min(numericOnly.length, digitCount - 1);
    inputRefs.current[targetFocusIndex]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    if (event.key === 'Backspace') {
      if (digitsArray[index] === '' && index > 0) {
        // Move focus backward and clear previous box
        event.preventDefault();
        const updatedDigits = [...digitsArray];
        updatedDigits[index - 1] = '';
        onOtpChange(updatedDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < digitCount - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    handlePastedDigits(pastedData);
  };

  return (
    <div
      role="group"
      aria-label="6-digit verification code input"
      className="flex items-center justify-center gap-2 sm:gap-3"
    >
      {digitsArray.map((digitCharacter, digitIndex) => {
        const isCurrentFocused = focusedIndex === digitIndex;
        const hasDigitValue = digitCharacter.length > 0;

        return (
          <input
            key={`otp-box-${digitIndex}`}
            ref={(element) => {
              inputRefs.current[digitIndex] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={digitCount} // Allow paste capture
            autoComplete={digitIndex === 0 ? 'one-time-code' : 'off'}
            value={digitCharacter}
            disabled={isDisabled}
            onChange={(event) => handleInputChange(event, digitIndex)}
            onKeyDown={(event) => handleKeyDown(event, digitIndex)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(digitIndex)}
            onBlur={() => setFocusedIndex(null)}
            aria-label={`Digit ${digitIndex + 1} of ${digitCount}`}
            className={cn(
              'w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl transition-all duration-150',
              'bg-zinc-100/90 dark:bg-zinc-800/80 border select-none focus:outline-none',
              hasError
                ? 'border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400 focus:ring-2 focus:ring-rose-500/30'
                : isCurrentFocused
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 shadow-md shadow-indigo-500/10'
                  : hasDigitValue
                    ? 'border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500',
              isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
            )}
          />
        );
      })}
    </div>
  );
};
