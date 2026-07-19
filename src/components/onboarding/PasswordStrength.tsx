"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

function getScore(password: string): number {
  if (!password) return 0;
  if (password.length < 8) return 1;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 10 && hasUpper && hasNumber && hasSpecial) return 4;
  if (hasUpper && hasNumber) return 3;
  if (hasUpper || hasNumber) return 2;
  return 1;
}

const scoreLabel: Record<number, string> = {
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

const scoreColor: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-amber-500",
  3: "bg-yellow-400",
  4: "bg-green-500",
};

const scoreLabelColor: Record<number, string> = {
  1: "text-red-600",
  2: "text-amber-600",
  3: "text-yellow-600",
  4: "text-green-600",
};

function Req({ met, label, recommended }: { met: boolean; label: string; recommended?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check size={13} className="text-green-500 flex-shrink-0" />
      ) : (
        <X size={13} className="text-[#CCCCCC] flex-shrink-0" />
      )}
      <span className={cn("text-xs", met ? "text-green-700" : "text-[#767676]")}>
        {label}
        {recommended && !met && (
          <span className="ml-1 text-[#AAAAAA]">(recommended)</span>
        )}
      </span>
    </div>
  );
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = getScore(password);
  const hasMin8 = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((seg) => (
            <div
              key={seg}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                score >= seg ? scoreColor[score] : "bg-[#E3E3E3]"
              )}
            />
          ))}
        </div>
        {score > 0 && (
          <span className={cn("text-xs font-semibold", scoreLabelColor[score])}>
            {scoreLabel[score]}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <Req met={hasMin8} label="At least 8 characters" />
        <Req met={hasUpper} label="One uppercase letter" />
        <Req met={hasNumber} label="One number" />
        <Req met={hasSpecial} label="One special character" recommended />
      </div>
    </div>
  );
}

export { PasswordStrength };
export type { PasswordStrengthProps };
