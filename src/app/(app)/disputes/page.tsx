"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { disputesApi, type Dispute } from "@/lib/api";
import { AlertCircle, CheckCircle2, Clock, XCircle, Search, Plus } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

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
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    disputesApi.list()
      .then((r) => setDisputes(r.data.data))
      .catch(() => setError("Could not load disputes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-12 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">My Disputes</h1>
          </div>
          <button
            onClick={() => router.push("/disputes/new")}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 h-8 rounded-full transition-colors"
          >
            <Plus size={13} />
            Report issue
          </button>
        </div>
        <p className="text-white/60 text-sm">Track the status of your reported issues.</p>
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="px-4 -mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-28 w-full rounded-2xl" />)
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={<AlertCircle size={40} className="text-[#E3E3E3]" />}
            title="No disputes filed"
            description="Spotted an issue? Report it and we'll investigate within 3–5 business days."
          />
        ) : (
          disputes.map((d) => {
            const sc = statusConfig(d.status);
            const Icon = sc.icon;
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-[#333] flex-1 leading-snug">{d.subject}</p>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${sc.color} ${sc.bg} ${sc.border}`}>
                    <Icon size={10} />
                    {sc.label}
                  </span>
                </div>
                <p className="text-xs text-[#767676] line-clamp-2 mb-3">{d.description}</p>
                {d.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
                    <p className="text-[11px] font-semibold text-green-700 mb-0.5">Resolution</p>
                    <p className="text-xs text-green-700">{d.resolution}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-[#AAAAAA]">
                  <span>Filed {formatDate(d.createdAt)}</span>
                  {d.resolvedAt && <span>Resolved {formatDate(d.resolvedAt)}</span>}
                  {d.transactionId && <span className="font-mono">Ref: {d.transactionId.slice(-8)}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
