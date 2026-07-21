"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

type Step = "status" | "enter-new" | "confirm-new" | "enter-current" | "success";

export default function TransferPinPage() {
  const router = useRouter();
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("status");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    authApi.getTransferPinStatus()
      .then((r) => { setHasPin(r.data.data.hasPin); setStep("status"); })
      .catch(() => setHasPin(false));
  }, []);

  function PinDots({ value, label, onDone }: { value: string; label: string; onDone?: (v: string) => void }) {
    const [digits, setDigits] = useState(Array(6).fill(""));
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    function handleDigit(idx: number, val: string) {
      const ch = val.replace(/\D/g, "").slice(-1);
      const next = [...digits]; next[idx] = ch; setDigits(next);
      setError("");
      if (ch && idx < 5) refs.current[idx + 1]?.focus();
      else if (ch && idx === 5) {
        const full = [...next].join("");
        if (full.length === 6) {
          if (label === "enter-new") setNewPin(full);
          else if (label === "confirm-new") setConfirmPin(full);
          else if (label === "enter-current") setCurrentPin(full);
          onDone?.(full);
        }
      }
    }

    function handleKeyDown(idx: number, e: React.KeyboardEvent) {
      if (e.key === "Backspace") {
        if (digits[idx]) { const n=[...digits]; n[idx]=""; setDigits(n); }
        else if (idx > 0) refs.current[idx-1]?.focus();
      }
    }

    return (
      <div className="space-y-5">
        <div className="flex gap-3 justify-center">
          {digits.map((d, i) => (
            <div key={i} className="relative">
              <input
                ref={(el) => { refs.current[i] = el; }}
                type="password" inputMode="numeric" maxLength={1} value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="sr-only"
              />
              <div
                onClick={() => refs.current[i]?.focus()}
                className={`h-14 w-11 rounded-xl border-2 flex items-center justify-center cursor-text transition-all
                  ${d ? "border-[#1a1a2e] bg-[#1a1a2e]" : "border-[#E3E3E3] bg-white"}
                  ${!d && digits.filter(Boolean).length === i ? "border-[#DB0011]" : ""}`}
              >
                {d && <div className="h-3 w-3 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
            <button key={i} type="button"
              disabled={k === ""}
              onClick={() => {
                if (k === "⌫") {
                  const last = [...digits].reverse().findIndex(d => d !== "");
                  if (last === -1) return;
                  const idx = 5 - last;
                  const n=[...digits]; n[idx]=""; setDigits(n); setError("");
                  refs.current[idx]?.focus();
                } else {
                  const next = digits.findIndex(d => d === "");
                  if (next === -1) return;
                  handleDigit(next, k);
                }
              }}
              className={`py-4 rounded-xl text-lg font-semibold transition-colors
                ${k === "" ? "invisible" : ""}
                ${k === "⌫" ? "text-[#DB0011] bg-red-50 hover:bg-red-100" : "bg-[#f5f5f5] text-[#222] hover:bg-[#ebebeb]"}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    );
  }

  async function handleSetPin(confirmPinValue?: string) {
    const cp = confirmPinValue ?? confirmPin;
    if (newPin !== cp) { setError("PINs don't match. Please try again."); setConfirmPin(""); setStep("confirm-new"); return; }
    setLoading(true); setError("");
    try {
      await authApi.setupTransferPin(newPin, hasPin ? currentPin : undefined);
      setStep("success");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to set PIN. Please try again.");
      setStep(hasPin ? "enter-current" : "enter-new");
      setNewPin(""); setConfirmPin(""); setCurrentPin("");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-[#1a1a2e] px-4 pt-12 pb-8 text-white">
        <button onClick={() => router.back()} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mb-5">
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
            <KeyRound size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Transfer PIN</h1>
            <p className="text-xs text-white/50 mt-0.5">6-digit payment security PIN</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">

        {/* Status loading */}
        {step === "status" && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#AAAAAA]" />
          </div>
        )}

        {/* Step: enter current PIN (for change) */}
        {step === "enter-current" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-base font-bold text-[#222]">Enter your current PIN</p>
              <p className="text-xs text-[#767676] mt-1">Verify your existing transfer PIN first</p>
            </div>
            {error && <p className="text-xs text-[#DB0011] text-center font-medium">{error}</p>}
            <PinDots value={currentPin} label="enter-current" onDone={() => setStep("enter-new")} />
          </div>
        )}

        {/* Step: set new PIN */}
        {step === "enter-new" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-base font-bold text-[#222]">{hasPin ? "Enter your new PIN" : "Create your transfer PIN"}</p>
              <p className="text-xs text-[#767676] mt-1">Choose a 6-digit PIN you'll remember</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Tips:</strong> Avoid obvious sequences like 123456 or your date of birth. Don't share your PIN with anyone — Lumina Bank staff will never ask for it.
              </p>
            </div>
            {error && <p className="text-xs text-[#DB0011] text-center font-medium">{error}</p>}
            <PinDots value={newPin} label="enter-new" onDone={() => setStep("confirm-new")} />
          </div>
        )}

        {/* Step: confirm new PIN */}
        {step === "confirm-new" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-base font-bold text-[#222]">Confirm your new PIN</p>
              <p className="text-xs text-[#767676] mt-1">Enter the same PIN again to confirm</p>
            </div>
            {error && <p className="text-xs text-[#DB0011] text-center font-medium">{error}</p>}
            <PinDots value={confirmPin} label="confirm-new" onDone={(v) => {
              setConfirmPin(v);
              setTimeout(() => handleSetPin(v), 80);
            }} />
            {loading && (
              <div className="flex items-center justify-center gap-2 text-xs text-[#767676]">
                <Loader2 size={13} className="animate-spin" /> Saving PIN…
              </div>
            )}
          </div>
        )}

        {/* Status: no PIN yet */}
        {step === "status" && hasPin === false && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <KeyRound size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">No transfer PIN set</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">You need a transfer PIN to authorise payments. Set one up now to start making transfers.</p>
              </div>
            </div>
            <button onClick={() => { setStep("enter-new"); setError(""); }}
              className="w-full py-3.5 bg-[#1a1a2e] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#2a2a4e] transition-colors">
              <KeyRound size={16} /> Set up transfer PIN
            </button>
          </div>
        )}

        {/* Status: has PIN */}
        {step === "status" && hasPin === true && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">Transfer PIN is active</p>
                <p className="text-xs text-green-700 mt-1">Your payments are protected with a 6-digit PIN.</p>
              </div>
            </div>
            <button onClick={() => { setStep("enter-current"); setError(""); setHasPin(true); }}
              className="w-full py-3.5 border-2 border-[#1a1a2e] text-[#1a1a2e] text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#f5f5f5] transition-colors">
              <KeyRound size={16} /> Change transfer PIN
            </button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="space-y-6 text-center">
            <div className="h-16 w-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} className="text-green-600" />
            </div>
            <div>
              <p className="text-base font-bold text-[#222]">PIN {hasPin ? "updated" : "created"} successfully</p>
              <p className="text-xs text-[#767676] mt-1.5 leading-relaxed">
                Your transfer PIN is now active. You'll be asked for it whenever you authorise a payment.
              </p>
            </div>
            <button onClick={() => router.back()}
              className="w-full py-3.5 bg-[#1a1a2e] text-white text-sm font-bold rounded-xl">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
