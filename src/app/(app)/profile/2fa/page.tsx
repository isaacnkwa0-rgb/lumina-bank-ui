"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Shield, ShieldCheck, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

type Step = "overview" | "setup" | "enable" | "disable" | "done";

function OtpInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        className="w-full text-center text-3xl font-bold tracking-[0.6em] font-mono px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-[#333]"
      />
    </div>
  );
}

export default function TwoFAPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("overview");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const twoFaEnabled = (user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ?? false;

  async function startSetup() {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.setup2FA();
      setQrUrl(res.data.data.qrCode);
      setSecret(res.data.data.secret);
      setStep("setup");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to start 2FA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable() {
    if (token.length < 6) { setError("Enter the 6-digit code from your authenticator app."); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.enable2FA(token);
      setStep("done");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    if (token.length < 6) { setError("Enter the 6-digit code from your authenticator app."); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.disable2FA(token);
      setStep("done");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function ErrorBanner() {
    if (!error) return null;
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <p className="text-sm text-[#DB0011]">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">Two-Factor Authentication</h1>
        </div>
        <p className="text-white/60 text-sm">Add an extra layer of security to your account.</p>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 space-y-5">

          {/* ── Overview ── */}
          {step === "overview" && (
            <>
              <div className={`flex items-center gap-3 p-4 rounded-xl ${twoFaEnabled ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                {twoFaEnabled
                  ? <ShieldCheck size={22} className="text-green-600 flex-shrink-0" />
                  : <Shield size={22} className="text-amber-500 flex-shrink-0" />}
                <div>
                  <p className={`text-sm font-bold ${twoFaEnabled ? "text-green-800" : "text-amber-800"}`}>
                    2FA is currently {twoFaEnabled ? "enabled" : "disabled"}
                  </p>
                  <p className={`text-xs mt-0.5 ${twoFaEnabled ? "text-green-700" : "text-amber-700"}`}>
                    {twoFaEnabled
                      ? "Your account is protected with a TOTP authenticator app."
                      : "Enable 2FA to protect your account from unauthorised access."}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#767676] leading-relaxed">
                Two-factor authentication uses a time-based code from an authenticator app (e.g. Google Authenticator, Authy) each time you log in.
              </p>

              <ErrorBanner />

              {twoFaEnabled ? (
                <button
                  onClick={() => { setToken(""); setError(""); setStep("disable"); }}
                  className="w-full py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={startSetup}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors"
                >
                  {loading ? "Setting up…" : "Set up 2FA"}
                </button>
              )}
            </>
          )}

          {/* ── QR scan step ── */}
          {step === "setup" && (
            <>
              <h2 className="text-base font-bold text-[#333]">Step 1 — Scan QR code</h2>
              <p className="text-sm text-[#767676]">
                Open your authenticator app and scan the QR code below.
              </p>
              {qrUrl && (
                <div className="flex justify-center">
                  <img src={qrUrl} alt="2FA QR code" className="w-48 h-48 border border-[#E3E3E3] rounded-xl p-2" />
                </div>
              )}
              <div className="bg-[#F8F8F8] rounded-xl p-3">
                <p className="text-xs text-[#767676] mb-1">Can't scan? Enter this key manually:</p>
                <p className="font-mono text-sm font-bold text-[#333] break-all">{secret}</p>
              </div>
              <button
                onClick={() => { setToken(""); setError(""); setStep("enable"); }}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] transition-colors"
              >
                I've scanned it →
              </button>
            </>
          )}

          {/* ── Confirm code step ── */}
          {step === "enable" && (
            <>
              <h2 className="text-base font-bold text-[#333]">Step 2 — Confirm code</h2>
              <p className="text-sm text-[#767676]">
                Enter the 6-digit code shown in your authenticator app to complete setup.
              </p>
              <ErrorBanner />
              <OtpInput value={token} onChange={setToken} label="Authenticator code" />
              <button
                onClick={handleEnable}
                disabled={loading || token.length < 6}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors"
              >
                {loading ? "Verifying…" : "Enable 2FA"}
              </button>
            </>
          )}

          {/* ── Disable confirm ── */}
          {step === "disable" && (
            <>
              <h2 className="text-base font-bold text-[#333]">Disable 2FA</h2>
              <p className="text-sm text-[#767676]">
                Enter the current code from your authenticator app to confirm you want to disable 2FA.
              </p>
              <ErrorBanner />
              <OtpInput value={token} onChange={setToken} label="Authenticator code" />
              <button
                onClick={handleDisable}
                disabled={loading || token.length < 6}
                className="w-full py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-bold hover:bg-red-50 disabled:opacity-60 transition-colors"
              >
                {loading ? "Disabling…" : "Confirm disable"}
              </button>
              <button onClick={() => setStep("overview")} className="w-full text-sm text-[#767676] hover:text-[#333]">
                Cancel
              </button>
            </>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-[#333] mb-2">
                {twoFaEnabled ? "2FA disabled" : "2FA enabled"}
              </h2>
              <p className="text-sm text-[#767676] mb-6">
                {twoFaEnabled
                  ? "Two-factor authentication has been turned off."
                  : "Your account is now protected with two-factor authentication."}
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="bg-[#DB0011] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#b8000e] transition-colors"
              >
                Back to profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
