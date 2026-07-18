"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [done, setDone] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  async function verify(fullCode: string) {
    if (fullCode.length < 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      await authApi.verifyEmail(fullCode);
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid or expired code. Please try again.");
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
      verify(next.join(""));
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
      verify(pasted);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    verify(code.join(""));
  }

  async function handleResend() {
    try {
      await authApi.resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 30000);
    } catch {}
  }

  if (done) {
    return (
      <div className="bg-white border border-[#E3E3E3] rounded-sm px-6 py-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Email verified</h2>
        <p className="text-sm text-[#767676] mb-6">Your email address has been verified successfully.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-[#DB0011] text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-[#b8000e] transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <Mail size={20} className="text-[#DB0011]" />
          <h1 className="text-xl font-semibold text-[#333333]">Verify your email</h1>
        </div>
        <p className="text-sm text-[#767676]">
          We sent a 6-digit code to your registered email address. Enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm mb-5">
            <p className="text-sm text-[#DB0011] font-medium">{error}</p>
          </div>
        )}

        {resent && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-sm mb-5">
            <p className="text-sm text-green-700 font-medium">A new code has been sent to your email.</p>
          </div>
        )}

        {/* OTP boxes */}
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
              className="h-14 w-12 border-2 border-[#E3E3E3] rounded-lg text-center text-2xl font-bold text-[#333] focus:outline-none focus:border-[#DB0011] transition-colors font-mono"
            />
          ))}
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={loading}>
          Verify email
        </Button>

        <p className="text-center text-sm text-[#767676] mt-4">
          Didn't receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resent}
            className="text-[#DB0011] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resent ? "Code sent" : "Resend"}
          </button>
        </p>
      </form>
    </div>
  );
}
