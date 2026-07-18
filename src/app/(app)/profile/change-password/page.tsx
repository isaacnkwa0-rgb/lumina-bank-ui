"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent]         = useState("");
  const [next, setNext]               = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);

  const rules = [
    { label: "At least 8 characters", ok: next.length >= 8 },
    { label: "Contains a number",     ok: /\d/.test(next) },
    { label: "Contains a letter",     ok: /[a-zA-Z]/.test(next) },
    { label: "Passwords match",       ok: next.length > 0 && next === confirm },
  ];
  const allOk = rules.every((r) => r.ok);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allOk) return;
    setError(""); setSubmitting(true);
    try {
      await authApi.changePassword(current, next);
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to change password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Lock size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Change password</h1>
            <p className="text-white/60 text-xs mt-0.5">Keep your account secure</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {success ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="text-lg font-bold text-[#333]">Password changed</p>
            <p className="text-sm text-[#767676] mt-1">You&apos;ve been signed out of all devices. Redirecting…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">
                Current password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 pr-10 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#555]"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNext ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 pr-10 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#555]"
                >
                  {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-3 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]"
                autoComplete="new-password"
              />
            </div>

            {/* Rules checklist */}
            {next.length > 0 && (
              <div className="space-y-1.5 bg-[#F8F8F8] rounded-xl p-3">
                {rules.map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-green-500" : "bg-[#E0E0E0]"}`}>
                      {ok && (
                        <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4l2.5 2.5L9 1" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${ok ? "text-green-700 font-medium" : "text-[#AAAAAA]"}`}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-[#DB0011]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !allOk || !current}
              className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
            >
              {submitting ? "Changing password…" : "Change password"}
            </button>

            <p className="text-xs text-[#AAAAAA] text-center">
              Changing your password will sign you out of all devices.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
