"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Shield, ShieldCheck, ChevronLeft, CheckCircle2, Copy, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";

type Step = "overview" | "setup" | "enable" | "disable" | "done" | "recovery";

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
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("overview");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

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
      const res = await authApi.enable2FA(token);
      if (res.data.data.recoveryCodes?.length) {
        setRecoveryCodes(res.data.data.recoveryCodes);
        setStep("recovery");
      } else {
        setStep("done");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateCodes() {
    setLoading(true);
    try {
      const res = await authApi.regenerateRecoveryCodes();
      setRecoveryCodes(res.data.data.recoveryCodes);
      setStep("recovery");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to regenerate codes.");
    } finally { setLoading(false); }
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
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
          <ChevronLeft size={16} /> {t("profile2fa.back")}
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">{t("profile2fa.title")}</h1>
        </div>
        <p className="text-white/60 text-sm">{t("profile2fa.subtitle")}</p>
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
                    {twoFaEnabled ? t("profile2fa.currentlyEnabled") : t("profile2fa.currentlyDisabled")}
                  </p>
                  <p className={`text-xs mt-0.5 ${twoFaEnabled ? "text-green-700" : "text-amber-700"}`}>
                    {twoFaEnabled ? t("profile2fa.enabledDesc") : t("profile2fa.disabledDesc")}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#767676] leading-relaxed">
                {t("profile2fa.how")}
              </p>

              <ErrorBanner />

              {twoFaEnabled ? (
                <div className="space-y-2">
                  <button
                    onClick={handleRegenerateCodes}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#E3E3E3] text-sm font-semibold text-[#555] hover:border-[#DB0011] hover:text-[#DB0011] disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw size={14} /> {t("profile2fa.recoveryCodes")}
                  </button>
                  <button
                    onClick={() => { setToken(""); setError(""); setStep("disable"); }}
                    className="w-full py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-bold hover:bg-red-50 transition-colors"
                  >
                    {t("profile2fa.disable")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={startSetup}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors"
                >
                  {loading ? "Setting up…" : t("profile2fa.setUp")}
                </button>
              )}
            </>
          )}

          {/* ── QR scan step ── */}
          {step === "setup" && (
            <>
              <h2 className="text-base font-bold text-[#333]">{t("profile2fa.step1")}</h2>
              <p className="text-sm text-[#767676]">{t("profile2fa.step1Desc")}</p>
              {qrUrl && (
                <div className="flex justify-center">
                  <img src={qrUrl} alt="2FA QR code" className="w-48 h-48 border border-[#E3E3E3] rounded-xl p-2" />
                </div>
              )}
              <div className="bg-[#F8F8F8] rounded-xl p-3">
                <p className="text-xs text-[#767676] mb-1">{t("profile2fa.cantScan")}</p>
                <p className="font-mono text-sm font-bold text-[#333] break-all">{secret}</p>
              </div>
              <button
                onClick={() => { setToken(""); setError(""); setStep("enable"); }}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] transition-colors"
              >
                {t("profile2fa.scanned")}
              </button>
            </>
          )}

          {/* ── Confirm code step ── */}
          {step === "enable" && (
            <>
              <h2 className="text-base font-bold text-[#333]">{t("profile2fa.step2")}</h2>
              <p className="text-sm text-[#767676]">{t("profile2fa.step2Desc")}</p>
              <ErrorBanner />
              <OtpInput value={token} onChange={setToken} label={t("profile2fa.codeLabel")} />
              <button
                onClick={handleEnable}
                disabled={loading || token.length < 6}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors"
              >
                {loading ? t("profile2fa.verifying") : t("profile2fa.enableBtn")}
              </button>
            </>
          )}

          {/* ── Disable confirm ── */}
          {step === "disable" && (
            <>
              <h2 className="text-base font-bold text-[#333]">{t("profile2fa.disableTitle")}</h2>
              <p className="text-sm text-[#767676]">{t("profile2fa.disableDesc")}</p>
              <ErrorBanner />
              <OtpInput value={token} onChange={setToken} label={t("profile2fa.codeLabel")} />
              <button
                onClick={handleDisable}
                disabled={loading || token.length < 6}
                className="w-full py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-bold hover:bg-red-50 disabled:opacity-60 transition-colors"
              >
                {loading ? t("profile2fa.disabling") : t("profile2fa.confirmDisable")}
              </button>
              <button onClick={() => setStep("overview")} className="w-full text-sm text-[#767676] hover:text-[#333]">
                Cancel
              </button>
            </>
          )}

          {/* ── Recovery codes ── */}
          {step === "recovery" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Shield size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-semibold">{t("profile2fa.recoveryDesc")} {t("profile2fa.eachOnce")}</p>
              </div>
              <h2 className="text-base font-bold text-[#333]">{t("profile2fa.recoveryTitle")}</h2>
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code) => (
                  <div key={code} className="font-mono text-sm font-bold text-[#333] bg-[#F5F5F5] rounded-lg px-3 py-2 text-center tracking-widest">
                    {code}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const text = recoveryCodes.join("\n");
                  navigator.clipboard?.writeText(text).catch(() => {});
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-[#E3E3E3] text-sm font-semibold text-[#555] hover:border-[#DB0011] hover:text-[#DB0011] transition-colors"
              >
                <Copy size={14} /> {t("profile2fa.copyAll")}
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b8000e] transition-colors"
              >
                {t("profile2fa.savedCodes")}
              </button>
            </div>
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
                {twoFaEnabled ? t("profile2fa.disabledSuccess") : t("profile2fa.enabledSuccess")}
              </h2>
              <p className="text-sm text-[#767676] mb-6">
                {twoFaEnabled ? t("profile2fa.disabledSuccessDesc") : t("profile2fa.enabledSuccessDesc")}
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="bg-[#DB0011] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#b8000e] transition-colors"
              >
                {t("profile2fa.backToProfile")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
