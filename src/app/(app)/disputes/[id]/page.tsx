"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { disputesApi, type Dispute } from "@/lib/api";
import {
  AlertCircle, CheckCircle2, Clock, XCircle, Search,
  ArrowLeft, FileText, Tag, CalendarDays, Hash, X,
} from "lucide-react";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";

function statusConfig(status: string) {
  switch (status) {
    case "OPEN":         return { label: "Open",         color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  icon: Clock };
    case "UNDER_REVIEW": return { label: "Under review", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   icon: Search };
    case "RESOLVED":     return { label: "Resolved",     color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  icon: CheckCircle2 };
    case "REJECTED":     return { label: "Rejected",     color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    icon: XCircle };
    default:             return { label: status,          color: "text-[#767676]",  bg: "bg-[#F5F5F5]", border: "border-[#E8E8E8]",  icon: AlertCircle };
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const TIMELINE: { status: Dispute["status"]; label: string; description: string }[] = [
  { status: "OPEN",         label: "Submitted",     description: "Your dispute has been received." },
  { status: "UNDER_REVIEW", label: "Under review",  description: "Our team is investigating your case." },
  { status: "RESOLVED",     label: "Resolved",      description: "Your dispute has been resolved." },
];

function Timeline({ dispute }: { dispute: Dispute }) {
  const order: Dispute["status"][] = ["OPEN", "UNDER_REVIEW", "RESOLVED"];
  const currentIdx = order.indexOf(dispute.status);
  const isRejected = dispute.status === "REJECTED";

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4">
      <h2 className="text-sm font-bold text-[#333] mb-4">Status timeline</h2>
      <div className="space-y-0">
        {isRejected ? (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center flex-shrink-0">
                <XCircle size={14} className="text-red-600" />
              </div>
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-red-700">Rejected</p>
              <p className="text-xs text-[#767676] mt-0.5">
                {dispute.resolution ?? "This dispute was not upheld."}
              </p>
              {dispute.resolvedAt && (
                <p className="text-[11px] text-[#AAAAAA] mt-1">{formatDate(dispute.resolvedAt)}</p>
              )}
            </div>
          </div>
        ) : (
          TIMELINE.map((step, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            const last = i === TIMELINE.length - 1;
            return (
              <div key={step.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    active  ? "bg-[#DB0011] border-[#DB0011]" :
                    done    ? "bg-green-500 border-green-500" :
                              "bg-[#F5F5F5] border-[#E8E8E8]"
                  }`}>
                    {done && !active ? (
                      <CheckCircle2 size={14} className="text-white" />
                    ) : active ? (
                      <Clock size={14} className="text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#CCCCCC]" />
                    )}
                  </div>
                  {!last && (
                    <div className={`w-0.5 flex-1 my-1 ${done ? "bg-green-300" : "bg-[#E8E8E8]"}`} style={{ minHeight: 24 }} />
                  )}
                </div>
                <div className="pb-5">
                  <p className={`text-sm font-semibold ${active ? "text-[#DB0011]" : done ? "text-green-700" : "text-[#AAAAAA]"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-[#767676] mt-0.5">{step.description}</p>
                  {step.status === "RESOLVED" && done && dispute.resolution && (
                    <p className="text-xs text-green-700 mt-1 font-medium">{dispute.resolution}</p>
                  )}
                  {step.status === "RESOLVED" && done && dispute.resolvedAt && (
                    <p className="text-[11px] text-[#AAAAAA] mt-1">{formatDate(dispute.resolvedAt)}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    disputesApi.get(id)
      .then((r) => setDispute(r.data.data))
      .catch(() => setError("Could not load dispute."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClose = useCallback(async () => {
    if (!dispute) return;
    setClosing(true);
    try {
      const r = await disputesApi.close(dispute.id);
      setDispute(r.data.data);
      setConfirmClose(false);
    } catch {
      setError("Failed to close dispute. Please try again.");
    } finally {
      setClosing(false);
    }
  }, [dispute]);

  return (
    <div className="max-w-lg mx-auto lg:max-w-2xl pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {loading ? (
              <>
                <SkeletonBlock className="h-5 w-48 bg-white/20 rounded mb-2" />
                <SkeletonBlock className="h-3 w-32 bg-white/20 rounded" />
              </>
            ) : dispute ? (
              <>
                <h1 className="text-base font-bold leading-snug">{dispute.subject}</h1>
                <p className="text-white/60 text-xs mt-1">Filed {formatDate(dispute.createdAt)}</p>
              </>
            ) : null}
          </div>
          {dispute && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusConfig(dispute.status).color} ${statusConfig(dispute.status).bg} ${statusConfig(dispute.status).border}`}>
              {(() => { const Icon = statusConfig(dispute.status).icon; return <Icon size={10} />; })()}
              {statusConfig(dispute.status).label}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="px-4 -mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-32 w-full rounded-2xl" />)
        ) : !dispute ? null : (
          <>
            {/* Timeline */}
            <Timeline dispute={dispute} />

            {/* Details */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4 space-y-4">
              <h2 className="text-sm font-bold text-[#333]">Dispute details</h2>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-[#767676]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wide mb-0.5">Description</p>
                  <p className="text-sm text-[#333] whitespace-pre-wrap">{dispute.description}</p>
                </div>
              </div>

              {dispute.transactionId && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                    <Hash size={14} className="text-[#767676]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wide mb-0.5">Linked transaction</p>
                    <p className="text-sm font-mono text-[#333]">{dispute.transactionId}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <Tag size={14} className="text-[#767676]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wide mb-0.5">Reference ID</p>
                  <p className="text-sm font-mono text-[#333]">{dispute.id}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={14} className="text-[#767676]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wide mb-0.5">Filed on</p>
                  <p className="text-sm text-[#333]">{formatDate(dispute.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Close action — only for OPEN disputes */}
            {dispute.status === "OPEN" && (
              <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4">
                <h2 className="text-sm font-bold text-[#333] mb-1">Withdraw dispute</h2>
                <p className="text-xs text-[#767676] mb-4">
                  If the issue has been resolved or you no longer want to proceed, you can close this dispute. This cannot be undone.
                </p>
                <button
                  onClick={() => setConfirmClose(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  <X size={15} />
                  Close this dispute
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm close modal */}
      {confirmClose && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle size={24} className="text-red-600" />
            </div>
            <h3 className="text-base font-bold text-center text-[#333] mb-2">Close dispute?</h3>
            <p className="text-sm text-[#767676] text-center mb-6">
              This will withdraw your dispute and mark it as closed. You won&apos;t be able to reopen it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClose(false)}
                disabled={closing}
                className="flex-1 h-12 rounded-2xl border border-[#E8E8E8] text-sm font-semibold text-[#333] hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={closing}
                className="flex-1 h-12 rounded-2xl bg-[#DB0011] text-white text-sm font-semibold hover:bg-[#B8000E] transition-colors disabled:opacity-60"
              >
                {closing ? "Closing…" : "Yes, close it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
