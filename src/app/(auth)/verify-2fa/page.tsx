"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type Mode = "totp" | "email" | "recovery";

function getInitialMode(method: string): Mode {
  if (method === "EMAIL") return "email";
  return "totp";
}

const MAX_WARM_RETRIES = 4;

function isColdStart(err: unknown): { yes: boolean; retryAfter: number } {
  const e = err as {
    response?: {
      status?: number;
      data?: { error?: { code?: string; retryAfter?: number } };
    };
  };
  const code = e.response?.data?.error?.code;
  const status = e.response?.status;
  const yes =
    code === "SYS_WARMING" ||
    !e.response ||
    status === 502 ||
    status === 503 ||
    status === 504;
  return { yes, retryAfter: e.response?.data?.error?.retryAfter ?? 10 };
}

export default function VerifyTwoFactorPage() {
  const { verifyTwoFactor, verifyTwoFactorWithRecovery } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<string>("TOTP");
  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const tempToken = sessionStorage.getItem("lumina_2fa_temp");
    if (!tempToken) { router.replace("/login"); return; }
    const m = sessionStorage.getItem("lumina_2fa_method") ?? "TOTP";
    setMethod(m);
    setMode(getInitialMode(m));
  }, [router]);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setWarmingUp(false);
    setCode(["", "", "", "", "", ""]);
    setRecoveryCode("");
  }

  async function submit(fullCode?: string) {
    const val = mode === "recovery" ? recoveryCode.trim() : (fullCode ?? code.join(""));
    if (!val || (mode !== "recovery" && val.length < 6)) return;
    setError("");
    setWarmingUp(false);
    setLoading(true);

    for (let attempt = 0; attempt <= MAX_WARM_RETRIES; attempt++) {
      try {
        if (mode === "recovery") {
          await verifyTwoFactorWithRecovery(val);
        } else {
          await verifyTwoFactor(val);
        }
        setWarmingUp(false);
        setLoading(false);
        return;
      } catch (err: unknown) {
        const { yes, retryAfter } = isColdStart(err);

        if (yes && attempt < MAX_WARM_RETRIES) {
          setWarmingUp(true);
          await new Promise<void>((resolve) => setTimeout(resolve, retryAfter * 1000));
          setWarmingUp(false);
          continue;
        }

        setWarmingUp(false);
        setLoading(false);
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          "Invalid or expired code. Please try again.";
        setError(msg);
        if (mode !== "recovery") {
          setCode(["", "", "", "", "", ""]);
          setTimeout(() => inputs.current[0]?.focus(), 50);
        }
        return;
      }
    }

    setWarmingUp(false);
    setLoading(false);
  }

  async function handleResend() {
    const tempToken = sessionStorage.getItem("lumina_2fa_temp");
    if (!tempToken || resending) return;
    setResending(true);
    try {
      await authApi.resend2FA(tempToken);
      setResent(true);
      setError("");
      setTimeout(() => setResent(false), 60000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to resend. Please wait 60 seconds.");
    } finally {
      setResending(false);
    }
  }

  function handleChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    else if (val && idx === 5) submit(next.join(""));
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setCode(pasted.split("")); inputs.current[5]?.focus(); submit(pasted); }
  }

  const isEmailMethod = method === "EMAIL" || method === "BOTH";
  const isTotpMethod = method === "TOTP" || method === "BOTH";

  const headings: Record<Mode, string> = {
    totp: "Authenticator code",
    email: "Email verification code",
    recovery: "Recovery code",
  };
  const subtitles: Record<Mode, string> = {
    totp: "Enter the 6-digit code from your authenticator app.",
    email: "Enter the 6-digit code sent to your email address.",
    recovery: "Enter one of your saved recovery codes to access your account.",
  };
  const icons: Record<Mode, React.ReactNode> = {
    totp: <ShieldCheck size={20} className="text-[#DB0011]" />,
    email: <Mail size={20} className="text-[#DB0011]" />,
    recovery: <KeyRound size={20} className="text-[#DB0011]" />,
  };

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          {icons[mode]}
          <h1 className="text-xl font-semibold text-[#333333]">{headings[mode]}</h1>
        </div>
        <p className="text-sm text-[#767676]">{subtitles[mode]}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="px-6 py-6">
        {warmingUp && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-sm mb-5">
            <p className="text-sm text-amber-700 font-medium">Connecting to server, please wait…</p>
          </div>
        )}

        {error && !warmingUp && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm mb-5">
            <p className="text-sm text-[#DB0011] font-medium">{error}</p>
          </div>
        )}

        {resent && !warmingUp && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-sm mb-5">
            <p className="text-sm text-green-700 font-medium">A new code has been sent to your email.</p>
          </div>
        )}

        {mode !== "recovery" ? (
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
            <p className="text-xs text-[#AAAAAA] text-center mt-2">8-character code — each can only be used once.</p>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={loading}>
          Verify
        </Button>

        {/* Resend button for email modes */}
        {mode === "email" && (
          <p className="text-center text-sm text-[#767676] mt-3">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resent || resending}
              className="text-[#DB0011] hover:underline disabled:opacity-40"
            >
              {resending ? "Sending…" : resent ? "Code sent" : "Resend code"}
            </button>
          </p>
        )}

        {/* Method switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-[#F0F0F0]">
          <Link href="/login" className="text-sm text-[#767676] hover:text-[#333]">
            Back to login
          </Link>
          <div className="flex gap-3 text-sm flex-wrap">
            {isTotpMethod && mode !== "totp" && (
              <button type="button" onClick={() => switchMode("totp")} className="text-[#DB0011] hover:underline">
                Use authenticator app
              </button>
            )}
            {isEmailMethod && mode !== "email" && (
              <button type="button" onClick={() => switchMode("email")} className="text-[#DB0011] hover:underline">
                Use email code
              </button>
            )}
            {mode !== "recovery" && (
              <button type="button" onClick={() => switchMode("recovery")} className="text-[#767676] hover:text-[#333]">
                Use recovery code
              </button>
            )}
            {mode === "recovery" && (
              <button type="button" onClick={() => switchMode(getInitialMode(method))} className="text-[#DB0011] hover:underline">
                Back
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="bg-[#F8F8F8] border-t border-[#E3E3E3] px-6 py-4">
        <p className="text-xs text-[#767676]">
          <span className="font-medium text-[#333333]">Lost access? </span>
          Contact <a href="mailto:support@luminabank.online" className="text-[#DB0011] hover:underline">support@luminabank.online</a>
        </p>
      </div>
    </div>
  );
}
