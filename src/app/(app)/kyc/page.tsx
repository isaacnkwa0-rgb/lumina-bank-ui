"use client";

import { useEffect, useState, useRef } from "react";
import { kycApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Shield, Upload, CheckCircle2, Clock, XCircle, FileImage, X } from "lucide-react";

type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | null;

interface FileField {
  key: "idFront" | "idBack" | "selfie";
  label: string;
  hint: string;
}


function StatusBanner({ status }: { status: KycStatus }) {
  if (!status || status === "PENDING" && true) return null;
  const cfg = {
    VERIFIED: { bg: "bg-green-50 border-green-200", icon: <CheckCircle2 size={18} className="text-green-600" />, text: "Your identity has been verified.", color: "text-green-800" },
    REJECTED: { bg: "bg-red-50 border-red-200", icon: <XCircle size={18} className="text-[#DB0011]" />, text: "Your KYC was rejected. Please resubmit corrected documents.", color: "text-[#DB0011]" },
    PENDING:  { bg: "bg-amber-50 border-amber-200", icon: <Clock size={18} className="text-amber-600" />, text: "Your documents are under review. We'll notify you when complete.", color: "text-amber-800" },
  }[status];

  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3.5 mb-5 ${cfg.bg}`}>
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
      <p className={`text-sm font-medium ${cfg.color}`}>{cfg.text}</p>
    </div>
  );
}

function FileDropZone({ field, file, onChange, capture }: { field: FileField; file: File | null; onChange: (f: File | null) => void; capture?: "user" | "environment" }) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  }

  return (
    <div>
      <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">
        {field.label} <span className="text-[#DB0011]">*</span>
      </label>
      <p className="text-xs text-[#AAAAAA] mb-2">{field.hint}</p>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-[#E3E3E3] bg-[#F8F8F8]">
          <img src={preview} alt={field.label} className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 h-7 w-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            <X size={14} className="text-[#DB0011]" />
          </button>
          <div className="px-3 py-2 flex items-center gap-2">
            <FileImage size={13} className="text-[#767676]" />
            <span className="text-xs text-[#555] truncate">{file?.name}</span>
            <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 ml-auto" />
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#E3E3E3] rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#DB0011] hover:bg-red-50/30 transition-all"
        >
          <Upload size={22} className="text-[#AAAAAA]" />
          <p className="text-sm text-[#767676]">{t("kyc.tapUpload")}</p>
          <p className="text-xs text-[#CCCCCC]">{t("kyc.uploadFormat")}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        capture={capture}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default function KycPage() {
  const { t } = useLanguage();
  const FIELDS: FileField[] = [
    { key: "idFront", label: t("kyc.idFront"), hint: "Passport, driving licence or national ID (front)" },
    { key: "idBack",  label: t("kyc.idBack"),  hint: "Back of the same document" },
    { key: "selfie",  label: t("kyc.selfie"),  hint: t("kyc.selfieDesc") },
  ];
  const [status, setStatus]     = useState<KycStatus>(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [files, setFiles]       = useState<Record<string, File | null>>({ idFront: null, idBack: null, selfie: null });

  useEffect(() => {
    kycApi.status()
      .then((r) => setStatus(r.data.data.status as KycStatus))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setFile(key: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!files.idFront || !files.idBack || !files.selfie) {
      setError(t("kyc.allRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("idFront", files.idFront);
      fd.append("idBack",  files.idBack);
      fd.append("selfie",  files.selfie);
      await kycApi.submit(fd);
      setSuccess(true);
      setStatus("PENDING");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">{t("kyc.title")}</h1>
        </div>
        <p className="text-white/60 text-sm">
          {t("kyc.subtitle")}
        </p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-[#F0F0F0] rounded w-1/2" />
              <div className="h-36 bg-[#F0F0F0] rounded-xl" />
            </div>
          ) : success || status === "PENDING" ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
                  <Clock size={32} className="text-amber-500" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-[#333] mb-2">{t("kyc.underReview")}</h2>
              <p className="text-sm text-[#767676]">
                {t("kyc.reviewDesc")}
              </p>
            </div>
          ) : status === "VERIFIED" ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-[#333] mb-2">{t("kyc.verified")}</h2>
              <p className="text-sm text-[#767676]">{t("kyc.verifiedDesc")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <StatusBanner status={status} />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-[#DB0011]">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  Upload clear, unedited photos. Documents must be valid and not expired. All data is encrypted and handled in accordance with our privacy policy.
                </p>
              </div>

              {FIELDS.map((f) => (
                <FileDropZone key={f.key} field={f} file={files[f.key]} onChange={(file) => setFile(f.key, file)} capture={f.key === "selfie" ? "user" : undefined} />
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors"
              >
                {submitting ? "Submitting…" : t("kyc.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
