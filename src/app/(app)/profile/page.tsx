"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Shield, ChevronRight,
  LogOut, Lock, Smartphone, HelpCircle, BadgeCheck,
  Star, type LucideIcon, FileCheck,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { kycApi } from "@/lib/api";

const NOTIF_KEY = "lumina_notif_settings";

function loadNotifSettings() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "null"); } catch { return null; }
}

function GenderAvatarLarge({ gender }: { gender?: string }) {
  if (gender === "MALE") return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4.5" fill="white" />
      <path d="M3.5 22c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5" fill="white" />
    </svg>
  );
  if (gender === "FEMALE") return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4.5" fill="white" />
      <path d="M8 4.5C8 2.5 9.8 1 12 1s4 1.5 4 3.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M4.5 22c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" fill="white" />
    </svg>
  );
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4.5" fill="white" />
      <path d="M3.5 22c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5" fill="white" />
    </svg>
  );
}

// ── Icon cell ─────────────────────────────────────────────────────────────────

function IconCell({
  icon: Icon,
  bg,
  color,
}: {
  icon: LucideIcon;
  bg: string;
  color: string;
}) {
  return (
    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon size={17} className={color} />
    </div>
  );
}

// ── Menu row ──────────────────────────────────────────────────────────────────

function MenuRow({
  icon,
  bg,
  color,
  label,
  badge,
  onClick,
}: {
  icon: LucideIcon;
  bg: string;
  color: string;
  label: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors"
    >
      <IconCell icon={icon} bg={bg} color={color} />
      <span className="flex-1 text-sm text-[#333333] text-left">{label}</span>
      {badge && (
        <span className="text-xs text-[#767676] bg-[#F0F0F0] px-2 py-0.5 rounded-full mr-1">
          {badge}
        </span>
      )}
      <ChevronRight size={16} className="text-[#C0C0C0] flex-shrink-0" />
    </button>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#DB0011]" : "bg-[#D0D0D0]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#E8E8E8] shadow-sm overflow-hidden mx-4 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#F0F0F0] mx-4" />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [notifSettings, setNotifSettings] = useState({
    transactions: true,
    security: true,
    marketing: false,
    statements: true,
  });

  useEffect(() => {
    const saved = loadNotifSettings();
    if (saved) setNotifSettings((prev) => ({ ...prev, ...saved }));
    kycApi.status().then((r) => setKycStatus(r.data.data.status)).catch(() => {});
  }, []);

  function toggleNotif(key: keyof typeof notifSettings) {
    setNotifSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-[#DB0011] via-[#C4000F] to-[#8B000A] px-4 pt-8 pb-16">
        <div className="flex flex-col items-center gap-3">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-white/25 border-2 border-white/50 flex items-center justify-center shadow-lg">
            <GenderAvatarLarge gender={user?.gender} />
          </div>

          {/* Name + email */}
          {user && (
            <div className="text-center">
              <p className="text-white text-xl font-bold tracking-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-white/70 text-sm mt-0.5">{user.email}</p>
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 bg-white/15 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <Star size={10} className="fill-white" />
              Premium
            </span>
            <span className="flex items-center gap-1 bg-green-500/20 border border-green-300/30 text-green-100 text-xs font-semibold px-2.5 py-1 rounded-full">
              <BadgeCheck size={11} />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── Floating info card (overlaps header) ── */}
      <div className="-mt-10 space-y-3">
        <Card>
          <CardHeader label="Personal information" />
          <div className="px-4 pb-4 space-y-3.5">
            <InfoRow icon={User} label="Full name" value={user ? `${user.firstName} ${user.lastName}` : "—"} />
            <Divider />
            <InfoRow icon={Mail} label="Email address" value={user?.email ?? "—"} />
            <Divider />
            <InfoRow icon={Phone} label="Phone number" value={user?.phone ?? "Not set"} />
          </div>
        </Card>

        {/* ── Security ── */}
        <Card>
          <CardHeader label="Security" />
          <MenuRow
            icon={Lock}
            bg="bg-red-100"
            color="text-[#DB0011]"
            label="Change password"
          />
          <Divider />
          <MenuRow
            icon={Shield}
            bg="bg-amber-100"
            color="text-amber-600"
            label="Two-factor authentication"
            badge={(user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ? "On" : "Off"}
            onClick={() => router.push("/profile/2fa")}
          />
          <Divider />
          <MenuRow
            icon={FileCheck}
            bg="bg-green-100"
            color="text-green-600"
            label="Identity verification (KYC)"
            badge={kycStatus === "VERIFIED" ? "Verified" : kycStatus === "PENDING" ? "Pending" : "Required"}
            onClick={() => router.push("/kyc")}
          />
          <Divider />
          <MenuRow
            icon={Smartphone}
            bg="bg-blue-100"
            color="text-blue-600"
            label="Trusted devices"
          />
        </Card>

        {/* ── Notifications ── */}
        <Card>
          <CardHeader label="Notifications" />
          <div className="px-4 pb-3 space-y-0">
            {(
              [
                { key: "transactions", label: "Transaction alerts",   hint: "Debits and credits on your accounts" },
                { key: "security",     label: "Security alerts",      hint: "Sign-ins and password changes" },
                { key: "marketing",    label: "Offers & promotions",  hint: "Deals and product updates" },
                { key: "statements",   label: "Monthly statements",   hint: "Your end-of-month summary" },
              ] as { key: keyof typeof notifSettings; label: string; hint: string }[]
            ).map(({ key, label, hint }, i, arr) => (
              <div key={key}>
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-[#333333]">{label}</p>
                    <p className="text-xs text-[#AAAAAA] mt-0.5">{hint}</p>
                  </div>
                  <Toggle
                    checked={notifSettings[key]}
                    onChange={() => toggleNotif(key)}
                  />
                </div>
                {i < arr.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </Card>

        {/* ── Support ── */}
        <Card>
          <CardHeader label="Support" />
          <MenuRow
            icon={HelpCircle}
            bg="bg-[#F0F0F0]"
            color="text-[#767676]"
            label="Help & support"
          />
        </Card>

        {/* ── Sign out ── */}
        <div className="mx-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-semibold hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        {/* ── App info ── */}
        <p className="text-center text-[10px] text-[#CCCCCC] pt-1">
          Lumina Bank · v1.0.0 · © 2026
        </p>
      </div>
    </div>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-[#F8F8F8] border border-[#EEEEEE] flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-[#767676]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-[#AAAAAA] uppercase tracking-wide">{label}</p>
        <p className="text-sm text-[#333333] font-medium mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
