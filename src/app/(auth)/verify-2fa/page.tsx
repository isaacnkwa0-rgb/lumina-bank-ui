"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function VerifyTwoFactorPage() {
  const { verifyTwoFactor, verifyTwoFactorWithRecovery } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"totp" | "recovery">("totp");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!sessionStorage.getItem("lumina_2fa_temp")) {
      router.replace("/login");
    }
  }, [router]);

  function switchMode(next: "totp" | "recovery") {
    setMode(next);
    setError("");
    setCode(["", "", "", "", "", ""]);
    setRecoveryCode("");
  }

  async function submit(fullCode?: string) {
    const val = mode === "recovery" ? recoveryCode.trim() : (fullCode ?? code.join(""));
    if (!val || (mode === "totp" && val.length < 6)) return;
    setError("");
    setLoading(true);
    try {
      if (mode === "recovery") {
        await verifyTwoFactorWithRecovery(val);
      } else {
        await verifyTwoFactor(val);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Invalid or expired code. Please try again.";
      setError(msg);
      if (mode === "totp") {
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) {
      inputs.current[idx + 1]?.focus();
    } else if (val && idx === 5) {
      submit(next.join(""));
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
      submit(pasted);
    }
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          {mode === "totp"
            ? <ShieldCheck size={20} className="text-[#DB0011]" />
            : <KeyRound size={20} className="text-[#DB0011]" />}
          <h1 className="text-xl font-semibold text-[#333333]">
            {mode === "totp" ? "Two-factor authentication" : "Recovery code"}
          </h1>
        </div>
        <p className="text-sm text-[#767676]">
          {mode === "totp"
            ? "Enter the 6-digit code from your authenticator app."
            : "Enter one of your saved recovery codes to access your account."}
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="px-6 py-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm mb-5">
            <p className="text-sm text-[#DB0011] font-medium">{error}</p>
          </div>
        )}

        {mode === "totp" ? (
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
                className="h-14 w-12 border-2 border-[#E3E3E3] rounded-lg text-center text-2xl font-bold text-[#333] focus:outline-none focus:border-[#DB0011] transition-colors font-mono"
              />
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              autoFocus
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, ""))}
              placeholder="e.g. A3F2B1C9"
              maxLength={8}
              className="w-full text-center text-2xl font-bold tracking-[0.3em] font-mono px-4 py-3 border-2 border-[#E3E3E3] rounded-lg focus:outline-none focus:border-[#DB0011] text-[#333] transition-colors"
            />
            <p className="text-xs text-[#AAAAAA] text-center mt-2">8-character code from your recovery list — each code can only be used once.</p>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={loading}>
          Verify
        </Button>

        <div className="flex items-center justify-between mt-4">
          <Link href="/login" className="text-sm text-[#767676] hover:text-[#333]">
            Back to login
          </Link>
          <button
            type="button"
            onClick={() => switchMode(mode === "totp" ? "recovery" : "totp")}
            className="text-sm text-[#DB0011] hover:underline"
          >
            {mode === "totp" ? "Use a recovery code" : "Use authenticator app"}
          </button>
        </div>
      </form>

      <div className="bg-[#F8F8F8] border-t border-[#E3E3E3] px-6 py-4">
        <p className="text-xs text-[#767676]">
          <span className="font-medium text-[#333333]">Lost access? </span>
          Contact <a href="mailto:support@luminabank.online" className="text-[#DB0011] hover:underline">support@luminabank.online</a> for account recovery.
        </p>
      </div>
    </div>
  );
}
