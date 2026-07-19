"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

const DISMISS_KEY = "kyc_banner_dismissed";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

type KycStatus = "PENDING" | "REJECTED" | "VERIFIED";

function KycBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  const kycStatus = (user as (typeof user & { kycStatus?: KycStatus }) | null)?.kycStatus;

  useEffect(() => {
    if (!kycStatus || kycStatus === "VERIFIED") return;
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw) {
      const dismissedAt = Number(raw);
      if (Date.now() - dismissedAt < THREE_DAYS_MS) return;
    }
    setVisible(true);
  }, [kycStatus]);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  }

  if (!visible || !kycStatus || kycStatus === "VERIFIED") return null;

  if (kycStatus === "PENDING") {
    return (
      <div className="w-full bg-amber-50 px-4 py-3 flex items-start gap-3">
        <Clock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-700">Identity Verification Pending</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Your documents are under review. Some features are limited until approved.
          </p>
        </div>
        <Link
          href="/kyc"
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap"
        >
          Check Status
          <ArrowRight size={12} />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-red-50 px-4 py-3 flex items-start gap-3">
      <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700">Identity Verification Failed</p>
        <p className="text-xs text-red-600 mt-0.5">
          Your documents were not approved. Please resubmit.
        </p>
      </div>
      <Link
        href="/kyc"
        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 transition-colors whitespace-nowrap"
      >
        Resubmit Documents
        <ArrowRight size={12} />
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export { KycBanner };
