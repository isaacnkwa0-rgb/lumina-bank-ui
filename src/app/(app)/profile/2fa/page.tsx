"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  Shield, ShieldCheck, Mail, Smartphone, Layers,
  ChevronLeft, CheckCircle2, Copy, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";

type Method = "TOTP" | "EMAIL" | "BOTH";
type Step =
  | "overview"
  | "pick-method"
  | "setup-totp"     // show QR
  | "enable-totp"    // enter authenticator code
  | "enable-email"   // enter email OTP
  | "disable"
  | "done"
  | "recovery";

function OtpInput({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder={placeholder ?? "000000"}
        className="w-full text-center text-3xl font-bold tracking-[0.6em] font-mono px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-[#333]"
      />
    </div>
  );
}

function PasswordInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="current-password"
        className="w-full px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-[#333] text-sm"
      />
    </div>
  );
}

export default function TwoFAPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("overview");
  const [selectedMethod, setSelectedMethod] = useState<Method>("TOTP");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [resent, setResent] = useState(false);

  const twoFaEnabled = (user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ?? false;
  const currentMethod = ((user as { twoFactorMethod?: string })?.twoFactorMethod ?? "TOTP") as Method;

  async function startSetup(method: Method) {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.setup2FA(method);
      const data = res.data.data;
      setSelectedMethod(method);
      if (method === "EMAIL") {
        setMaskedEmail(data.maskedEmail ?? "");
        setStep("enable-email");
      } else {
        setQrUrl(data.qrCode ?? "");
        setSecret(data.secret ?? "");
        setStep("setup-totp");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to start 2FA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable() {
    if (token.length < 6) { setError("Enter the 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.enable2FA(token, selectedMethod);
      await refreshUser();
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

  async function handleResendSetupOtp() {
    if (resent) return;
    setLoading(true);
    try {
      await authApi.setup2FA(selectedMethod);
      setResent(true);
      setError("");
      setTimeout(() => setResent(false), 60000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Please wait 60 seconds before resending.");
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

  async function handleRequestDisableCode() {
    // For EMAIL method, request a fresh OTP before showing the disable form
    setError("");
    setLoading(true);
    try {
      await authApi.setup2FA("EMAIL");
      setToken(""); setPassword(""); setError("");
      setStep("disable");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    if (!password) { setError("Enter your password."); return; }
    if (token.length < 6) { setError("Enter the 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.disable2FA(token, password);
      await refreshUser();
      setStep("done");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid code or password. Please try again.");
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

  const methodCards: { value: Method; icon: React.ReactNode; title: string; desc: string }[] = [
    {
      value: "TOTP",
      icon: <Smartphone size={20} className="text-[#DB0011]" />,
      title: "Authenticator app",
      desc: "Use Google Authenticator, Authy, or any TOTP app to generate codes.",
    },
    {
      value: "EMAIL",
      icon: <Mail size={20} className="text-[#DB0011]" />,
      title: "Email code",
      desc: "A 6-digit code is emailed to you each time you sign in.",
    },
    {
      value: "BOTH",
      icon: <Layers size={20} className="text-[#DB0011]" />,
      title: "Both methods",
      desc: "Use either your authenticator app or email — whichever is available.",
    },
  ];

  const methodLabel: Record<Method, string> = {
    TOTP: "Authenticator app",
    EMAIL: "Email code",
    BOTH: "Both methods",
  };

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white lg:px-10">
        <button onClick={() => { if (step === "overview") router.back(); else setStep("overview"); }}
          className="flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
          <ChevronLeft size={16} /> {t("profile2fa.back")}
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">{t("profile2fa.title")}</h1>
        </div>
        <p className="text-white/60 text-sm">{t("profile2fa.subtitle")}</p>
      </div>

      <div className="px-4 -mt-6 lg:max-w-2xl lg:mx-auto">
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
                  {twoFaEnabled && (
                    <p className="text-xs mt-0.5 text-green-700">Method: {methodLabel[currentMethod]}</p>
                  )}
                  {!twoFaEnabled && (
                    <p className="text-xs mt-0.5 text-amber-700">{t("profile2fa.disabledDesc")}</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#767676] leading-relaxed">{t("profile2fa.how")}</p>
              <ErrorBanner />

              {twoFaEnabled ? (
                <div className="space-y-2">
                  <button onClick={handleRegenerateCodes} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#E3E3E3] text-sm font-semibold text-[#555] hover:border-[#DB0011] hover:text-[#DB0011] disabled:opacity-50 transition-colors">
                    <RefreshCw size={14} /> {t("profile2fa.recoveryCodes")}
                  </button>
                  <button
                    onClick={() => {
                      setToken(""); setPassword(""); setError("");
                      if (currentMethod === "EMAIL") {
                        handleRequestDisableCode();
                      } else {
                        setStep("disable");
                      }
                    }}
                    className="w-full py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-bold hover:bg-red-50 transition-colors">
                    {t("profile2fa.disable")}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setError(""); setStep("pick-method"); }}
                  className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] transition-colors">
                  {t("profile2fa.setUp")}
                </button>
              )}
            </>
          )}

          {/* ── Pick method ── */}
          {step === "pick-method" && (
            <>
              <h2 className="text-base font-bold text-[#333]">Choose your 2FA method</h2>
              <p className="text-sm text-[#767676]">Select how you want to verify your identity when signing in.</p>
              <ErrorBanner />
              <div className="space-y-3">
                {methodCards.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMethod(m.value)}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${selectedMethod === m.value ? "border-[#DB0011] bg-red-50/40" : "border-[#E3E3E3] hover:border-[#DB0011]/40"}`}>
                    <div className="mt-0.5 flex-shrink-0">{m.icon}</div>
                    <div>
                      <p className="text-sm font-bold text-[#333]">{m.title}</p>
                      <p className="text-xs text-[#767676] mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => startSetup(selectedMethod)}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors">
                {loading ? "Setting up…" : "Continue"}
              </button>
            </>
          )}

          {/* ── QR scan ── */}
          {step === "setup-totp" && (
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
              <button onClick={() => { setToken(""); setError(""); setStep("enable-totp"); }}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] transition-colors">
                {t("profile2fa.scanned")}
              </button>
            </>
          )}

          {/* ── Confirm TOTP code ── */}
          {step === "enable-totp" && (
            <>
              <h2 className="text-base font-bold text-[#333]">{t("profile2fa.step2")}</h2>
              <p className="text-sm text-[#767676]">{t("profile2fa.step2Desc")}</p>
              <ErrorBanner />
              <OtpInput value={token} onChange={setToken} label={t("profile2fa.codeLabel")} />
              <button onClick={handleEnable} disabled={loading || token.length < 6}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors">
                {loading ? t("profile2fa.verifying") : t("profile2fa.enableBtn")}
              </button>
            </>
          )}

          {/* ── Confirm email OTP ── */}
          {step === "enable-email" && (
            <>
              <h2 className="text-base font-bold text-[#333]">Verify your email</h2>
              <p className="text-sm text-[#767676]">
                We sent a 6-digit code to <span className="font-semibold text-[#333]">{maskedEmail}</span>. Enter it below to enable email 2FA.
              </p>
              <ErrorBanner />
              {resent && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-green-700">A new code has been sent.</p>
                </div>
              )}
              <OtpInput value={token} onChange={setToken} label="Email code" />
              <button onClick={handleEnable} disabled={loading || token.length < 6}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors">
                {loading ? "Verifying…" : "Enable 2FA"}
              </button>
              <p className="text-center text-sm text-[#767676]">
                Didn&apos;t receive it?{" "}
                <button type="button" onClick={handleResendSetupOtp} disabled={resent || loading}
                  className="text-[#DB0011] hover:underline disabled:opacity-40">
                  {resent ? "Code sent" : "Resend"}
                </button>
              </p>
            </>
          )}

          {/* ── Disable ── */}
          {step === "disable" && (
            <>
              <h2 className="text-base font-bold text-[#333]">{t("profile2fa.disableTitle")}</h2>
              <p className="text-sm text-[#767676]">
                {currentMethod === "EMAIL"
                  ? "Enter your password and the code sent to your email."
                  : t("profile2fa.disableDesc")}
              </p>
              <ErrorBanner />
              <PasswordInput value={password} onChange={setPassword} label="Password" />
              <OtpInput
                value={token}
                onChange={setToken}
                label={currentMethod === "EMAIL" ? "Email code" : t("profile2fa.codeLabel")}
              />
              <button onClick={handleDisable} disabled={loading || token.length < 6 || !password}
                className="w-full py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-bold hover:bg-red-50 disabled:opacity-60 transition-colors">
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
                onClick={() => navigator.clipboard?.writeText(recoveryCodes.join("\n")).catch(() => {})}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-[#E3E3E3] text-sm font-semibold text-[#555] hover:border-[#DB0011] hover:text-[#DB0011] transition-colors">
                <Copy size={14} /> {t("profile2fa.copyAll")}
              </button>
              <button onClick={() => router.push("/profile")}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b8000e] transition-colors">
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
              <button onClick={() => router.push("/profile")}
                className="bg-[#DB0011] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#b8000e] transition-colors">
                {t("profile2fa.backToProfile")}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
