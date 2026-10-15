"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function VerifyTwoFactorPage() {
  const { verifyTwoFactor } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!sessionStorage.getItem("lumina_2fa_temp")) {
      router.replace("/login");
    }
  }, [router]);

  async function verify(fullCode: string) {
    if (fullCode.length < 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      await verifyTwoFactor(fullCode);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Invalid or expired code. Please try again.";
      setError(msg);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    verify(code.join(""));
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={20} className="text-[#DB0011]" />
          <h1 className="text-xl font-semibold text-[#333333]">Two-factor authentication</h1>
        </div>
        <p className="text-sm text-[#767676]">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm mb-5">
            <p className="text-sm text-[#DB0011] font-medium">{error}</p>
          </div>
        )}

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

        <Button type="submit" fullWidth size="lg" isLoading={loading}>
          Verify
        </Button>

        <p className="text-center text-sm text-[#767676] mt-4">
          <Link href="/login" className="text-[#DB0011] hover:underline">
            Back to login
          </Link>
        </p>
      </form>

      <div className="bg-[#F8F8F8] border-t border-[#E3E3E3] px-6 py-4">
        <p className="text-xs text-[#767676]">
          <span className="font-medium text-[#333333]">Can&apos;t access your app? </span>
          Contact support or use a recovery code if you have one saved.
        </p>
      </div>
    </div>
  );
}
