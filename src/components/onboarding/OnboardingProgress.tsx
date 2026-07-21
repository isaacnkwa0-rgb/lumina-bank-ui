"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  completedSteps: number[];
}

// Phone verification (step 6) is disabled — omitted from display
const STAGES = [
  { label: "Welcome",     step: 1  },
  { label: "Eligibility", step: 2  },
  { label: "Personal",    step: 3  },
  { label: "Contact",     step: 4  },
  { label: "Email",       step: 5  },
  { label: "Address",     step: 7  },
  { label: "Finances",    step: 8  },
  { label: "Identity",    step: 9  },
  { label: "Review",      step: 10 },
  { label: "Consent",     step: 11 },
  { label: "Complete",    step: 12 },
];

function OnboardingProgress({ currentStep, completedSteps }: OnboardingProgressProps) {
  const totalSteps = STAGES.length;
  const currentIdx = STAGES.findIndex((s) => s.step === currentStep);
  const stageName = STAGES[currentIdx]?.label ?? "";

  return (
    <>
      <div className="hidden lg:flex items-center w-full">
        {STAGES.map(({ label, step }, idx) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors",
                    isCompleted && "bg-green-500 border-green-500",
                    isCurrent && "bg-[#DB0011] border-[#DB0011]",
                    isUpcoming && "bg-white border-[#E3E3E3]"
                  )}
                >
                  {isCompleted ? (
                    <Check size={13} className="text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isCurrent ? "text-white" : "text-[#CCCCCC]"
                      )}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    isCompleted && "text-green-600",
                    isCurrent && "text-[#DB0011] font-bold",
                    isUpcoming && "text-[#AAAAAA]"
                  )}
                >
                  {label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mb-5",
                    completedSteps.includes(step) ? "bg-green-400" : "bg-[#E3E3E3]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="lg:hidden">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs font-semibold text-[#333333]">
            Step {currentIdx + 1} of {totalSteps} &mdash; {stageName}
          </span>
          <span className="text-xs text-[#767676]">
            {Math.round((currentIdx / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-1 w-full bg-[#E3E3E3] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#DB0011] rounded-full transition-all duration-500"
            style={{ width: `${(currentIdx / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}

export { OnboardingProgress };
export type { OnboardingProgressProps };
