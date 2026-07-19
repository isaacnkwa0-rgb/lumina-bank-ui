"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
}

function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(idx: number, raw: string) {
    if (!/^\d*$/.test(raw)) return;
    const char = raw.slice(-1);
    const next = digits.map((d, i) => (i === idx ? char : d));
    onChange(next.join(""));
    if (char && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = pasted.padEnd(6, "").slice(0, 6);
    onChange(next);
    const lastFilled = Math.min(pasted.length - 1, 5);
    inputs.current[lastFilled]?.focus();
  }

  return (
    <div>
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={cn(
              "h-14 w-12 border-2 rounded-lg text-center text-2xl font-bold font-mono text-[#333333]",
              "transition-colors duration-150 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-[#DB0011]"
                : "border-[#E3E3E3] focus:border-[#DB0011]"
            )}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-[#DB0011] text-center">{error}</p>
      )}
    </div>
  );
}

export { OtpInput };
export type { OtpInputProps };
