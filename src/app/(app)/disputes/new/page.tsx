"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { disputesApi } from "@/lib/api";

const SUBJECTS = [
  "Unauthorised transaction",
  "Incorrect amount charged",
  "Transaction not received",
  "Duplicate charge",
  "Refund not received",
  "Other issue",
];

function NewDisputeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const txId = params.get("txId") ?? undefined;
  const txRef = params.get("txRef") ?? "";
  const txDesc = params.get("txDesc") ?? "";

  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [description, setDescription] = useState(
    txRef ? `Transaction reference: ${txRef}\n\n` : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalSubject = subject === "Other issue" ? customSubject.trim() : subject;
    if (!finalSubject) { setError("Please select or enter a subject."); return; }
    if (description.trim().length < 20) { setError("Please provide more detail (at least 20 characters)."); return; }
    setError("");
    setLoading(true);
    try {
      await disputesApi.create({ subject: finalSubject, description: description.trim(), transactionId: txId });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to submit dispute. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto pb-10">
        <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
            <ChevronLeft size={16} /> Back
          </button>
          <h1 className="text-lg font-bold">Report an issue</h1>
        </div>
        <div className="px-4 -mt-6">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#333] mb-2">Dispute submitted</h2>
            <p className="text-sm text-[#767676] mb-6">
              We&apos;ve received your dispute and will review it within 3–5 business days. You&apos;ll be notified of any updates.
            </p>
            <button
              onClick={() => router.push("/transactions")}
              className="bg-[#DB0011] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#b8000e] transition-colors"
            >
              Back to transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-10">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle size={18} className="text-white/80" />
          <h1 className="text-lg font-bold">Report an issue</h1>
        </div>
        <p className="text-white/60 text-sm">Tell us what went wrong and we&apos;ll investigate.</p>
      </div>

      <div className="px-4 -mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 space-y-5">
          {txRef && (
            <div className="bg-[#F8F8F8] rounded-xl px-4 py-3 border border-[#E8E8E8]">
              <p className="text-xs text-[#AAAAAA] mb-0.5">Relating to transaction</p>
              <p className="text-sm font-mono font-semibold text-[#333]">{txRef}</p>
              {txDesc && <p className="text-xs text-[#767676] mt-0.5 truncate">{txDesc}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-2">Issue type</label>
            <div className="space-y-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    subject === s
                      ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                      : "border-[#E8E8E8] text-[#333] hover:border-[#CCC]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {subject === "Other issue" && (
            <div>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Describe the issue</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Brief title for your issue"
                className="w-full px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-sm text-[#333]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Please describe the issue in as much detail as possible..."
              className="w-full px-4 py-3 border-2 border-[#E3E3E3] rounded-xl focus:outline-none focus:border-[#DB0011] text-sm text-[#333] resize-none"
            />
            <p className="text-xs text-[#AAAAAA] mt-1">{description.trim().length} characters (min 20)</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-[#DB0011]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !subject}
            className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b8000e] disabled:opacity-60 transition-colors"
          >
            {loading ? "Submitting…" : "Submit dispute"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewDisputePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-6 w-6 border-2 border-[#DB0011] border-t-transparent rounded-full" /></div>}>
      <NewDisputeForm />
    </Suspense>
  );
}
