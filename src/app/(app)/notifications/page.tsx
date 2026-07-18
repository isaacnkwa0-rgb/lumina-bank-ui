"use client";

import { useEffect, useState } from "react";
import {
  Bell, Shield, Info, CreditCard, Gift,
  CheckCheck, ArrowDownLeft, ArrowUpRight,
  ArrowLeftRight, Clock, type LucideIcon,
} from "lucide-react";
import { notificationsApi, type Notification } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";
import { SkeletonList } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { isToday, isYesterday, isThisWeek } from "date-fns";

// ── Type config ───────────────────────────────────────────────────────────────

interface TypeConfig {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
}

function getTransferConfig(title: string): TypeConfig {
  const t = title.toLowerCase();
  if (t.includes("received") || t.includes("money received")) {
    return { icon: ArrowDownLeft, iconColor: "text-green-600", iconBg: "bg-green-50", label: "received" };
  }
  if (t.includes("sent") || t.includes("submitted")) {
    return { icon: ArrowUpRight, iconColor: "text-[#DB0011]", iconBg: "bg-red-50", label: "sent" };
  }
  if (t.includes("scheduled") || t.includes("pending")) {
    return { icon: Clock, iconColor: "text-amber-600", iconBg: "bg-amber-50", label: "transfer" };
  }
  return { icon: ArrowLeftRight, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "transfer" };
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  SECURITY:    { icon: Shield,       iconColor: "text-amber-600",  iconBg: "bg-amber-50",  label: "security"     },
  SYSTEM:      { icon: Info,         iconColor: "text-[#767676]",  iconBg: "bg-[#F8F8F8]", label: "system"       },
  LOAN:        { icon: CreditCard,   iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "loan"         },
  MARKETING:   { icon: Gift,         iconColor: "text-pink-600",   iconBg: "bg-pink-50",   label: "offer"        },
  TRANSACTION: { icon: ArrowLeftRight, iconColor: "text-blue-600", iconBg: "bg-blue-50",   label: "transaction"  },
};

const FALLBACK_CONFIG: TypeConfig = {
  icon: Bell, iconColor: "text-[#767676]", iconBg: "bg-[#F8F8F8]", label: "alert",
};

// Extract a currency amount from notification body (e.g. "£5,000.00" or "$50.00")
function extractAmount(body: string): string | null {
  const match = body.match(/[£$€₦¥][\d,]+\.?\d*/);
  return match ? match[0] : null;
}

// ── Date grouping ─────────────────────────────────────────────────────────────

function getGroup(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d))     return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d))  return "This week";
  return "Earlier";
}

const GROUP_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    notificationsApi
      .list()
      .then((r) => setNotifications(r.data.data))
      .catch(() => setError("Could not load notifications."))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch { /* silent */ }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* silent */ } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getGroup(n.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-6 pb-14 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              <CheckCheck size={13} />
              {markingAll ? "Marking…" : "Mark all read"}
            </button>
          )}
        </div>
        {!loading && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold">{notifications.length}</p>
              <p className="text-white/40 text-xs">Total</p>
            </div>
            {unreadCount > 0 && (
              <>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-xl font-bold text-white">{unreadCount}</p>
                  <p className="text-white/40 text-xs">Unread</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#DB0011]">{error}</p>
        </div>
      )}

      <div className="-mt-8 mx-4 bg-white rounded-2xl shadow-lg border border-[#E8E8E8] overflow-hidden">
        {loading ? (
          <SkeletonList count={8} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} className="text-[#E3E3E3]" />}
            title="All caught up"
            description="New notifications will appear here."
          />
        ) : (
          <div>
            {GROUP_ORDER.filter((g) => grouped[g]?.length).map((group) => (
              <div key={group}>
                <div className="px-4 py-2.5 bg-[#F8F8F8] border-b border-[#EFEFEF]">
                  <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">
                    {group}
                  </p>
                </div>

                {grouped[group].map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onMarkRead={() => markRead(n.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── NotificationRow ───────────────────────────────────────────────────────────

function NotificationRow({
  notification: n,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const config =
    n.type === "TRANSFER"
      ? getTransferConfig(n.title)
      : (TYPE_CONFIG[n.type] ?? FALLBACK_CONFIG);

  const Icon = config.icon;
  const amount = extractAmount(n.body);

  // Determine if this is a credit (incoming money) based on title keywords
  const isIncoming =
    n.title.toLowerCase().includes("received") ||
    n.title.toLowerCase().includes("money received");

  return (
    <button
      onClick={n.isRead ? undefined : onMarkRead}
      className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-[#E3E3E3] last:border-0 transition-colors ${
        !n.isRead
          ? "bg-white hover:bg-[#FAFAFA] border-l-4 border-l-[#DB0011]"
          : "bg-white hover:bg-[#F8F8F8] border-l-4 border-l-transparent"
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
        <Icon size={18} className={config.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className={`text-sm leading-snug flex-1 min-w-0 ${!n.isRead ? "font-semibold text-[#333333]" : "font-medium text-[#555555]"}`}>
            {n.title}
          </p>
          {/* Highlighted amount pill */}
          {amount && (
            <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
              isIncoming
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-[#DB0011]"
            }`}>
              {isIncoming ? "+" : "−"}{amount}
            </span>
          )}
        </div>

        <p className="text-xs text-[#767676] line-clamp-2 leading-relaxed">
          {n.body}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-sm ${config.iconBg} ${config.iconColor}`}>
            {config.label}
          </span>
          <span className="text-[10px] text-[#AAAAAA]">
            {formatRelativeDate(n.createdAt)}
          </span>
          {!n.isRead && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#DB0011] flex-shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
